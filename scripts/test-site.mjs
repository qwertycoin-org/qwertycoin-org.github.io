import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = new URL("..", import.meta.url).pathname;
const dist = path.join(root, "dist");
const index = await readFile(path.join(dist, "index.html"), "utf8");
const germanIndex = await readFile(path.join(dist, "de", "index.html"), "utf8");
const notFound = await readFile(path.join(dist, "404.html"), "utf8");
const css = await readFile(path.join(root, "css", "site.css"), "utf8");
const distCss = await readFile(path.join(dist, "css", "site.css"), "utf8");
const tokens = await readFile(path.join(root, "css", "tokens.css"), "utf8");
const headers = await readFile(path.join(root, "_headers"), "utf8");
const redirects = await readFile(path.join(root, "_redirects"), "utf8");
const middleware = await readFile(path.join(root, "functions", "_middleware.js"), "utf8");
const sitemap = await readFile(path.join(dist, "sitemap.xml"), "utf8");
const llms = await readFile(path.join(dist, "llms.txt"), "utf8");
const eposeFormula = await readFile(path.join(root, "assets", "epose", "epose-consensus-formula.svg"), "utf8");

function assertIncludes(haystack, needle, label = needle) {
  if (!haystack.includes(needle)) throw new Error(`Missing required content: ${label}`);
}

function stripTestPatterns(html) {
  return html
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "")
    .replace(/<script>[\s\S]*?<\/script>/g, "");
}

const requiredEnglish = [
  "Private money. Open network.",
  "Qwertycoin (QWC) is a privacy-focused cryptocurrency with open RandomX mining and EPoSe rewards for proven network services.",
  "Open Web Wallet",
  "QWC MAINNET LIVE",
  "RandomX PoW",
  "EPoSe",
  "QWC Core Network",
  "Rewards for proven service",
  "Web Wallet and open source",
  "qwc-hero-motif.svg",
  "network-strip",
  "epose-compact",
  "Prove service. Earn QWC.",
  "Rewards follow the protocol.",
  "/assets/epose/epose-consensus-formula.svg",
  "Wallets and source code",
  "QWC source code",
  "Network activity",
  "Registered Service Nodes",
  "Qualified Service Nodes",
  "Does EPoSe replace mining?",
  "2019–2023",
  "Build with Qwertycoin.",
  "Open Explorer",
  "application/ld+json",
  'type="application/json" id="qwc-network-data"',
  "/assets/fonts/v/archivo-latin-900."
];

for (const text of requiredEnglish) assertIncludes(index, text);

const requiredGerman = [
  "Private Zahlungen. Offenes Netzwerk.",
  "Qwertycoin (QWC) ist eine Kryptowährung für private Zahlungen mit offenem RandomX-Mining und EPoSe-Vergütungen für nachgewiesene Netzwerkdienste.",
  "Web Wallet öffnen",
  "QWC MAINNET LIVE",
  "Privatsphäre. Mit QWC.",
  "Vergütung für nachgewiesene Dienste",
  "Web Wallet und offener Quellcode",
  "Netzwerkdienste leisten. QWC verdienen.",
  "Das Protokoll regelt die Vergütung.",
  "Transaktionsgebühren verbleiben beim Miner.",
  "Wallets und Quellcode",
  "Netzwerkaktivität",
  "Registrierte Service Nodes",
  "Qualifizierte Service Nodes",
  "Ersetzt EPoSe das Mining?",
  "2019–2023",
  "Entwickle mit Qwertycoin."
];

for (const text of requiredGerman) assertIncludes(germanIndex, text);

const unsafeClaims = [
  "100% anonymous",
  "totally untraceable",
  "unhackable",
  "guaranteed passive income",
  "Moon",
  "Download Wallet",
  "CoinGecko",
  "myqwertycoin.com",
  "bootstrap.min.css",
  "googletagmanager"
];

