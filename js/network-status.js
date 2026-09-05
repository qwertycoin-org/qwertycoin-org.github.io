const statusRoot = document.querySelector("[data-network-status]");
const labels = window.QWC_NETWORK_LABELS || {};

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

async function loadNetworkStatus() {
  if (!statusRoot) return;

  try {
    const [infoResponse, eposeResponse] = await Promise.all([
      fetch("https://explorer.qwertycoin.org/qwc-rpc/json_rpc", {
        method: "POST",
        body: JSON.stringify({ jsonrpc: "2.0", id: "status", method: "get_info" })
      }),
      fetch("https://explorer.qwertycoin.org/api/epose")
    ]);

    if (!infoResponse.ok || !eposeResponse.ok) {
      throw new Error("Network status endpoint failed");
    }

    const info = (await infoResponse.json()).result;
    const epose = (await eposeResponse.json()).data;

    setValue("height", String(info.height ?? "unknown"));
    setValue("sync", Boolean(info.synchronized) ? label("synchronized", "synchronized") : label("syncPending", "sync pending"));
    setValue("nettype", info.nettype || (info.mainnet ? "mainnet" : "unknown"));
    setValue("top-hash", info.top_block_hash || "unknown");
    setValue("epoch", String(epose.current_epoch ?? "unknown"));
    setValue("service-nodes", String(epose.service_node_count ?? "unknown"));
    setValue("qualified", String(epose.qualified_count ?? "unknown"));
    setValue("epose-hash", epose.state_hash || "unknown");
    const registeredCount = Number(epose.service_node_count);
    const qualifiedCount = Number(epose.qualified_count);
    if (Number.isFinite(registeredCount) && Number.isFinite(qualifiedCount)) {
      setValue("qualification-ratio", interpolate(label("ratio", "{qualified} / {registered} qualified"), {
        qualified: qualifiedCount,
        registered: registeredCount
      }));
    }
    statusRoot.dataset.state = "ready";
  } catch (error) {
    setValue("height", label("unavailable", "temporarily unavailable"));
    setValue("epoch", label("unknown", "unknown"));
    setValue("service-nodes", label("unknown", "unknown"));
    setValue("qualified", label("unknown", "unknown"));
    setValue("sync", label("unknown", "unknown"));
    statusRoot.dataset.state = "error";
  }
}

loadNetworkStatus();
