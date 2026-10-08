import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = new URL("..", import.meta.url).pathname;
const dist = path.join(root, "dist");
const localeConfig = JSON.parse(await readFile(path.join(root, "src", "i18n", "locales.json"), "utf8"));
const localePages = new Map(await Promise.all(localeConfig.map(async (locale) => [
  locale.code,
  await readFile(locale.code === "en"
    ? path.join(dist, "index.html")
    : path.join(dist, locale.path.slice(1), "index.html"), "utf8")
])));
const allLocalePages = [...localePages.values()];
const index = await readFile(path.join(dist, "index.html"), "utf8");
const germanIndex = await readFile(path.join(dist, "de", "index.html"), "utf8");
const notFound = await readFile(path.join(dist, "404.html"), "utf8");
const css = await readFile(path.join(root, "css", "site.css"), "utf8");
const distCss = await readFile(path.join(dist, "css", "site.css"), "utf8");
const tokens = await readFile(path.join(root, "css", "tokens.css"), "utf8");
const navMenuSource = await readFile(path.join(root, "js", "nav-menu.js"), "utf8");
const headers = await readFile(path.join(root, "_headers"), "utf8");
const redirects = await readFile(path.join(root, "_redirects"), "utf8");
const middleware = await readFile(path.join(root, "functions", "_middleware.js"), "utf8");
const sitemap = await readFile(path.join(dist, "sitemap.xml"), "utf8");
const llms = await readFile(path.join(dist, "llms.txt"), "utf8");
const eposeFormula = await readFile(path.join(root, "assets", "epose", "epose-consensus-formula.svg"), "utf8");
const germanEposeFormula = await readFile(path.join(root, "assets", "epose", "epose-consensus-formula-de.svg"), "utf8");
const neutralEposeFormula = await readFile(path.join(root, "assets", "epose", "epose-consensus-formula-neutral.svg"), "utf8");
const germanHeroMotif = await readFile(path.join(root, "assets", "qwc-hero-motif-de.svg"), "utf8");
const networkConfig = JSON.parse(await readFile(path.join(root, "src", "config", "network.json"), "utf8"));
const englishSource = await readFile(path.join(root, "src", "i18n", "en.json"), "utf8");
const germanSource = await readFile(path.join(root, "src", "i18n", "de.json"), "utf8");
const allLocaleSources = await Promise.all(localeConfig.map((locale) => readFile(path.join(root, "src", "i18n", `${locale.code}.json`), "utf8")));

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
  "Get QWC",
  "Find an exchange that lists Qwertycoin.",
  "QWC / USDT",
  "TRADE QWC",
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
  "application/ld+json",
  'type="application/json" id="qwc-network-data"',
  "/assets/fonts/v/archivo-latin-900."
];

for (const text of requiredEnglish) assertIncludes(index, text);

const requiredGerman = [
  "Privat bezahlen. Offen vernetzt.",
  "Qwertycoin (QWC) verbindet vertrauliche digitale Zahlungen mit offenem RandomX-Mining und Belohnungen für nachgewiesene Netzwerkdienste.",
  "Web Wallet öffnen",
  "QWC kaufen",
  "Hier kannst du Qwertycoin über eine gelistete Börse beziehen.",
  "QWC handeln",
  "QWC-MAINNET AKTIV",
  "Privat bezahlen mit QWC.",
  "Belohnungen für nachgewiesene Dienste",
  "Web Wallet und offener Quellcode",
  "Dienste bereitstellen. QWC verdienen.",
  "Belohnungen folgen festen Regeln.",
  "Die Transaktionsgebühren erhält der Miner.",
  "Wallets und Quellcode",
  "Das Netzwerk im Blick",
  "Registrierte Service Nodes",
  "Qualifizierte Service Nodes",
  "Ersetzt EPoSE das Mining?",
  "2019–2023",
  "Entwickle Qwertycoin mit uns weiter."
];

for (const text of requiredGerman) assertIncludes(germanIndex, text);
assertIncludes(germanIndex, "/assets/epose/epose-consensus-formula-de.svg", "German EPoSE diagram");
assertIncludes(germanIndex, "/assets/qwc-hero-motif-de.svg", "German hero motif");

