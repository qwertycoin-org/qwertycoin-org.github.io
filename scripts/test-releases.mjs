import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readReleaseTargets } from "../src/render-releases.mjs";

const root = new URL("../", import.meta.url);
const read = (file) => readFile(new URL(file, root), "utf8");
const redirects = await read("dist/_redirects");
const page = await read("dist/releases.html");
const products = readReleaseTargets(redirects);
const rules = new Map(redirects.split("\n").filter((line) => line.startsWith("/")).map((line) => line.split(/\s+/)));

// Every landing-page download resolves via a deployed rule, not a stale URL.
const links = [...page.matchAll(/href="(\/get\/[^"#]+)"/g)].map((match) => match[1]);
assert.equal(links.length, 12); // 8 packages + 2 checksum files + 2 release notes.
assert.equal(new Set(links).size, 12);
for (const link of links) assert.ok(rules.has(link), `Unresolved download: ${link}`);
for (const product of Object.values(products)) {
  assert.ok(page.includes(product.version));
  assert.ok(page.includes(`href="${product.notes}"`));
}
assert.ok(!rules.has("/releases"), "The landing page must not redirect to the homepage");
assert.equal(rules.get("/get"), "https://qwertycoin.org/releases");
assert.equal(rules.get("/get/"), "https://qwertycoin.org/releases");
assert.ok(page.includes('<link rel="canonical" href="https://qwertycoin.org/releases">'));
assert.ok(page.includes('property="og:url" content="https://qwertycoin.org/releases"'));
assert.ok(page.includes('name="twitter:card" content="summary_large_image"'));
assert.ok((await read("dist/sitemap.xml")).includes("<loc>https://qwertycoin.org/releases</loc>"));
assert.equal(page, await read("releases.html"));

// A partially updated release must fail the build, including checksum drift.
const checksumRule = redirects.split("\n").find((line) => line.startsWith("/get/gui/checksums "));
assert.throws(() => readReleaseTargets(redirects.replace(checksumRule, checksumRule.replace(products.gui.version, "v0.0.0"))));
assert.throws(() => readReleaseTargets(redirects.replace("/get/gui/linux ", "/removed/gui/linux ")));
console.log("QWC release landing-page checks passed");
