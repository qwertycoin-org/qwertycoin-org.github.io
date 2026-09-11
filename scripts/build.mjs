import { cp, rm, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import locales from "../src/i18n/locales.json" with { type: "json" };
import { renderPage, renderSitemap } from "../src/render-site.mjs";

const root = new URL("..", import.meta.url).pathname;
const dist = path.join(root, "dist");
const entries = [
  "_headers",
  "_redirects",
  "assets",
  "css",
  "js",
  "llms.txt",
  "robots.txt"
];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const entry of entries) {
  await cp(path.join(root, entry), path.join(dist, entry), { recursive: true });
}

for (const locale of locales) {
  const pageDir = locale.path === "/" ? dist : path.join(dist, locale.path);
  await mkdir(pageDir, { recursive: true });
  await writeFile(path.join(pageDir, "index.html"), renderPage(locale.code));
}

await writeFile(path.join(dist, "sitemap.xml"), renderSitemap());

async function collectFiles(dir, base = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(full, base));
    else files.push(path.relative(base, full).replaceAll(path.sep, "/"));
  }
  return files;
}

const files = await collectFiles(dist);
const manifest = {};
for (const file of files) {
  if (file === "build-manifest.json") continue;
  const data = await readFile(path.join(dist, file));
  manifest[file] = createHash("sha256").update(data).digest("hex");
}

await writeFile(path.join(dist, "build-manifest.json"), `${JSON.stringify({
  site: "qwertycoin.org",
  generated_at: new Date().toISOString(),
  files: manifest
}, null, 2)}\n`);