for (const locale of localeConfig) {
  const html = localePages.get(locale.code);
  const canonical = `https://qwertycoin.org${locale.path}`;
  assertIncludes(html, `<html lang="${locale.code}">`, `${locale.code} HTML language`);
  assertIncludes(html, `<link rel="canonical" href="${canonical}">`, `${locale.code} canonical URL`);
  assertIncludes(html, 'hreflang="x-default" href="https://qwertycoin.org/"', `${locale.code} x-default`);
  assertIncludes(html, `property="og:url" content="${canonical}"`, `${locale.code} Open Graph URL`);
  assertIncludes(html, `property="og:locale" content="${locale.ogLocale}"`, `${locale.code} Open Graph locale`);
  assertIncludes(html, `"inLanguage":"${locale.code}"`, `${locale.code} structured-data language`);

  if (locale.searchHreflang === false) {
    if (html.includes(`hreflang="${locale.code}"`)) throw new Error(`${locale.code} must not be emitted as an unsupported search hreflang`);
  } else {
    assertIncludes(html, `hreflang="${locale.code}" href="${canonical}"`, `${locale.code} self hreflang`);
  }

  for (const option of localeConfig) {
    assertIncludes(html, `lang="${option.code}" data-locale-option="${option.code}"`, `${locale.code} language menu option ${option.code}`);
    assertIncludes(html, `<span>${option.nativeName}</span>`, `${locale.code} native language name ${option.nativeName}`);
  }

  if (locale.code !== "en" && locale.code !== "de") {
    assertIncludes(html, "/assets/qwc-hero-motif-neutral.svg", `${locale.code} language-neutral hero artwork`);
    assertIncludes(html, "/assets/epose/epose-consensus-formula-neutral.svg", `${locale.code} language-neutral formula artwork`);
  }

  if (/flag-icon|emoji-flag/i.test(html)) throw new Error(`${locale.code} language menu must not use flags`);
}

for (const locale of localeConfig) {
  assertIncludes(notFound, `href="${locale.path}" lang="${locale.code}"`, `404 language option ${locale.code}`);
  assertIncludes(notFound, `<span>${locale.nativeName}</span>`, `404 native language name ${locale.nativeName}`);
}

const exchangeUrl = "https://neoxa.exchange/trade/QWC_USDT";
const exchangeContract = [
  ['<a href="#exchanges">Get QWC</a>', index, "English navigation exchange link"],
  ['<a href="#exchanges">QWC kaufen</a>', germanIndex, "German navigation exchange link"],
  ['<a class="button secondary" href="#exchanges">Get QWC</a>', index, "English hero exchange link"],
  ['<a class="button secondary" href="#exchanges">QWC kaufen</a>', germanIndex, "German hero exchange link"],
  ['<section class="section exchange-section" id="exchanges">', index, "exchange section anchor"],
  ['<h2>GET QWC.</h2>', index, "English exchange heading"],
  ['<h2>QWC kaufen.</h2>', germanIndex, "German exchange heading"],
  ['<h3>Neoxa Exchange</h3>', index, "semantic exchange card heading"],
  [`href="${exchangeUrl}" target="_blank" rel="noopener noreferrer"`, index, "safe direct exchange link"],
  ['aria-label="Trade QWC on Neoxa Exchange, opens a new tab"', index, "English accessible exchange link name"],
  ['aria-label="QWC auf Neoxa Exchange handeln, öffnet einen neuen Tab"', germanIndex, "German accessible exchange link name"]
];

for (const [needle, html, label] of exchangeContract) assertIncludes(html, needle, label);

const participationContract = [
  ['<a class="text-link" href="#participate">Choose your path</a>', index, "English hero participation link"],
  ['<a class="text-link" href="#participate">Einstieg wählen</a>', germanIndex, "German hero participation link"],
  ['<section class="section alt participation-section" id="participate">', index, "participation section anchor"],
  ['Choose how you want to participate.', index, "English participation heading"],
  ['So kannst du mitmachen.', germanIndex, "German participation heading"],
  ['href="https://wallet.qwertycoin.org/" target="_blank" rel="noopener noreferrer">Open Web Wallet', index, "safe wallet path"],
  ['href="https://pool.qwertycoin.org/#start" target="_blank" rel="noopener noreferrer">Start mining', index, "safe official pool path"],
  ['href="https://docs.qwertycoin.org/epose/service-node-quickstart" target="_blank" rel="noopener noreferrer">Open operator guide', index, "safe service-node path"],
  ['href="https://explorer.qwertycoin.org/service-nodes" target="_blank" rel="noopener noreferrer">View live Service Nodes', index, "live Service Node CTA"],
  ['href="https://docs.qwertycoin.org/epose/overview" target="_blank" rel="noopener noreferrer">Read the EPoSe documentation', index, "EPoSe documentation CTA"],
  ['href="https://docs.qwertycoin.org/" target="_blank" rel="noopener noreferrer">Documentation', index, "documentation footer link"],
  ['href="https://pool.qwertycoin.org/" target="_blank" rel="noopener noreferrer">Official pool', index, "official pool footer link"]
];

