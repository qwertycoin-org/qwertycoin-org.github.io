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

function isValidHash(value) {
  return typeof value === "string" && /^[0-9a-f]{64}$/i.test(value);
}

function getEposeData(payload) {
  const epose = payload?.data;
  const epochLength = Number(config.epochLengthBlocks);
  const protocolVersion = Number(config.protocolVersion);

  if (payload?.status !== "success" || !epose || typeof epose !== "object") {
    throw new Error("Invalid explorer EPoSE response");
  }
  if (!Number.isSafeInteger(epochLength) || epochLength <= 0
      || !Number.isSafeInteger(protocolVersion) || protocolVersion <= 0
      || epose.enabled !== true
      || epose.protocol_version !== protocolVersion
      || !isValidBlockHeight(epose.current_epoch)
      || !Number.isSafeInteger(epose.current_epoch * epochLength)
      || !isValidBlockHeight(epose.epoch_start_height)
      || !isValidBlockHeight(epose.epoch_end_height)
      || epose.epoch_start_height !== epose.current_epoch * epochLength
      || !Number.isSafeInteger(epose.epoch_start_height + epochLength - 1)
      || epose.epoch_end_height !== epose.epoch_start_height + epochLength - 1
      || !isValidBlockHeight(epose.service_node_count)
      || !isValidBlockHeight(epose.qualified_count)
      || epose.qualified_count > epose.service_node_count
      || epose.qualification_availability !== "current"
      || epose.snapshot_consistency !== "anchored"
      || !Number.isSafeInteger(epose.snapshot_block_count)
      || epose.snapshot_block_count <= 0
      || !isValidBlockHeight(epose.snapshot_tip_height)
      || epose.snapshot_block_count !== epose.snapshot_tip_height + 1
      || epose.observer_block_count !== epose.snapshot_block_count
      || epose.observer_tip_height !== epose.snapshot_tip_height
      || epose.snapshot_tip_height < epose.epoch_start_height
      || epose.snapshot_tip_height > epose.epoch_end_height
      || !isValidHash(epose.snapshot_tip_hash)
      || !isValidHash(epose.state_hash)) {
    throw new Error("Unverified explorer EPoSE snapshot");
  }
  return epose;
}

async function loadNetworkStatus() {
  if (!statusRoot) return;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const [identityResult, eposeResult] = await Promise.allSettled([
      fetch("https://explorer.qwertycoin.org/api/v1/identity", {
        signal: controller.signal
      }),
      fetch("https://explorer.qwertycoin.org/api/v1/epose", {
        signal: controller.signal
      })
    ]);

    let hasIdentity = false;
    let hasEpose = false;

    if (identityResult.status === "fulfilled" && identityResult.value.ok) {
      try {
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
      } catch {
        hasIdentity = false;
      }
    }

    if (eposeResult.status === "fulfilled" && eposeResult.value.ok) {
      try {
        const epose = getEposeData(await eposeResult.value.json());
        hasEpose = true;

        setValue("epoch", String(epose.current_epoch));
        setValue("service-nodes", String(epose.service_node_count));
        setValue("qualified", String(epose.qualified_count));
        setValue("epose-hash", epose.state_hash);
        setValue("qualification-ratio", interpolate(label("ratio", "{qualified} / {registered} qualified"), {
          qualified: epose.qualified_count,
          registered: epose.service_node_count
        }));
      } catch {
        hasEpose = false;
      }
    }

    if (!hasEpose) {
      setValue("service-nodes", emptyValue);
      setValue("qualified", emptyValue);
      setValue("epose-hash", emptyValue);
      setValue("qualification-ratio", label("eposeUnavailable", "EPoSE observer unavailable"));
    }

    if (!hasIdentity && !hasEpose) {
      throw new Error("Network status endpoints failed");
    }

    if (!hasIdentity) {
      setValue("height", emptyValue);
      setValue("sync", label("unavailable", "currently unavailable"));
      setValue("nettype", emptyValue);
      setValue("top-hash", emptyValue);
    }

    setValue("updated-at", interpolate(label("updated", "updated {time}"), {
      time: new Date().toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
    }));
    statusRoot.dataset.state = hasIdentity && hasEpose ? "ready" : "partial";
    setStatusMessage(hasIdentity && hasEpose ? "" : label("partial", "partial data"));
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
    getEposeData,
    getIdentityData,
    isValidHash,
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