for (const text of unsafeClaims) {
  if (index.toLowerCase().includes(text.toLowerCase())) {
    throw new Error(`Forbidden legacy/unsafe claim found: ${text}`);
  }
}

const publicPages = [stripTestPatterns(index), stripTestPatterns(germanIndex), llms];
const forbiddenPublicPatterns = [
  /EPoSe\s*(?:v|version)\s*[12]/i,
  /EPoSe\s*[12]\.0/i,
  /QWC[-\s]?v2/i,
  /Sentinel/i,
  /Web Wallet\s+Beta/i,
  /Browser wallet beta/i,
  /Early beta/i,
  /Qwertycoin Releases/i,
  /Release policy/i,
  /2019-2020\+/i,
  /No date theatre/i,
  /Keine Datums-Show/i,
  /release gates/i,
  /intentionally staged/i,
  /transaction path hardened/i,
  /hardening the live network/i
];

for (const page of publicPages) {
  for (const pattern of forbiddenPublicPatterns) {
    if (pattern.test(page)) throw new Error(`Forbidden public wording found: ${pattern}`);
  }
}

for (const page of [index, germanIndex]) {
  const moneroMentions = page.match(/Monero v0\.18\.5\.1/g) || [];
  if (moneroMentions.length > 1) {
    throw new Error(`Expected at most one Monero origin note, found ${moneroMentions.length}`);
  }
}

for (const href of [...index.matchAll(/\shref="([^"]+)"/g)].map((match) => match[1])) {
  if (href.startsWith("#") && !index.includes(`id="${href.slice(1)}"`)) {
    throw new Error(`Broken internal anchor: ${href}`);
  }
}

if (/\ssrc="https?:\/\//.test(index) || /\shref="https?:\/\/[^"]+\.(css|js)"/.test(index)) {
  throw new Error("External scripts or stylesheets are not allowed");
}

if (/<script>(?![\s\S]*application\/ld\+json)[\s\S]*?<\/script>/i.test(index) || /QWC_NETWORK_LABELS|QWC_NETWORK_CONFIG|QWC_LOCALE/.test(index)) {
  throw new Error("Executable inline network configuration is not CSP compliant");
}

if (!`${tokens}\n${css}`.includes("--color-surface") || !`${tokens}\n${css}`.includes("--radius-card")) {
  throw new Error("Design tokens are not loaded into site CSS");
}

for (const contract of [
  ".nav {",
  "min-height: 82px",
  "width: 44px",
  "height: 44px",
  "padding: 10px",
  "border-radius: 0",
  "box-shadow: 4px 4px 0 var(--color-ink)",
  "margin: 4px 0",
  "@media (max-width: 1200px)"
]) {
  assertIncludes(css, contract, `shared navigation contract: ${contract}`);
}

if (distCss.includes("@import")) {
  throw new Error("Built CSS must not rely on render-blocking @import");
}

const cssMatch = index.match(/href="\/css\/v\/site\.([a-f0-9]{12})\.css"/);
const networkJsMatch = index.match(/src="\/js\/v\/network-status\.([a-f0-9]{12})\.js"/);
const navJsMatch = index.match(/src="\/js\/v\/nav-menu\.([a-f0-9]{12})\.js"/);
const fontPreloadMatches = [...index.matchAll(/href="(\/assets\/fonts\/v\/[^"]+\.woff2)"/g)].map((match) => match[1]);

if (!cssMatch || !networkJsMatch || !navJsMatch) {
  throw new Error("Production HTML must reference content-hashed CSS and JS assets");
}

if (fontPreloadMatches.length < 2) {
  throw new Error("Production HTML must preload content-hashed font assets");
}

for (const html of [index, germanIndex, notFound]) {
  if (html.includes('href="/css/site.css"') || html.includes('src="/js/network-status.js"') || html.includes('src="/js/nav-menu.js"')) {
    throw new Error("Generated HTML must not reference stable CSS/JS URLs");
  }
  assertIncludes(html, `/css/v/site.${cssMatch[1]}.css`, "shared hashed CSS reference");
}

if (!index.includes('media="(max-width: 720px)" srcset="/assets/classic/about_bg_img-mobile.svg"')) {
  throw new Error("Network illustration source breakpoint must match the 720px CSS breakpoint");
}

if (!index.includes('data-status-message role="status" aria-live="polite"') || index.includes("data-message")) {
  throw new Error("Network status summary must use a real status element instead of CSS-only data-message content");
}

const cssSources = `${tokens}\n${css}`.toLowerCase();
for (const text of ["#f5f1e7", "#141414", "#ffaf00", "#ffe7a3", "@font-face"]) {
  if (!cssSources.includes(text)) {
    throw new Error(`Missing expected art direction token: ${text}`);
  }
}

if (!/\.epose-note-row\s*\{[^}]*margin-top:\s*var\(--space-5\)/.test(css)) {
  throw new Error("EPoSe summary and note rows must retain their vertical spacing");
}

if (!/\.epose-formula-art\s*\{[^}]*width:\s*min\(100%,\s*960px\)/.test(css)
    || !/\.epose-formula-art img\s*\{[^}]*width:\s*100%[^}]*height:\s*auto/.test(css)) {
  throw new Error("EPoSe consensus artwork must remain responsive");
}

