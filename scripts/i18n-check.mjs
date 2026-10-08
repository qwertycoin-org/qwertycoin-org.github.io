import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import locales from "../src/i18n/locales.json" with { type: "json" };

const root = new URL("..", import.meta.url).pathname;
const i18nDir = path.join(root, "src", "i18n");
const registeredCodes = new Set();
const registeredPaths = new Set();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function flatten(value, prefix = "") {
  if (typeof value === "string") return [[prefix, value]];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => flatten(item, `${prefix}[${index}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => flatten(item, prefix ? `${prefix}.${key}` : key));
  }
  return [[prefix, value]];
}

function shape(value) {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, shape(item)]));
  }
  return typeof value;
}

function compareShape(expected, actual, prefix = "") {
  const problems = [];
  if (JSON.stringify(shape(expected)) === JSON.stringify(shape(actual))) return problems;
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) return [`${prefix}: expected array`];
    if (expected.length !== actual.length) problems.push(`${prefix}: expected ${expected.length} array items, got ${actual.length}`);
    const length = Math.min(expected.length, actual.length);
    for (let i = 0; i < length; i += 1) problems.push(...compareShape(expected[i], actual[i], `${prefix}[${i}]`));
    return problems;
  }
  if (expected && typeof expected === "object") {
    if (!actual || typeof actual !== "object" || Array.isArray(actual)) return [`${prefix}: expected object`];
    for (const key of Object.keys(expected)) {
      if (!(key in actual)) problems.push(`${prefix ? `${prefix}.` : ""}${key}: missing key`);
      else problems.push(...compareShape(expected[key], actual[key], prefix ? `${prefix}.${key}` : key));
    }
    for (const key of Object.keys(actual)) {
      if (!(key in expected)) problems.push(`${prefix ? `${prefix}.` : ""}${key}: unknown key`);
    }
    return problems;
  }
  if (typeof expected !== typeof actual) problems.push(`${prefix}: expected ${typeof expected}, got ${typeof actual}`);
  return problems;
}

function placeholders(value) {
  return [...value.matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map((match) => match[1]).sort();
}

function immutableTerms(value) {
  return [...value.matchAll(/\b(?:Qwertycoin GUI|QWC Core|Web Wallet|Docker Hub|Neoxa Exchange|Windows Server|Apple Silicon|qwertycoin-wallet-cli|qwertycoin-wallet-rpc|qwertycoind|Qwertycoin|QWC|EPoSe|RandomX|PPLNS|XMRig|SHA-256|SHA256SUMS|GitHub|Docker|Mainnet|CryptoNote|GLIBCXX|GLIBC|Windows|macOS|Linux|PWA|RPC|P2P|GUI|CLI|API|x86_64)\b/g)]
    .map((match) => match[0]);
}

const allowedIdenticalPatterns = [
  /^(?:nav\.epose|metrics\.explorer|system\.(?:securityTitle|infrastructureTitle)|technology\.features\[(?:2|3)\]\.badge|epose\.eyebrow|wallet\.cards\[(?:0|1)\]\.title|releases\.cards\[3\]\.title|community\.explorer|notFound\.eyebrow)$/,
  /^participate\.paths\[\d+\]\.kind$/,
  /(?:\.icon|\.href|\.sha256|\.badgeClass|\.glyph|\.downloadsLayout|\.code)$/,
  /^releases\.cards\[(?:0|1)\]\.downloads\[\d+\]\.label$/,
  /^releases\.cards\[0\]\.downloads\[\d+\](?:\.alternatives\[\d+\])?\.shaLabel$/,
  /^releases\.cards\[(?:0|1)\]\.verificationLinks\[0\]\.label$/,
  /^specs\.items\[(?:0|1|2|3|4|11|12|15|16|17|18)\]\[1\]$/,
  /^specs\.items\[(?:15|16|17|18)\]\[0\]$/,
  /^roadmap\.items\[(?:0|1)\]\.badge$/,
  /^roadmap\.items\[1\]\.title$/,
  /^history\.items\[(?:0|1|3)\]\.date$/
];

const allowedIdenticalByLocale = {
  nl: new Set([
    "nav.mining", "nav.releases", "nav.wallet", "system.securityLabel",
    "technology.features[1].badge", "mining.eyebrow", "wallet.eyebrow",
    "releases.eyebrow", "specs.items[1][0]", "specs.items[3][0]",
    "specs.items[5][0]", "roadmap.eyebrow", "history.items[2].date",
    "community.eyebrow", "footer.roadmap"
  ]),
  fr: new Set([
    "epose.links[1]", "epose.glossary[3].term", "specs.items[5][0]",
    "footer.documentation"
  ]),
  it: new Set([
    "nav.mining", "system.securityLabel", "technology.features[1].badge",
    "mining.eyebrow", "specs.items[1][0]", "roadmap.eyebrow",
    "footer.roadmap"
  ])
};

function mayMatchEnglish(code, key) {
  return allowedIdenticalPatterns.some((pattern) => pattern.test(key))
    || allowedIdenticalByLocale[code]?.has(key);
}

for (const locale of locales) {
  assert(locale.code && /^[a-z]{2,3}(?:-[A-Z][a-z]{3})?(?:-(?:[A-Z]{2}|\d{3}))?$/.test(locale.code), `Invalid BCP-47 locale code: ${locale.code}`);
  assert(!registeredCodes.has(locale.code), `Duplicate locale code: ${locale.code}`);
  registeredCodes.add(locale.code);
  assert(locale.label && locale.nativeName && locale.path, `Locale ${locale.code} is missing label, nativeName, or path`);
  assert(locale.path === "/" || /^\/[a-z0-9-]+\/$/.test(locale.path), `Locale ${locale.code} has an invalid path: ${locale.path}`);
  assert(!registeredPaths.has(locale.path), `Duplicate locale path: ${locale.path}`);
  registeredPaths.add(locale.path);
  assert(locale.ogLocale, `Locale ${locale.code} is missing ogLocale`);
}

const files = (await readdir(i18nDir)).filter((file) => file.endsWith(".json") && file !== "locales.json");
assert(files.includes("en.json"), "Missing canonical en.json");
assert(files.length === registeredCodes.size, `Expected ${registeredCodes.size} locale files, found ${files.length}`);

const source = JSON.parse(await readFile(path.join(i18nDir, "en.json"), "utf8"));
const sourceStrings = flatten(source);

for (const [key, value] of sourceStrings) {
  assert(typeof value === "string", `en.json contains non-string leaf at ${key}`);
  assert(value.trim(), `en.json contains empty string at ${key}`);
  assert(!/<[a-z][\s\S]*>/i.test(value), `en.json contains HTML-like markup at ${key}`);
}

for (const file of files) {
  const code = file.replace(/\.json$/, "");
  assert(registeredCodes.has(code), `${file} is not registered in locales.json`);
  const locale = JSON.parse(await readFile(path.join(i18nDir, file), "utf8"));
  const problems = compareShape(source, locale);
  assert(problems.length === 0, `${file} does not match en.json:\n${problems.join("\n")}`);
  for (const [key, value] of flatten(locale)) {
    assert(typeof value === "string", `${file} contains non-string leaf at ${key}`);
    assert(value.trim(), `${file} contains empty string at ${key}`);
    assert(!/<[a-z][\s\S]*>/i.test(value), `${file} contains HTML-like markup at ${key}`);
    assert(!/ZX9F\d+X|QWC_SPLIT/i.test(value), `${file} contains a translation-workflow marker at ${key}`);
    const sourceValue = sourceStrings.find(([sourceKey]) => sourceKey === key)?.[1];
    assert(JSON.stringify(placeholders(value)) === JSON.stringify(placeholders(sourceValue)), `${file} changes placeholders at ${key}`);
    for (const term of immutableTerms(sourceValue)) {
      if (code !== "de") assert(value.includes(term), `${file} changes immutable term ${term} at ${key}`);
    }
    if (code !== "en" && code !== "de") {
      assert(value !== sourceValue || mayMatchEnglish(code, key), `${file} silently falls back to English at ${key}`);
    }
    if (code === "zh-Hans") {
      assert(!/[體網節點礦區塊獎勵證實資軟錢鏈數據開發維護選擇當統識別執頁語態終應過還為與將這個後間時現務從對無種類]/u.test(value), `${file} contains a traditional-only character at ${key}`);
    }
  }
  console.log(`${file}: ${flatten(locale).length}/${sourceStrings.length} keys`);
}

console.log("i18n checks passed");
