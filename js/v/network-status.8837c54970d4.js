const statusRoot = document.querySelector("[data-network-status]");
const statusMessage = document.querySelector("[data-status-message]");
const networkDataElement = document.getElementById("qwc-network-data");
let networkData = {};

try {
  networkData = networkDataElement?.textContent ? JSON.parse(networkDataElement.textContent) : {};
} catch {
  networkData = {};
}

const locale = networkData.locale || document.documentElement.lang || "en";
const labels = networkData.labels || {};
const config = networkData.config || {};
const timeoutMs = 8000;
const emptyValue = "—";

function setStatusMessage(value = "") {
  if (!statusMessage) return;
  statusMessage.textContent = value;
  statusMessage.hidden = !value;
}

function setValue(name, value) {
  for (const element of document.querySelectorAll(`[data-status="${name}"]`)) {
    element.textContent = value;
  }
}

function label(name, fallback) {
  return labels[name] || fallback;
}

function interpolate(value, params) {
  return String(value).replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => params[key] ?? `{${key}}`);
}

function isValidBlockHeight(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function getIdentityData(payload) {
  const identity = payload?.data;
  if (payload?.status !== "success" || !identity || typeof identity !== "object") {
    throw new Error("Invalid explorer identity response");
  }
  if (!isValidBlockHeight(identity.block_count)
      || !isValidBlockHeight(identity.tip_height)
      || identity.block_count !== identity.tip_height + 1
      || identity.network !== "mainnet"
      || identity.compatible !== true
      || identity.snapshot_current !== true
      || identity.rpc_db_anchor_matches !== true
      || identity.chain_anchor?.height !== identity.tip_height
      || !/^[0-9a-f]{64}$/i.test(identity.chain_anchor?.hash || "")) {
    throw new Error("Unverified explorer identity");
  }
  return identity;
}

async function loadNetworkStatus() {
  if (!statusRoot) return;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const [identityResult] = await Promise.allSettled([
      fetch("https://explorer.qwertycoin.org/api/v1/identity", {
        signal: controller.signal
      })
    ]);

    let hasIdentity = false;

    if (identityResult.status === "fulfilled" && identityResult.value.ok) {
      const identity = getIdentityData(await identityResult.value.json());
      hasIdentity = true;

      setValue("height", String(identity.block_count));
      setValue("sync", label("synchronized", "synchronized"));
      setValue("nettype", identity.network);
      setValue("top-hash", identity.chain_anchor.hash);

      const epochLength = Number(config.epochLengthBlocks);
      if (Number.isSafeInteger(epochLength) && epochLength > 0) {
        setValue("epoch", String(Math.floor(identity.tip_height / epochLength)));
      } else {
        setValue("epoch", emptyValue);
      }

      setValue("service-nodes", emptyValue);
      setValue("qualified", emptyValue);
      setValue("epose-hash", emptyValue);
      setValue("qualification-ratio", label("eposeUnavailable", "EPoSe observer unavailable"));
    }

    if (!hasIdentity) {
      throw new Error("Network status endpoints failed");
    }

    setValue("updated-at", interpolate(label("updated", "updated {time}"), {
      time: new Date().toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
    }));
    statusRoot.dataset.state = "partial";
    setStatusMessage(label("partial", "partial data"));
  } catch (error) {
    setValue("height", emptyValue);
    setValue("epoch", emptyValue);
    setValue("service-nodes", emptyValue);
    setValue("qualified", emptyValue);
    setValue("sync", label("unavailable", "currently unavailable"));
    setValue("updated-at", label("unavailable", "currently unavailable"));
    setValue("top-hash", emptyValue);
    setValue("epose-hash", emptyValue);
    setValue("qualification-ratio", label("unavailable", "currently unavailable"));
    statusRoot.dataset.state = "error";
    setStatusMessage(label("unavailable", "currently unavailable"));
  } finally {
    window.clearTimeout(timeout);
  }
}

if (typeof window !== "undefined") {
  window.__QWC_NETWORK_STATUS_TEST__ = {
    getIdentityData,
    isValidBlockHeight,
    loadNetworkStatus
  };

  if (!window.QWC_DISABLE_AUTO_STATUS) {
    if (document.readyState === "complete") {
      window.setTimeout(loadNetworkStatus, 0);
    } else {
      window.addEventListener("load", () => window.setTimeout(loadNetworkStatus, 0), { once: true });
    }
  }
}
