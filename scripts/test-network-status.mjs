import { readFile } from "node:fs/promises";
import vm from "node:vm";

const script = await readFile(new URL("../js/network-status.js", import.meta.url), "utf8");
const identityUrl = "https://explorer.qwertycoin.org/api/v1/identity";
const eposeUrl = "https://explorer.qwertycoin.org/api/v1/epose";
const labels = {
  synchronized: "synchronisiert",
  syncPending: "Synchronisierung ausstehend",
  unavailable: "Daten derzeit nicht verfügbar",
  partial: "Ein Teil der Netzwerkdaten ist derzeit nicht verfügbar",
  updated: "Aktualisiert: {time}",
  eposeUnavailable: "EPoSe-Statistiken derzeit nicht verfügbar",
  ratio: "{qualified} / {registered} qualifiziert"
};

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
      hash: "a".repeat(64)
    }
  }
};

const validEpose = {
  status: "success",
  data: {
    enabled: true,
    protocol_version: 2,
    current_epoch: 2,
    epoch_start_height: 1440,
    epoch_end_height: 2159,
    service_node_count: 10,
    qualified_count: 6,
    qualification_availability: "current",
    observer_block_count: 1505,
    observer_tip_height: 1504,
    snapshot_block_count: 1505,
    snapshot_tip_height: 1504,
    snapshot_tip_hash: "b".repeat(64),
    snapshot_consistency: "anchored",
    state_hash: "c".repeat(64)
  }
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
    config: { epochLengthBlocks: 720, protocolVersion: 2 }
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

function routeFetch(identityResponse, eposeResponse, requests = []) {
  return async (url, options) => {
    requests.push({ url, options });
    if (url === identityUrl) return identityResponse;
    if (url === eposeUrl) return eposeResponse;
    throw new Error(`Unexpected URL: ${url}`);
  };
}

async function runScenario(identityResponse, eposeResponse, requests = []) {
  const harness = createHarness(routeFetch(identityResponse, eposeResponse, requests));
  await harness.api.loadNetworkStatus();
  return harness;
}

function withEpose(changes) {
  return {
    ...validEpose,
    data: { ...validEpose.data, ...changes }
  };
}

const requests = [];
const valid = await runScenario(response(validIdentity), response(validEpose), requests);

if (requests.length !== 2
    || requests[0].url !== identityUrl
    || requests[1].url !== eposeUrl
    || requests.some(({ options }) => options?.method === "POST" || options?.body)) {
  throw new Error("Network status must use both public read-only status APIs");
}
if (valid.value("height") !== "1505" || valid.value("epoch") !== "2"
    || valid.value("top-hash") !== "a".repeat(64)) {
  throw new Error("Valid identity response should render height, epoch and tip hash");
}
if (valid.value("service-nodes") !== "10" || valid.value("qualified") !== "6"
    || valid.value("epose-hash") !== "c".repeat(64)
    || valid.value("qualification-ratio") !== "6 / 10 qualifiziert") {
  throw new Error("Valid anchored EPoSE response should render all service statistics");
}
if (valid.value("nettype") !== "mainnet" || valid.value("sync") !== labels.synchronized) {
  throw new Error("Valid identity response should render verified Mainnet state");
}
if (!valid.value("updated-at").startsWith("Aktualisiert:")) {
  throw new Error("Valid responses should render localized update time");
}
if (valid.statusRoot.dataset.state !== "ready"
    || valid.statusMessage.textContent !== "" || valid.statusMessage.hidden !== true) {
  throw new Error("Complete network data should render the ready state without a warning");
}

const zeroQualified = await runScenario(
  response(validIdentity),
  response(withEpose({ qualified_count: 0 }))
);
if (zeroQualified.value("qualified") !== "0"
    || zeroQualified.value("qualification-ratio") !== "0 / 10 qualifiziert") {
  throw new Error("A valid zero qualified count must remain visible");
}

for (const [name, eposeResponse] of [
  ["http-error", response({}, false)],
  ["error-status", response({ status: "error", data: validEpose.data })],
  ["missing-data", response({ status: "success" })],
  ["disabled", response(withEpose({ enabled: false }))],
  ["wrong-protocol", response(withEpose({ protocol_version: 3 }))],
  ["epoch-string", response(withEpose({ current_epoch: "2" }))],
  ["epoch-start-mismatch", response(withEpose({ epoch_start_height: 1439 }))],
  ["epoch-end-mismatch", response(withEpose({ epoch_end_height: 2160 }))],
  ["service-count-string", response(withEpose({ service_node_count: "10" }))],
  ["qualified-over-total", response(withEpose({ qualified_count: 11 }))],
  ["qualification-stale", response(withEpose({ qualification_availability: "stale" }))],
  ["unanchored", response(withEpose({ snapshot_consistency: "unanchored" }))],
  ["snapshot-height-mismatch", response(withEpose({ snapshot_block_count: 1506 }))],
  ["observer-height-mismatch", response(withEpose({ observer_tip_height: 1503 }))],
  ["snapshot-outside-epoch", response(withEpose({ snapshot_tip_height: 1439, snapshot_block_count: 1440, observer_tip_height: 1439, observer_block_count: 1440 }))],
  ["invalid-tip-hash", response(withEpose({ snapshot_tip_hash: "abc" }))],
  ["invalid-state-hash", response(withEpose({ state_hash: "abc" }))],
  ["timeout", Promise.reject(new DOMException("The operation was aborted.", "AbortError"))]
]) {
  const harness = await runScenario(response(validIdentity), eposeResponse);
  if (harness.value("height") !== "1505" || harness.value("epoch") !== "2") {
    throw new Error(`${name} must preserve valid identity and derived epoch data`);
  }
  if (harness.value("service-nodes") !== "—" || harness.value("qualified") !== "—"
      || harness.value("epose-hash") !== "—") {
    throw new Error(`${name} must not render unverified EPoSE data`);
  }
  if (harness.statusRoot.dataset.state !== "partial"
      || harness.statusMessage.textContent !== labels.partial) {
    throw new Error(`${name} should render a localized partial state`);
  }
}

for (const [name, identityResponse] of [
  ["identity-http-error", response({}, false)],
  ["identity-error-status", response({ status: "error", data: validIdentity.data })],
  ["identity-height-string", response({ ...validIdentity, data: { ...validIdentity.data, block_count: "1505" } })],
  ["identity-height-mismatch", response({ ...validIdentity, data: { ...validIdentity.data, block_count: 1506 } })],
  ["identity-wrong-network", response({ ...validIdentity, data: { ...validIdentity.data, network: "testnet" } })],
  ["identity-incompatible", response({ ...validIdentity, data: { ...validIdentity.data, compatible: false } })],
  ["identity-stale", response({ ...validIdentity, data: { ...validIdentity.data, snapshot_current: false } })],
  ["identity-anchor-mismatch", response({ ...validIdentity, data: { ...validIdentity.data, rpc_db_anchor_matches: false } })],
  ["identity-invalid-hash", response({ ...validIdentity, data: { ...validIdentity.data, chain_anchor: { height: 1504, hash: "abc" } } })]
]) {
  const harness = await runScenario(identityResponse, response(validEpose));
  if (harness.value("height") !== "—" || harness.value("top-hash") !== "—") {
    throw new Error(`${name} must not render unverified identity data`);
  }
  if (harness.value("epoch") !== "2" || harness.value("service-nodes") !== "10"
      || harness.value("qualified") !== "6") {
    throw new Error(`${name} must preserve independently anchored EPoSE data`);
  }
  if (harness.statusRoot.dataset.state !== "partial") {
    throw new Error(`${name} should render a partial state`);
  }
}

const unavailable = await runScenario(response({}, false), response({}, false));
if (unavailable.value("height") !== "—" || unavailable.value("epoch") !== "—"
    || unavailable.value("service-nodes") !== "—" || unavailable.value("qualified") !== "—") {
  throw new Error("Unavailable endpoints must not render invented network data");
}
if (unavailable.value("updated-at") !== labels.unavailable
    || unavailable.statusRoot.dataset.state !== "error"
    || unavailable.statusMessage.textContent !== labels.unavailable) {
  throw new Error("Unavailable endpoints should render a localized error state");
}

console.log("QWC network status checks passed");
