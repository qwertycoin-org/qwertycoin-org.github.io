import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import locales from "../src/i18n/locales.json" with { type: "json" };

const root = new URL("..", import.meta.url).pathname;
const i18nDir = path.join(root, "src", "i18n");
const registeredCodes = new Set();

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

for (const locale of locales) {
  assert(locale.code && /^[a-z]{2}(-[A-Z]{2})?$/.test(locale.code), `Invalid locale code: ${locale.code}`);
  assert(!registeredCodes.has(locale.code), `Duplicate locale code: ${locale.code}`);
  registeredCodes.add(locale.code);
  assert(locale.label && locale.nativeName && locale.path, `Locale ${locale.code} is missing label, nativeName, or path`);
}

const files = (await readdir(i18nDir)).filter((file) => file.endsWith(".json") && file !== "locales.json");
assert(files.includes("en.json"), "Missing canonical en.json");

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
  }
  console.log(`${file}: ${flatten(locale).length}/${sourceStrings.length} keys`);
}

console.log("i18n checks passed");
