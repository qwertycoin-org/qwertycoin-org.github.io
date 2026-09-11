import { readFile } from "node:fs/promises";
import vm from "node:vm";

const script = await readFile(new URL("../js/network-status.js", import.meta.url), "utf8");
const labels = {
  synchronized: "synchronisiert",
  syncPending: "Synchronisierung ausstehend",
  unavailable: "Daten derzeit nicht verfügbar",
  partial: "Basisdaten verfügbar; EPoSe-Statistiken derzeit nicht verfügbar",
  updated: "Aktualisiert: {time}",
  eposeUnavailable: "EPoSe-Statistiken derzeit nicht verfügbar"
};

function createElement(textContent = "") {
  return {
    textContent,
    hidden: false,
    dataset: {},
    attributes: {},
    setAttribute(name, value) {
      this.attributes[name] = value;
    }
  };
}

function createHarness(fetchImpl) {
  const statusRoot = createElement();
  const statusMessage = createElement();
  const statusElements = new Map();
  const networkDataElement = createElement(JSON.stringify({
    locale: "de",
    labels,
    config: { epochLengthBlocks: 720 }
  }));

  function elementsFor(name) {
    if (!statusElements.has(name)) statusElements.set(name, [createElement()]);
    return statusElements.get(name);
  }

  const document = {
    readyState: "complete",
    documentElement: { lang: "de" },
    getElementById(id) {
      return id === "qwc-network-data" ? networkDataElement : null;
    },
    querySelector(selector) {
      if (selector === "[data-network-status]") return statusRoot;
      if (selector === "[data-status-message]") return statusMessage;
      return null;
    },
    querySelectorAll(selector) {
      const match = selector.match(/^\[data-status="([^"]+)"\]$/);
      return match ? elementsFor(match[1]) : [];
    }
  };

  const context = {
    AbortController,
    document,
    fetch: fetchImpl,
    window: {
      QWC_DISABLE_AUTO_STATUS: true,
      addEventListener() {},
      clearTimeout() {},
      setTimeout(callback) {
        callback();
        return 0;
      }
    }
  };
  context.window.document = document;
  context.window.fetch = fetchImpl;

  vm.createContext(context);
  vm.runInContext(script, context, { filename: "network-status.js" });

  return {
    api: context.window.__QWC_NETWORK_STATUS_TEST__,
    statusRoot,
    statusMessage,
    value(name) {
      return elementsFor(name)[0].textContent;
    }
  };
}

function response(payload, ok = true) {
  return {
    ok,
    async json() {
      return payload;
    }
  };
}

async function runScenario(name, fetchImpl) {
  const harness = createHarness(fetchImpl);
  await harness.api.loadNetworkStatus();
  return harness;
}

let requestedUrl;
let requestedOptions;
const valid = await runScenario("valid", async (url, options) => {
  requestedUrl = url;
  requestedOptions = options;
  return response({
    status: "success",
    data: {
      block_count: 1505,
      tip_height: 1504,
      network: "mainnet",
      compatible: true,
      snapshot_current: true,
      rpc_db_anchor_matches: true,
      chain_anchor: {
        height: 1504,
        hash: "a".repeat(64)
      }
    }
  });
});

if (requestedUrl !== "https://explorer.qwertycoin.org/api/v1/identity"
    || requestedOptions?.method === "POST"
    || requestedOptions?.body) {
  throw new Error("Network status must use the public read-only identity API");
}

if (valid.value("height") !== "1505" || valid.value("epoch") !== "2"
    || valid.value("top-hash") !== "a".repeat(64)) {
  throw new Error("Valid identity response should render height, epoch and tip hash");
}
if (valid.value("nettype") !== "mainnet" || valid.value("sync") !== labels.synchronized) {
  throw new Error("Valid identity response should render verified Mainnet state");
}
if (!valid.value("updated-at").startsWith("Aktualisiert:")) {
  throw new Error("Valid identity response should render localized update time");
}
if (!valid.statusMessage.textContent.includes("Basisdaten verfügbar")) {
  throw new Error("Partial data should render a visible localized status message");
}

const validIdentity = {
  status: "success",
  data: {
    block_count: 1505,
    tip_height: 1504,
    network: "mainnet",
    compatible: true,
    snapshot_current: true,
    rpc_db_anchor_matches: true,
    chain_anchor: {
      height: 1504,
      hash: "b".repeat(64)
    }
  }
};

for (const [name, fetchImpl] of [
  ["http-error", async () => response({}, false)],
  ["error-status", async () => response({ status: "error", data: validIdentity.data })],
  ["missing-data", async () => response({ status: "success" })],
  ["height-null", async () => response({ ...validIdentity, data: { ...validIdentity.data, block_count: null } })],
  ["height-negative", async () => response({ ...validIdentity, data: { ...validIdentity.data, tip_height: -1 } })],
  ["height-string", async () => response({ ...validIdentity, data: { ...validIdentity.data, block_count: "1505" } })],
  ["height-mismatch", async () => response({ ...validIdentity, data: { ...validIdentity.data, block_count: 1506 } })],
  ["wrong-network", async () => response({ ...validIdentity, data: { ...validIdentity.data, network: "testnet" } })],
  ["incompatible", async () => response({ ...validIdentity, data: { ...validIdentity.data, compatible: false } })],
  ["stale", async () => response({ ...validIdentity, data: { ...validIdentity.data, snapshot_current: false } })],
  ["anchor-mismatch", async () => response({ ...validIdentity, data: { ...validIdentity.data, rpc_db_anchor_matches: false } })],
  ["invalid-hash", async () => response({ ...validIdentity, data: { ...validIdentity.data, chain_anchor: { height: 1504, hash: "abc" } } })],
  ["timeout", async () => { throw new DOMException("The operation was aborted.", "AbortError"); }]
]) {
  const harness = await runScenario(name, fetchImpl);
  if (harness.value("height") !== "—" || harness.value("epoch") !== "—") {
    throw new Error(`${name} should not render invented height or epoch`);
  }
  if (harness.value("updated-at") !== labels.unavailable || harness.statusRoot.dataset.state !== "error") {
    throw new Error(`${name} should render a localized unavailable state`);
  }
}

console.log("QWC network status checks passed");
