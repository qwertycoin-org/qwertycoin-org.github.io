import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = new URL("..", import.meta.url).pathname;
const dist = path.join(root, "dist");
const index = await readFile(path.join(dist, "index.html"), "utf8");
const germanIndex = await readFile(path.join(dist, "de", "index.html"), "utf8");
const css = await readFile(path.join(root, "css", "site.css"), "utf8");
const headers = await readFile(path.join(root, "_headers"), "utf8");
const redirects = await readFile(path.join(root, "_redirects"), "utf8");
const sitemap = await readFile(path.join(dist, "sitemap.xml"), "utf8");

const required = [
  "Qwertycoin is back.",
  "Web Wallet",
  "QWC MAINNET LIVE",
  "Qwertycoin is a new mainnet chain",
  "QWC Mainnet",
  "RandomX",
  "No central Sentinel decides rewards.",
  "Current mainnet reward split",
  "Thank you, Xecute.",
  "hero-network-field",
  "epose-compact",
  "Prove service",
  "QWC Core Network",
  "Proof of Service rewards",
  "Qwertycoin Releases",
  "Release policy",
  "about_bg-01_img.svg",
  "about_bg_img-mobile.svg",
  "Does EPoSe replace mining?",
  "data-nav-toggle",
  "Open Web Wallet Beta",
  "PWA In Development",
  "QWC source code",
  "Open Core Repository",
  "Public Developer Ecosystem",
  "2018",
  "2026",
  "Registered Service Nodes",
  "Qualified Service Nodes",
  "Developers",
  "application/ld+json"
];

for (const text of required) {
  if (!index.includes(text)) throw new Error(`Missing required content: ${text}`);
}

const forbidden = [
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

for (const text of forbidden) {
  if (index.toLowerCase().includes(text.toLowerCase())) {
    throw new Error(`Forbidden legacy/unsafe claim found: ${text}`);
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

if (!css.includes("--color-surface") || !css.includes("--radius-card")) {
  throw new Error("Design tokens are not loaded into site CSS");
}

if (!/id="releases"[\s\S]*Web Wallet[\s\S]*Desktop GUI[\s\S]*Public QWC Source[\s\S]*Additional Wallets &amp; Tools/.test(index)) {
  throw new Error("Release cards must be ordered Web Wallet, Desktop GUI, Public Source, Additional Tools");
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
  "PWA Ready"
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
  "Qwertycoin ist zurück.",
  "Service beweisen",
  "Qwertycoin Releases",
  "Release Policy",
  "QWC MAINNET LIVE",
  "QWC-v2-Sourcecode",
  "Registrierte Service Nodes",
  "Qualified Service Nodes",
  "Ersetzt EPoSe das Mining?"
]) {
  if (!germanIndex.includes(text)) throw new Error(`Missing German content: ${text}`);
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

if (index.includes("qwc-network-visual")) {
  throw new Error("Hero must not use the old diagram-card visual");
}

if (!headers.includes("frame-ancestors 'none'") || !headers.includes("object-src 'none'")) {
  throw new Error("Security headers are incomplete");
}

if (!index.includes('href="https://github.com/qwertycoin-org/qwertycoin"')) {
  throw new Error("Current public QWC core repository link is missing");
}

for (const legacyPath of ["/wallet", "/webwallet", "/download", "/downloads", "/releases", "/nodes", "/explorer"]) {
  if (!redirects.includes(`${legacyPath} `)) {
    throw new Error(`Missing legacy redirect: ${legacyPath}`);
  }
}

await stat(path.join(root, "assets", "qwertycoin-mark.svg"));
await stat(path.join(root, "js", "nav-menu.js"));
await stat(path.join(root, "robots.txt"));
await stat(path.join(root, "de", "index.html"));
await stat(path.join(dist, "sitemap.xml"));

console.log("QWC website checks passed");