for (const [needle, html, label] of participationContract) assertIncludes(html, needle, label);

const miningContract = [
  ["Official Qwertycoin pool", index, "official pool heading"],
  ["Offizieller Qwertycoin-Pool", germanIndex, "German official pool heading"],
  ["Algorithm: RandomX (rx/0)", index, "official mining algorithm"],
  ["transparent PPLNS accounting", index, "official pool accounting"],
  ["Your QWC payout address is your pool account", index, "address-based pool account"],
  ["Each payout account pays the actual network fee for its own payout", index, "miner-funded payout network fee"],
  ['href="https://pool.qwertycoin.org/" target="_blank" rel="noopener noreferrer">Open official pool', index, "official pool CTA"],
  ['href="https://pool.qwertycoin.org/#start" target="_blank" rel="noopener noreferrer">Create XMRig command', index, "XMRig setup CTA"],
  ['href="https://docs.qwertycoin.org/mining-and-ecosystem/pool-mining" target="_blank" rel="noopener noreferrer">Read the pool-mining guide', index, "pool mining docs CTA"],
  ["90% mining / 10% EPoSe", index, "English protocol split"],
  ["95% miners / 5% pool", index, "English pool split"],
  ["90 % Mining / 10 % EPoSE", germanIndex, "German protocol split"],
  ["95 % Miner / 5 % Pool", germanIndex, "German pool split"],
  ["Transaction fees remain with the miner.", index, "protocol transaction-fee rule"],
  ["exakt 95 %", germanIndex, "exact German pool allocation"]
];

for (const [needle, html, label] of miningContract) assertIncludes(html, needle, label);

for (const html of [index, germanIndex]) {
  if ((html.match(/class="path-card"/g) || []).length !== 3) {
    throw new Error("Exactly three newcomer participation paths must be rendered");
  }
  if ((html.match(/class="allocation-card"/g) || []).length !== 2) {
    throw new Error("Protocol and official-pool reward allocations must remain separate");
  }

  const systemPosition = html.indexOf('class="system-strip"');
  const participatePosition = html.indexOf('id="participate"');
  const technologyPosition = html.indexOf('id="technology"');
  if (systemPosition < 0 || participatePosition <= systemPosition || technologyPosition <= participatePosition) {
    throw new Error("Newcomer participation paths must render directly after the mining/EPoSe system summary");
  }
}

if (networkConfig.pool.url !== "https://pool.qwertycoin.org/"
    || networkConfig.pool.startUrl !== "https://pool.qwertycoin.org/#start"
    || networkConfig.pool.algorithm !== "RandomX (rx/0)"
    || networkConfig.pool.accounting !== "PPLNS"
    || networkConfig.pool.feeBps !== 500) {
  throw new Error("Official pool metadata must remain centralized and exact");
}

for (const source of allLocaleSources) {
  if (source.includes("https://pool.qwertycoin.org")
      || source.includes("https://docs.qwertycoin.org")
      || source.includes("https://explorer.qwertycoin.org")) {
    throw new Error("Service URLs must stay in network.json instead of translation copy");
  }
}

for (const html of [index, germanIndex]) {
  const miningPosition = html.indexOf('id="mining"');
  const exchangePosition = html.indexOf('id="exchanges"');
  const releasesPosition = html.indexOf('id="releases"');
  if (miningPosition < 0 || exchangePosition <= miningPosition || releasesPosition <= exchangePosition) {
    throw new Error("Exchange section must render between Mining and Wallets/source code");
  }
  if ((html.match(/class="exchange-card"/g) || []).length !== 1) {
    throw new Error("Exactly one exchange card must be rendered");
  }
  if (/<iframe\b/i.test(html)) throw new Error("Exchange integration must not embed an iframe");

  const heroSection = html.match(/<section class="hero classic-hero">[\s\S]*?<\/section>/)?.[0] ?? "";
  if (!heroSection || heroSection.includes("https://explorer.qwertycoin.org/")) {
    throw new Error("Hero must link to Get QWC instead of the external explorer");
  }
  if ((html.match(/href="https:\/\/explorer\.qwertycoin\.org\/"/g) || []).length < 2) {
    throw new Error("Network and Community explorer links must remain available");
  }
}

