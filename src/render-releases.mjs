// Download destinations and displayed versions come from the reviewed /get rules.
const copy = {
  en: {
    title: "Download Qwertycoin | Wallet & Core releases",
    description: "Get the Qwertycoin desktop wallet, Core tools or official Docker image. Downloads for Windows, Linux and macOS, setup guides and SHA-256 checksums.",
    home: "Home", skip: "Skip to downloads",
    eyebrow: "Official downloads", heading: "Download Qwertycoin.",
    intro: "Choose your operating system. Get the desktop wallet for everyday use, Core for the command line, or the Docker image for your own node.",
    webWalletIntro: "Prefer to use your browser?", webWallet: "Open Web Wallet", webWalletText: "No installation required.",
    gui: "Desktop wallet", guiText: "A graphical app to create or restore a wallet, send and receive QWC, and connect to the network.",
    cli: "Core / command line", cliText: "For node operators and terminal users. Includes qwertycoind, qwertycoin-wallet-cli and qwertycoin-wallet-rpc.",
    docker: "Docker image", dockerText: "Run Qwertycoin Core in a container. The official image includes the daemon, CLI wallet and wallet RPC, with Compose guides for full nodes and EPoSE service nodes.",
    dockerPlatform: "Linux · amd64 (x86_64)", dockerPull: "Pull the official image", dockerVersion: "Check the version",
    dockerSetup: "These commands download the image and check its version. For a persistent node or wallet, follow the Docker quickstart; for an EPoSE node, use the dedicated service-node guide.",
    dockerUpdate: "The latest tag follows the newest stable image. Updating requires pulling the image and recreating the container while preserving chain, wallet and service-identity volumes. Pin an image digest if you need a fixed deployment.",
    dockerHub: "Open Docker Hub", dockerQuickstart: "Docker quickstart", dockerEpose: "EPoSE service-node guide",
    current: "Current download", checksums: "SHA256SUMS", notes: "Release notes", direct: "Direct GitHub downloads",
    windows: "Windows", linux: "Linux", macos: "macOS", silicon: "Apple Silicon · macOS 15+ · not Intel",
    linuxCompat: "x86_64 · GLIBC 2.35 build target", windowsCompat: "x86_64 · unsigned",
    setup: "Download Setup", dmg: "Download DMG", archive: "Download TAR.GZ", zip: "Download ZIP",
    portableZip: "Alternative: portable ZIP", portableTar: "Alternative: TAR.GZ",
    guiSteps: {
      windows: ["Download the Setup EXE and verify its checksum before opening it.", "Run Setup and follow the installation steps. Then open Qwertycoin from the Start menu.", "Using the portable ZIP? Extract the entire archive first, then launch qwertycoin-gui.exe from the extracted folder."],
      linux: ["Download the TAR.GZ archive and verify its checksum.", "Extract the complete archive with your archive manager. Keep the bundled files together.", "Open a terminal in the extracted application folder and run ./qwertycoin-gui."],
      macos: ["Download the DMG for an Apple Silicon Mac and verify its checksum.", "Open the DMG and drag Qwertycoin into Applications. Eject the disk image, then open the app from Applications.", "The TAR.GZ alternative contains the app bundle: extract it and move the app into Applications."]
    },
    cliSteps: {
      windows: ["Download and verify the ZIP, then extract the complete archive.", "Open PowerShell in the extracted program folder. Use .\\qwertycoind.exe --help or .\\qwertycoin-wallet-cli.exe --help to get started."],
      linux: ["Download and verify the TAR.GZ, then extract the complete archive.", "Open a terminal in the extracted program folder. Use ./qwertycoind --help or ./qwertycoin-wallet-cli --help to get started."],
      macos: ["Download and verify the Apple Silicon TAR.GZ, then extract the complete archive.", "Open Terminal in the extracted program folder. Use ./qwertycoind --help or ./qwertycoin-wallet-cli --help to get started."]
    },
    verifyTitle: "Check your download", verifyIntro: "Before opening a package, download SHA256SUMS for the same product and release. Replace PACKAGE below with the downloaded filename and compare the full hash with that file’s entry.",
    verifyNote: "The links on this page move to newer releases. If a release changes between downloads, use the versioned GitHub release matching your package to get its checksum. A matching SHA-256 verifies the bytes, not the publisher’s identity.",
    signingTitle: "About security prompts", signing: "Windows and Linux packages are unsigned. macOS packages are ad-hoc signed and not notarized, so your system may display a warning. Check the source and checksum first; do not disable your antivirus. If macOS blocks a verified app, check System Settings → Privacy & Security after your first launch attempt.",
    backupTitle: "Already have a wallet?", backup: "Back up your wallet and recovery phrase before updating. Never share your recovery phrase. These downloads are for the current QWC network; legacy wallet software and legacy balances are not compatible.",
    shareTitle: "One link. Future releases too.", share: "Save or share this page. Its download buttons point to the latest verified public release offered here, so an older forum or social post remains useful.",
    docs: "Read the documentation", footer: "Qwertycoin · Official release downloads"
  }
};