for (const html of [index, germanIndex]) {
  if (/<a\b[^>]*href="\/assets\/epose\/epose-consensus-formula\.svg"/.test(html)) {
    throw new Error("EPoSe consensus artwork must not link to the source SVG");
  }
}

for (const removedText of ["Open formula at full size", "Formel in voller Größe öffnen"]) {
  if (index.includes(removedText) || germanIndex.includes(removedText)) {
    throw new Error(`Removed formula link label still present: ${removedText}`);
  }
}

if (!eposeFormula.includes('viewBox="0 0 1680 1398"')
    || /<script\b|<foreignObject\b|\son[a-z]+\s*=|xlink:href="(?!#)/i.test(eposeFormula)) {
  throw new Error("EPoSe consensus artwork is malformed or contains active/external content");
}

if (!/id="releases"[\s\S]*Desktop wallets[\s\S]*Core command-line tools[\s\S]*Docker image[\s\S]*Web Wallet[\s\S]*QWC source code/.test(index)) {
  throw new Error("Release cards must be ordered desktop wallets, Core command-line tools, Docker image, Web Wallet, source code");
}

const guiReleaseUrl = "https://github.com/qwertycoin-org/qwertycoin-gui/releases/tag/v2.0.1";
const guiChecksumsUrl = "https://github.com/qwertycoin-org/qwertycoin-gui/releases/download/v2.0.1/SHA256SUMS";
const guiArtifacts = [
  {
    name: "qwertycoin-gui-v2.0.1-windows-x86_64-setup.exe",
    sha256: "82eedf879dc856405bbcb96a839b280355c53259a9445feb35ad24818003f15e"
  },
  {
    name: "qwertycoin-gui-v2.0.1-windows-x86_64.zip",
    sha256: "44743418763f2394075469a9f44e17a9c835803b2a7a76f6cf43af9da7b6a24e"
  },
  {
    name: "qwertycoin-gui-v2.0.1-macos-arm64.dmg",
    sha256: "30a66788e940369bb6eb1d5bd1e33fc7292ac1fac42afc1ea3f404063a48cc85"
  },
  {
    name: "qwertycoin-gui-v2.0.1-macos-arm64.tar.gz",
    sha256: "1be02a059aedf394ab17ef05567dbbb71e3c529590eb65f83a692d4705acc425"
  },
  {
    name: "qwertycoin-gui-v2.0.1-linux-x86_64.tar.gz",
    sha256: "7902eacbd09b06c8d202167e206db185e306ad832a857239b77670a082c6ee4f"
  }
];