if (!/#exchanges\s*\{[^}]*scroll-margin-top:\s*96px/.test(css)) {
  throw new Error("Exchange anchor must remain visible below the sticky header");
}

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

const forbiddenLiteralGerman = [
  "Private Zahlungen. Offenes Netzwerk.",
  "Privatsphäre. Mit QWC.",
  "Wähle deinen Weg ins Netzwerk.",
  "Netzwerkdienste leisten. QWC verdienen.",
  "Das Protokoll regelt die Vergütung.",
  "Vergütungsquellepoche",
  "Epochen sind Blockbereiche, keine Uhrzeit-Termine.",
  "Service wird zuerst gemessen. Rewards folgen danach.",
  "Entwickle mit Qwertycoin."
];

for (const text of forbiddenLiteralGerman) {
  if (germanIndex.includes(text) || germanSource.includes(text)) {
    throw new Error(`Literal German translation returned: ${text}`);
  }
}

const publicPages = [...allLocalePages.map(stripTestPatterns), llms];
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

for (const [localeCode, html] of localePages) {
  for (const href of [...html.matchAll(/\shref="([^"]+)"/g)].map((match) => match[1])) {
    if (href.startsWith("#") && !html.includes(`id="${href.slice(1)}"`)) {
      throw new Error(`Broken internal anchor in ${localeCode}: ${href}`);
    }
  }
}