function html(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export function readReleaseTargets(redirects) {
  const rules = new Map(redirects.split("\n").filter((line) => line.startsWith("/get/")).map((line) => {
    const [source, target, status] = line.trim().split(/\s+/);
    if (status !== "302") throw new Error(`Expected temporary download redirect: ${source}`);
    return [source, target];
  }));
  const products = {};
  for (const product of ["gui", "cli"]) {
    const repo = product === "gui" ? "qwertycoin-gui" : "qwertycoin";
    const notes = rules.get(`/get/${product}/notes`);
    const prefix = `https://github.com/qwertycoin-org/${repo}/releases/tag/`;
    if (!notes?.startsWith(prefix)) throw new Error(`Missing official release notes for ${product}`);
    const version = notes.slice(prefix.length);
    if (!/^v\d+\.\d+\.\d+$/.test(version)) throw new Error(`Expected stable release for ${product}`);
    const suffixes = ["windows", "linux", "macos", "checksums", ...(product === "gui" ? ["windows/portable", "macos/portable"] : [])];
    for (const suffix of suffixes) {
      const source = `/get/${product}/${suffix}`;
      const target = rules.get(source);
      if (!target?.startsWith(`https://github.com/qwertycoin-org/${repo}/releases/download/${version}/`) || rules.get(`${source}/`) !== target) {
        throw new Error(`Download and release versions differ: ${source}`);
      }
    }
    products[product] = { version, notes };
  }
  return products;
}

export function renderReleases(assets, products) {
  const t = copy.en;
  const canonical = "https://qwertycoin.org/releases";
  const home = "/";
  const productSection = (product) => {
    const isGui = product === "gui";
    const cards = ["windows", "macos", "linux"].map((os) => {
      const label = os === "windows" ? (isGui ? t.setup : t.zip) : os === "macos" && isGui ? t.dmg : t.archive;
      const alternative = isGui && os !== "linux" ? `<a class="release-alternative" href="/get/gui/${os}/portable">${html(os === "windows" ? t.portableZip : t.portableTar)}</a>` : "";
      return `<article class="download-card">
        <h3>${t[os]}</h3><p class="download-platform">${html(os === "windows" ? t.windowsCompat : os === "linux" ? t.linuxCompat : t.silicon)}</p>
        <a class="button ${isGui ? "primary" : "secondary"}" href="/get/${product}/${os}" aria-label="${html(`${t[product]} · ${t[os]} · ${label}`)}">${html(label)}</a>
        ${alternative}
        <ol>${t[`${product}Steps`][os].map((step) => `<li>${html(step)}</li>`).join("")}</ol>
      </article>`;
    }).join("\n");
    return `<section class="release-section" id="${product}" aria-labelledby="${product}-title">
      <div class="release-section-heading"><div><p class="eyebrow">${html(t.current)} · ${html(products[product].version)}</p><h2 id="${product}-title">${html(t[product])}</h2><p>${html(t[`${product}Text`])}</p></div><span class="release-product-label" aria-hidden="true">${product.toUpperCase()}</span></div>
      <div class="download-grid">${cards}</div>
      <nav class="release-resources" aria-label="${html(t[product])}"><a href="/get/${product}/checksums">${html(t.checksums)}</a><a href="/get/${product}/notes">${html(t.notes)}</a><a href="${html(products[product].notes)}">${html(t.direct)}</a></nav>
    </section>`;
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${html(t.title)}</title>
  <meta name="description" content="${html(t.description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Qwertycoin">
  <meta property="og:title" content="${html(t.title)}">
  <meta property="og:description" content="${html(t.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:locale" content="en_US">
  <meta property="og:image" content="https://qwertycoin.org/assets/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Qwertycoin">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${html(t.title)}">
  <meta name="twitter:description" content="${html(t.description)}">
  <meta name="twitter:image" content="https://qwertycoin.org/assets/og-image.png">
  <meta name="twitter:image:alt" content="Qwertycoin">
  <link rel="icon" href="/assets/favicon-32x32.png" sizes="32x32">
  <link rel="stylesheet" href="${assets.css}">
  <link rel="stylesheet" href="${assets.releasesCss}">
</head>
<body class="releases-page">
  <a class="skip-link" href="#gui">${html(t.skip)}</a>
  <header class="site-header"><div class="header-inner">
    <a class="brand" href="${home}"><img src="/assets/qwertycoin-mark.svg" alt="" width="42" height="42"><span>Qwertycoin</span></a>
    <a class="release-home" href="/">${html(t.home)}</a>
  </div></header>
  <main class="release-container">
    <section class="release-hero" aria-labelledby="release-title">
      <p class="eyebrow">${html(t.eyebrow)}</p><h1 id="release-title">${html(t.heading)}</h1><p class="release-intro">${html(t.intro)}</p>
      <nav class="release-jumps" aria-label="${html(t.eyebrow)}"><a class="button primary" href="#gui">${html(t.gui)}</a><a class="button secondary" href="#cli">${html(t.cli)}</a><a class="button secondary" href="#docker">${html(t.docker)}</a></nav>
      <p class="release-web-wallet">${html(t.webWalletIntro)} <a href="https://wallet.qwertycoin.org/" target="_blank" rel="noopener noreferrer">${html(t.webWallet)}</a> · ${html(t.webWalletText)}</p>
    </section>
    ${productSection("gui")}
    ${productSection("cli")}
    <section class="release-section" id="docker" aria-labelledby="docker-title">
      <div class="release-section-heading"><div><p class="eyebrow">${html(t.dockerPlatform)}</p><h2 id="docker-title">${html(t.docker)}</h2><p>${html(t.dockerText)}</p></div><span class="release-product-label" aria-hidden="true">DOCKER</span></div>
      <div class="download-card">
        <dl class="checksum-commands"><div><dt>${html(t.dockerPull)}</dt><dd><code>docker pull docker.io/qwertycoin/qwertycoin:latest</code></dd></div><div><dt>${html(t.dockerVersion)}</dt><dd><code>docker run --rm docker.io/qwertycoin/qwertycoin:latest --version</code></dd></div></dl>
        <p>${html(t.dockerSetup)}</p><p>${html(t.dockerUpdate)}</p>
      </div>
      <nav class="release-resources" aria-label="${html(t.docker)}"><a href="https://hub.docker.com/r/qwertycoin/qwertycoin/tags">${html(t.dockerHub)}</a><a href="https://github.com/qwertycoin-org/qwertycoin/blob/main/docker/README.md">${html(t.dockerQuickstart)}</a><a href="https://github.com/qwertycoin-org/qwertycoin/blob/main/docker/README.md#epose-service-node">${html(t.dockerEpose)}</a></nav>
    </section>
    <section class="release-verification" aria-labelledby="verify-title">
      <p class="eyebrow">SHA-256</p><h2 id="verify-title">${html(t.verifyTitle)}</h2><p>${html(t.verifyIntro)}</p>
      <dl class="checksum-commands"><div><dt>Windows · PowerShell</dt><dd><code>Get-FileHash -Algorithm SHA256 .\\PACKAGE</code></dd></div><div><dt>Linux · Terminal</dt><dd><code>sha256sum ./PACKAGE</code></dd></div><div><dt>macOS · Terminal</dt><dd><code>shasum -a 256 ./PACKAGE</code></dd></div></dl>
      <p>${html(t.verifyNote)}</p>
      <details><summary>${html(t.signingTitle)}</summary><p>${html(t.signing)}</p></details>
      <details><summary>${html(t.backupTitle)}</summary><p>${html(t.backup)}</p></details>
    </section>
    <aside class="release-share"><h2>${html(t.shareTitle)}</h2><p>${html(t.share)}</p><a class="release-share-url" href="/releases">qwertycoin.org/releases</a></aside>
  </main>
  <footer class="release-footer"><p>${html(t.footer)}</p><nav aria-label="${html(t.footer)}"><a href="${home}">${html(t.home)}</a><a href="https://docs.qwertycoin.org/">${html(t.docs)}</a></nav></footer>
</body>
</html>
`.replace(/[ \t]+\n/g, "\n");
}