for (const html of [index, germanIndex]) {
  assertIncludes(html, "release-card release-card-downloads", "desktop release download card");
  assertIncludes(html, `href="${guiReleaseUrl}" target="_blank" rel="noopener"`, "GUI release notes link");
  assertIncludes(html, `href="${guiChecksumsUrl}" target="_blank" rel="noopener"`, "GUI checksum link");
  for (const artifact of guiArtifacts) {
    const downloadUrl = `https://github.com/qwertycoin-org/qwertycoin-gui/releases/download/v2.0.1/${artifact.name}`;
    assertIncludes(html, `href="${downloadUrl}" target="_blank" rel="noopener"`, `${artifact.name} download link`);
    assertIncludes(html, `<code>${artifact.sha256}</code>`, `${artifact.name} SHA-256`);
  }

  const dmgPosition = html.indexOf("qwertycoin-gui-v2.0.1-macos-arm64.dmg");
  const tarPosition = html.indexOf("qwertycoin-gui-v2.0.1-macos-arm64.tar.gz");
  if (dmgPosition < 0 || tarPosition < 0 || dmgPosition > tarPosition) {
    throw new Error("The preferred macOS DMG must be rendered before the TAR.GZ alternative");
  }
  const setupPosition = html.indexOf("qwertycoin-gui-v2.0.1-windows-x86_64-setup.exe");
  const zipPosition = html.indexOf("qwertycoin-gui-v2.0.1-windows-x86_64.zip");
  if (setupPosition < 0 || zipPosition < 0 || setupPosition > zipPosition) {
    throw new Error("The preferred Windows Setup must be rendered before the portable ZIP alternative");
  }
  if ((html.match(/class="release-download"/g) || []).length !== 6) {
    throw new Error("GUI and Core downloads must retain exactly three platform entries each");
  }
  if ((html.match(/class="release-download-grid release-download-grid-rows"/g) || []).length !== 1) {
    throw new Error("Only the GUI download card must use the horizontal platform-row layout");
  }
  if ((html.match(/release-download-preferred-placeholder/g) || []).length !== 2
      || (html.match(/release-download-preferred-placeholder" aria-hidden="true"/g) || []).length !== 2) {
    throw new Error("Windows and macOS alternatives must reserve one inaccessible preferred-label row each");
  }
  if (/<a class="release-link"[^>]*><span aria-hidden="true">(?:DL|ALT)<\/span>/.test(html)) {
    throw new Error("Download buttons must not include DL or ALT prefixes");
  }
}

assertIncludes(index, '<a class="release-link" href="https://wallet.qwertycoin.org/" target="_blank" rel="noopener">Open Web Wallet</a>', "English Web Wallet button without prefix");
assertIncludes(germanIndex, '<a class="release-link" href="https://wallet.qwertycoin.org/" target="_blank" rel="noopener">Web Wallet öffnen</a>', "German Web Wallet button without prefix");
assertIncludes(index, '<a class="release-link" href="https://github.com/qwertycoin-org/qwertycoin" target="_blank" rel="noopener">Open Core Repository</a>', "English Core repository button without prefix");
assertIncludes(germanIndex, '<a class="release-link" href="https://github.com/qwertycoin-org/qwertycoin" target="_blank" rel="noopener">Core-Repository öffnen</a>', "German Core repository button without prefix");
assertIncludes(index, '<a class="release-link" href="https://github.com/qwertycoin-org" target="_blank" rel="noopener">GitHub Organization</a>', "English GitHub organization button without prefix");
assertIncludes(germanIndex, '<a class="release-link" href="https://github.com/qwertycoin-org" target="_blank" rel="noopener">GitHub-Organisation</a>', "German GitHub organization button without prefix");
assertIncludes(index, `<a class="release-link" href="${guiReleaseUrl}" target="_blank" rel="noopener">Release notes</a>`, "English GUI release notes button without prefix");
assertIncludes(germanIndex, `<a class="release-link" href="${guiReleaseUrl}" target="_blank" rel="noopener">Release-Hinweise</a>`, "German GUI release notes button without prefix");
assertIncludes(index, '<a class="release-link" href="https://hub.docker.com/r/qwertycoin/qwertycoin/tags" target="_blank" rel="noopener">Open Docker Hub</a>', "English Docker Hub button without prefix");
assertIncludes(germanIndex, '<a class="release-link" href="https://hub.docker.com/r/qwertycoin/qwertycoin/tags" target="_blank" rel="noopener">Docker Hub öffnen</a>', "German Docker Hub button without prefix");
assertIncludes(index, '<a class="release-link" href="https://github.com/qwertycoin-org/qwertycoin/blob/main/docker/README.md" target="_blank" rel="noopener">Docker quickstart</a>', "English Docker quickstart button without prefix");
assertIncludes(germanIndex, '<a class="release-link" href="https://github.com/qwertycoin-org/qwertycoin/blob/main/docker/README.md" target="_blank" rel="noopener">Docker-Schnellstart</a>', "German Docker quickstart button without prefix");
assertIncludes(index, '<a class="release-link" href="https://github.com/qwertycoin-org/qwertycoin/releases/tag/v2.0.1" target="_blank" rel="noopener">Release notes</a>', "English Core release notes button without prefix");
assertIncludes(germanIndex, '<a class="release-link" href="https://github.com/qwertycoin-org/qwertycoin/releases/tag/v2.0.1" target="_blank" rel="noopener">Release-Hinweise</a>', "German Core release notes button without prefix");
assertIncludes(index, '<a class="release-link" href="https://github.com/qwertycoin-org/qwertycoin/releases/tag/v2.0.1" target="_blank" rel="noopener">Core release notes</a>', "English Docker Core release notes button without prefix");
assertIncludes(germanIndex, '<a class="release-link" href="https://github.com/qwertycoin-org/qwertycoin/releases/tag/v2.0.1" target="_blank" rel="noopener">Core-Release-Hinweise</a>', "German Docker Core release notes button without prefix");

assertIncludes(index, "Preferred download", "English preferred DMG label");
assertIncludes(germanIndex, "Bevorzugter Download", "German preferred DMG label");
assertIncludes(index, "Preferred installer", "English preferred Windows installer label");
assertIncludes(germanIndex, "Bevorzugter Installer", "German preferred Windows installer label");

if (!/\.release-download-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/.test(css)) {
  throw new Error("Default desktop release downloads must retain the three-column layout");
}

if (!/\.release-download-grid\.release-download-grid-rows\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/.test(css)
    || !/\.release-download-grid-rows \.release-download\s*\{[^}]*grid-template-columns:\s*minmax\(210px,\s*0\.3fr\)\s+minmax\(0,\s*1fr\)/.test(css)
    || !/\.release-download-grid-rows \.release-download-options\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/.test(css)) {
  throw new Error("GUI desktop downloads must render as platform rows with two artifact slots");
}

if (!/\.release-download-grid-rows \.release-download-preferred-placeholder\s*\{[^}]*display:\s*block;[^}]*visibility:\s*hidden/.test(css)
    || !/@media \(max-width:\s*720px\)[\s\S]*\.release-download-grid-rows \.release-download-preferred-placeholder\s*\{[^}]*display:\s*none/.test(css)) {
  throw new Error("Desktop alternatives must align with preferred buttons without adding mobile whitespace");
}

if (!/\.release-download-option-preferred \.release-link\s*\{[^}]*background:\s*var\(--color-accent\)/.test(css)) {
  throw new Error("Preferred installer downloads must have a visible primary treatment");
}

const coreReleaseUrl = "https://github.com/qwertycoin-org/qwertycoin/releases/tag/v2.0.1";
const coreChecksumsUrl = "https://github.com/qwertycoin-org/qwertycoin/releases/download/v2.0.1/SHA256SUMS";
const coreArtifacts = [
  {
    name: "qwertycoin-v2.0.1-windows-x86_64.zip",
    sha256: "7a4d8ff13c38d61884dadc8d06255948a64500cb0dad18c75416eb5448d48ac4"
  },
  {
    name: "qwertycoin-v2.0.1-macos-arm64.tar.gz",
    sha256: "9c2c7c07a145daec0ae7da089a162f36ac2a429fc3ee019bd1e5c8fee5a6c1ad"
  },
  {
    name: "qwertycoin-v2.0.1-linux-x86_64.tar.gz",
    sha256: "ac74f0f7d8439e74cf1c27ede3ac28951450665e6dc0c3b7866eb439c9011bc3"
  }
];

for (const html of [index, germanIndex]) {
  if ((html.match(/release-card release-card-downloads/g) || []).length !== 2) {
    throw new Error("Expected exactly two platform download cards");
  }
  assertIncludes(html, `href="${coreReleaseUrl}" target="_blank" rel="noopener"`, "Core release notes link");
  assertIncludes(html, `href="${coreChecksumsUrl}" target="_blank" rel="noopener"`, "Core checksum link");
  for (const artifact of coreArtifacts) {
    const downloadUrl = `https://github.com/qwertycoin-org/qwertycoin/releases/download/v2.0.1/${artifact.name}`;
    assertIncludes(html, `href="${downloadUrl}" target="_blank" rel="noopener"`, `${artifact.name} download link`);
    assertIncludes(html, `<code>${artifact.sha256}</code>`, `${artifact.name} SHA-256`);
  }
}

const dockerHubUrl = "https://hub.docker.com/r/qwertycoin/qwertycoin/tags";
const dockerQuickstartUrl = "https://github.com/qwertycoin-org/qwertycoin/blob/main/docker/README.md";
const dockerImage = "docker.io/qwertycoin/qwertycoin:latest";

for (const html of [index, germanIndex]) {
  assertIncludes(html, "release-card release-card-runtime", "Docker runtime card");
  assertIncludes(html, `href="${dockerHubUrl}" target="_blank" rel="noopener"`, "Docker Hub link");
  assertIncludes(html, `href="${dockerQuickstartUrl}" target="_blank" rel="noopener"`, "Docker quickstart link");
  assertIncludes(html, `<code>docker pull ${dockerImage}</code>`, "latest Docker pull");
  assertIncludes(html, "-v qwertycoin-chain:/data -p 8196:8196", "persistent chain and P2P-only Docker run");
  assertIncludes(html, dockerImage, "latest Docker run image");
  if (html.includes("docker.io/qwertycoin/qwertycoin:2.0.1")) {
    throw new Error("Website Docker commands must follow the latest stable tag");
  }
}

if (index.includes("v2.0.0") || germanIndex.includes("v2.0.0")) {
  throw new Error("Stale v2.0.0 release references must not be rendered");
}

for (const removedReleaseText of [
  "Testing only",
  "Testing release",
  "not a stable activation release",
  "EPoSE activation gate",
  "TESTVERSION",
  "Nur zum Testen",
  "Testversion",
  "kein stabiler Aktivierungsrelease",
  "EPoSE-Aktivierungsgate",
  "Additional wallets and tools",
  "Weitere Wallets und Tools"
]) {
  if (index.includes(removedReleaseText) || germanIndex.includes(removedReleaseText)) {
    throw new Error(`Removed release wording must not be rendered: ${removedReleaseText}`);
  }
}

for (const requiredCoreReleaseText of [
  "qwertycoind",
  "qwertycoin-wallet-cli",
  "qwertycoin-wallet-rpc",
  "GLIBC 2.35 / GLIBCXX 3.4.30",
  "macOS 15",
  "Windows Server 2025"
]) {
  if (!index.includes(requiredCoreReleaseText) && !germanIndex.includes(requiredCoreReleaseText)) {
    throw new Error(`Missing Core release detail: ${requiredCoreReleaseText}`);
  }
}

for (const staleText of [
  "Desktop wallets for Windows, macOS and Linux are planned.",
  "Desktop-Wallets für Windows, macOS und Linux sind geplant.",
  "Windows Planned",
  "Windows geplant",
  "macOS Planned",
  "macOS geplant",
  "Linux Planned",
  "Linux geplant"
]) {
  if (index.includes(staleText) || germanIndex.includes(staleText)) {
    throw new Error(`Stale desktop-wallet availability wording found: ${staleText}`);
  }
}

for (const text of [
  "5 verifiers",
  "5 Verifier",
  "Minimum Attestations",
  "Minimum-Bestätigungen"
]) {
  if (index.includes(text) || germanIndex.includes(text)) {
    throw new Error(`Stale EPoSe parameter wording found: ${text}`);
  }
}

for (const text of [
  "ceil(2/3 of actual committee)",
  "ceil(2/3 des tatsächlichen Komitees)",
  "6 of 9 when full",
  "6 von 9 bei voller Größe"
]) {
  if (!index.includes(text) && !germanIndex.includes(text)) {
    throw new Error(`Missing current EPoSe quorum wording: ${text}`);
  }
}

if (index.includes("wallet-preview") || germanIndex.includes("wallet-preview")) {
  throw new Error("Wallet preview mockup should not be rendered");
}

for (const text of [
  "testnet",
  "pre-launch network",
  "validation network",
  "public test phase",
  "future mainnet",
  "mainnet coming soon",
  "PWA Ready",
  "git clone --recursive https://github.com/qwertycoin-org/qwertycoin.git"
]) {
  if (index.toLowerCase().includes(text.toLowerCase()) || germanIndex.toLowerCase().includes(text.toLowerCase())) {
    throw new Error(`Forbidden mainnet/source wording found: ${text}`);
  }
}

if (index.includes("primary-feature")) {
  throw new Error("Technology feature grid should not render a low-contrast primary feature card");
}

if (!/id="technology"[\s\S]*id="specs"[\s\S]*id="epose"/.test(index)) {
  throw new Error("Specs diagram must sit directly below the technology grid");
}

const specsSection = index.match(/<section class="section specs-section" id="specs">[\s\S]*?<\/section>/)?.[0] ?? "";
if (!specsSection || specsSection.includes("section-header") || !specsSection.includes("spec-orbit")) {
  throw new Error("Specs section must render without a heading and keep the diagram");
}

for (const text of [
  'hreflang="de"',
  'hreflang="x-default"',
  'href="https://qwertycoin.org/de/"',
  'property="og:locale" content="de_DE"'
]) {
  if (!germanIndex.includes(text) && !index.includes(text)) throw new Error(`Missing localized SEO tag: ${text}`);
}

if (!sitemap.includes("https://qwertycoin.org/de/") || !sitemap.includes('hreflang="x-default"')) {
  throw new Error("Sitemap does not include locale alternates");
}

for (const text of ["integration.qwertycoin.org", "noindex"]) {
  if (index.includes(text) || germanIndex.includes(text) || sitemap.includes(text)) {
    throw new Error(`Production SEO output must not contain ${text}`);
  }
}

if (index.includes("qwc-network-visual")) {
  throw new Error("Hero must not use the old diagram-card visual");
}

if (!headers.includes("frame-ancestors 'none'") || !headers.includes("object-src 'none'")) {
  throw new Error("Security headers are incomplete");
}

if (!middleware.includes('url.hostname.endsWith(".pages.dev")') || !middleware.includes("noindex, nofollow, max-image-preview:large")) {
  throw new Error("Preview deployments must emit an X-Robots-Tag noindex header");
}

for (const forbiddenHeaderPattern of ["/assets/*", "/css/*", "/js/*"]) {
  if (headers.includes(forbiddenHeaderPattern)) {
    throw new Error(`Broad cache header pattern can overlap specific rules: ${forbiddenHeaderPattern}`);
  }
}

for (const requiredHeader of [
  "/assets/fonts/archivo-latin-900.woff2\n  Cache-Control: public, max-age=0, must-revalidate",
  "/assets/fonts/inter-latin-400.woff2\n  Cache-Control: public, max-age=0, must-revalidate",
  "/assets/fonts/inter-latin-600.woff2\n  Cache-Control: public, max-age=0, must-revalidate",
  "/assets/fonts/v/*\n  Cache-Control: public, max-age=31536000, immutable",
  "/css/site.css\n  Cache-Control: public, max-age=0, must-revalidate",
  "/css/v/*\n  Cache-Control: public, max-age=31536000, immutable",
  "/js/network-status.js\n  Cache-Control: public, max-age=0, must-revalidate",
  "/js/v/*\n  Cache-Control: public, max-age=31536000, immutable"
]) {
  assertIncludes(headers, requiredHeader, `header ${requiredHeader}`);
}

for (const legacyPath of ["/wallet", "/webwallet", "/download", "/downloads", "/releases", "/nodes", "/explorer"]) {
  if (!redirects.includes(`${legacyPath} `)) {
    throw new Error(`Missing legacy redirect: ${legacyPath}`);
  }
}

for (const text of [
  "[Website](https://qwertycoin.org/)",
  "[Deutsch](https://qwertycoin.org/de/)",
  "The Web Wallet and Qwertycoin core source code are available.",
  "[Core source](https://github.com/qwertycoin-org/qwertycoin)"
]) {
  assertIncludes(llms, text, `llms.txt ${text}`);
}

await stat(path.join(root, "assets", "qwertycoin-mark.svg"));
await stat(path.join(root, "assets", "epose", "epose-consensus-formula.svg"));
await stat(path.join(dist, "assets", "epose", "epose-consensus-formula.svg"));
await stat(path.join(root, "assets", "qwc-hero-motif.svg"));
await stat(path.join(root, "assets", "apple-touch-icon.png"));
await stat(path.join(root, "assets", "favicon-32x32.png"));
await stat(path.join(root, "assets", "fonts", "LICENSES.md"));
await stat(path.join(root, "js", "nav-menu.js"));
await stat(path.join(root, "css", "v", `site.${cssMatch[1]}.css`));
await stat(path.join(root, "js", "v", `network-status.${networkJsMatch[1]}.js`));
await stat(path.join(root, "js", "v", `nav-menu.${navJsMatch[1]}.js`));
await stat(path.join(dist, "css", "v", `site.${cssMatch[1]}.css`));
await stat(path.join(dist, "js", "v", `network-status.${networkJsMatch[1]}.js`));
await stat(path.join(dist, "js", "v", `nav-menu.${navJsMatch[1]}.js`));
for (const fontPath of fontPreloadMatches) {
  await stat(path.join(dist, fontPath));
}

async function checkCssUrls(cssRelativePath) {
  const cssPath = path.join(dist, cssRelativePath);
  const source = await readFile(cssPath, "utf8");
  if (source.includes("/css/assets/fonts/") || source.includes("../assets/fonts/")) {
    throw new Error(`${cssRelativePath} contains a font URL that resolves from the wrong CSS directory`);
  }

  for (const match of source.matchAll(/url\(([^)]+)\)/g)) {
    const rawUrl = match[1].trim().replace(/^["']|["']$/g, "");
    if (!rawUrl || rawUrl.startsWith("data:") || rawUrl.startsWith("http:") || rawUrl.startsWith("https:") || rawUrl.startsWith("#")) {
      continue;
    }

    const resolvedPath = rawUrl.startsWith("/")
      ? path.join(dist, rawUrl)
      : path.join(path.dirname(cssPath), rawUrl);

    await stat(resolvedPath);
  }
}

await checkCssUrls("css/site.css");
await checkCssUrls(`css/v/site.${cssMatch[1]}.css`);
await stat(path.join(root, "robots.txt"));
await stat(path.join(root, "de", "index.html"));
await stat(path.join(root, "404.html"));
await stat(path.join(dist, "sitemap.xml"));

console.log("QWC website checks passed");