for (const [localeCode, html] of localePages) {
  if (/\ssrc="https?:\/\//.test(html) || /\shref="https?:\/\/[^"]+\.(css|js)"/.test(html)) {
    throw new Error(`External scripts or stylesheets are not allowed in ${localeCode}`);
  }
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

const responsiveNavigation = css.slice(
  css.indexOf("@media (max-width: 1200px)"),
  css.indexOf("@media (max-width: 1100px)")
);
for (const contract of [
  "max-height: calc(100dvh - 90px)",
  "overscroll-behavior: contain",
  "grid-column: 1 / -1",
  ".locale-switcher.is-open .locale-toggle::after",
  "grid-template-columns: repeat(2, minmax(0, 1fr))",
  "max-height: none",
  "overflow: visible",
  "box-shadow: none"
]) {
  assertIncludes(responsiveNavigation, contract, `responsive language navigation contract: ${contract}`);
}
if (!/@media \(max-width: 360px\)\s*\{[\s\S]*?\.locale-menu\s*\{[\s\S]*?grid-template-columns:\s*1fr/.test(css)) {
  throw new Error("Very narrow screens must collapse the language menu to one column");
}
assertIncludes(
  navMenuSource,
  'if (document.querySelector(".locale-switcher.is-open")) return;',
  "Escape must close the nested language menu before the mobile navigation"
);

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

for (const html of [...allLocalePages, notFound]) {
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
  if (/<a\b[^>]*href="\/assets\/epose\/epose-consensus-formula(?:-de)?\.svg"/.test(html)) {
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

if (!germanEposeFormula.includes('viewBox="0 0 1680 1398"')
    || !germanEposeFormula.includes("BELOHNUNGEN FOLGEN FESTEN REGELN.")
    || !germanEposeFormula.includes("EMPFÄNGERAUSWAHL")
    || /<script\b|<foreignObject\b|\son[a-z]+\s*=|xlink:href="(?!#)/i.test(germanEposeFormula)) {
  throw new Error("German EPoSE consensus artwork is malformed, untranslated or contains active/external content");
}

if (!neutralEposeFormula.includes('viewBox="0 0 1680 920"')
    || !neutralEposeFormula.includes("q<tspan")
    || !neutralEposeFormula.includes("R<tspan")
    || /<script\b|<foreignObject\b|\son[a-z]+\s*=|xlink:href=/i.test(neutralEposeFormula)) {
  throw new Error("Language-neutral EPoSE consensus artwork is malformed or contains active/external content");
}

if (!germanHeroMotif.includes('viewBox="0 0 1254 1254"')
    || !germanHeroMotif.includes("PRÜFKNOTEN")
    || !germanHeroMotif.includes("KNOTEN")
    || /<script\b|<foreignObject\b|\son[a-z]+\s*=|xlink:href="(?!#)/i.test(germanHeroMotif)) {
  throw new Error("German hero motif is malformed, untranslated or contains active/external content");
}

if (!/id="releases"[\s\S]*Desktop wallets[\s\S]*Core command-line tools[\s\S]*Docker image[\s\S]*Web Wallet[\s\S]*QWC source code/.test(index)) {
  throw new Error("Release cards must be ordered desktop wallets, Core command-line tools, Docker image, Web Wallet, source code");
}

const guiReleaseUrl = "https://github.com/qwertycoin-org/qwertycoin-gui/releases/tag/v2.0.3";
const guiChecksumsUrl = "https://github.com/qwertycoin-org/qwertycoin-gui/releases/download/v2.0.3/SHA256SUMS";
const guiArtifacts = [
  {
    name: "qwertycoin-gui-v2.0.3-windows-x86_64-setup.exe",
    sha256: "7f8c159fa956db2b6a9b55fd47600a1fe68f32dd26d1e665877a9cc37758eadd"
  },
  {
    name: "qwertycoin-gui-v2.0.3-windows-x86_64.zip",
    sha256: "b4b2c28a5cee6ca7bd3f423de5b340706ee216a31bfa23d620b7a67150a197de"
  },
  {
    name: "qwertycoin-gui-v2.0.3-macos-arm64.dmg",
    sha256: "a4736597387770250b795fd1a4397693990522cf673cfb29d6cf9bb855071200"
  },
  {
    name: "qwertycoin-gui-v2.0.3-macos-arm64.tar.gz",
    sha256: "ce239650afcc8eacee7b13d35f076a3ea617a81d4728b22d53d1ecc28a97fe26"
  },
  {
    name: "qwertycoin-gui-v2.0.3-linux-x86_64.tar.gz",
    sha256: "55cc8754df00c36017b7a0ffa35b90d3878c95477202059b6c596b5163c47680"
  }
];

for (const html of [index, germanIndex]) {
  assertIncludes(html, "release-card release-card-downloads", "desktop release download card");
  assertIncludes(html, `href="${guiReleaseUrl}" target="_blank" rel="noopener"`, "GUI release notes link");
  assertIncludes(html, `href="${guiChecksumsUrl}" target="_blank" rel="noopener"`, "GUI checksum link");
  for (const artifact of guiArtifacts) {
    const downloadUrl = `https://github.com/qwertycoin-org/qwertycoin-gui/releases/download/v2.0.3/${artifact.name}`;
    assertIncludes(html, `href="${downloadUrl}" target="_blank" rel="noopener"`, `${artifact.name} download link`);
    assertIncludes(html, `<code>${artifact.sha256}</code>`, `${artifact.name} SHA-256`);
  }

  const dmgPosition = html.indexOf("qwertycoin-gui-v2.0.3-macos-arm64.dmg");
  const tarPosition = html.indexOf("qwertycoin-gui-v2.0.3-macos-arm64.tar.gz");
  if (dmgPosition < 0 || tarPosition < 0 || dmgPosition > tarPosition) {
    throw new Error("The preferred macOS DMG must be rendered before the TAR.GZ alternative");
  }
  const setupPosition = html.indexOf("qwertycoin-gui-v2.0.3-windows-x86_64-setup.exe");
  const zipPosition = html.indexOf("qwertycoin-gui-v2.0.3-windows-x86_64.zip");
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
assertIncludes(index, '<a class="release-link" href="https://github.com/qwertycoin-org/qwertycoin/releases/tag/v2.0.3" target="_blank" rel="noopener">Release notes</a>', "English Core release notes button without prefix");
assertIncludes(germanIndex, '<a class="release-link" href="https://github.com/qwertycoin-org/qwertycoin/releases/tag/v2.0.3" target="_blank" rel="noopener">Release-Hinweise</a>', "German Core release notes button without prefix");
assertIncludes(index, '<a class="release-link" href="https://github.com/qwertycoin-org/qwertycoin/releases/tag/v2.0.3" target="_blank" rel="noopener">Core release notes</a>', "English Docker Core release notes button without prefix");
assertIncludes(germanIndex, '<a class="release-link" href="https://github.com/qwertycoin-org/qwertycoin/releases/tag/v2.0.3" target="_blank" rel="noopener">Core-Release-Hinweise</a>', "German Docker Core release notes button without prefix");

assertIncludes(index, "Preferred download", "English preferred DMG label");
assertIncludes(germanIndex, "Empfohlener Download", "German preferred DMG label");
assertIncludes(index, "Preferred installer", "English preferred Windows installer label");
assertIncludes(germanIndex, "Empfohlene Installation", "German preferred Windows installer label");

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

const coreReleaseUrl = "https://github.com/qwertycoin-org/qwertycoin/releases/tag/v2.0.3";
const coreChecksumsUrl = "https://github.com/qwertycoin-org/qwertycoin/releases/download/v2.0.3/SHA256SUMS";
const coreArtifacts = [
  {
    name: "qwertycoin-v2.0.3-windows-x86_64.zip",
    sha256: "b0bab23137d5a4308b3d1cd582c17fd0069f392c265a74a1e0fd0f15b4becaaf"
  },
  {
    name: "qwertycoin-v2.0.3-macos-arm64.tar.gz",
    sha256: "c23194aff092d0cc8ef6eed9ce4a6d45ccb06c7b760b05e7fce0cd9992962fdf"
  },
  {
    name: "qwertycoin-v2.0.3-linux-x86_64.tar.gz",
    sha256: "8df9d4bd22610228f3330aaac348776fd86bcd853751cf9472e0fc4db271b675"
  }
];

for (const html of [index, germanIndex]) {
  if ((html.match(/release-card release-card-downloads/g) || []).length !== 2) {
    throw new Error("Expected exactly two platform download cards");
  }
  assertIncludes(html, `href="${coreReleaseUrl}" target="_blank" rel="noopener"`, "Core release notes link");
  assertIncludes(html, `href="${coreChecksumsUrl}" target="_blank" rel="noopener"`, "Core checksum link");
  for (const artifact of coreArtifacts) {
    const downloadUrl = `https://github.com/qwertycoin-org/qwertycoin/releases/download/v2.0.3/${artifact.name}`;
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
  if (/docker\.io\/qwertycoin\/qwertycoin:v?\d+\.\d+\.\d+/.test(html)) {
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
  "Aufgerundet 2/3 der tatsächlichen Komiteegröße",
  "6 of 9 when full",
  "bei voller Größe 6 von 9"
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

for (const locale of localeConfig) {
  assertIncludes(sitemap, `<loc>https://qwertycoin.org${locale.path}</loc>`, `${locale.code} sitemap URL`);
  if (locale.searchHreflang === false) {
    if (sitemap.includes(`hreflang="${locale.code}"`)) throw new Error(`${locale.code} must not be emitted as an unsupported sitemap hreflang`);
  } else {
    assertIncludes(sitemap, `hreflang="${locale.code}" href="https://qwertycoin.org${locale.path}"`, `${locale.code} sitemap alternate`);
  }
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
await stat(path.join(root, "assets", "epose", "epose-consensus-formula-de.svg"));
await stat(path.join(root, "assets", "epose", "epose-consensus-formula-neutral.svg"));
await stat(path.join(dist, "assets", "epose", "epose-consensus-formula.svg"));
await stat(path.join(dist, "assets", "epose", "epose-consensus-formula-de.svg"));
await stat(path.join(dist, "assets", "epose", "epose-consensus-formula-neutral.svg"));
await stat(path.join(root, "assets", "qwc-hero-motif.svg"));
await stat(path.join(root, "assets", "qwc-hero-motif-de.svg"));
await stat(path.join(root, "assets", "qwc-hero-motif-neutral.svg"));
await stat(path.join(dist, "assets", "qwc-hero-motif-de.svg"));
await stat(path.join(dist, "assets", "qwc-hero-motif-neutral.svg"));
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
for (const locale of localeConfig.filter((item) => item.code !== "en")) {
  await stat(path.join(root, locale.path.slice(1), "index.html"));
  await stat(path.join(dist, locale.path.slice(1), "index.html"));
}
await stat(path.join(root, "404.html"));
await stat(path.join(dist, "sitemap.xml"));

console.log("QWC website checks passed");
