import { cp, rm, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import locales from "../src/i18n/locales.json" with { type: "json" };
import { renderNotFoundPage, renderPage, renderSitemap } from "../src/render-site.mjs";

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

const cssDir = path.join(dist, "css");
const jsDir = path.join(dist, "js");
const fontFiles = [
  "archivo-latin-900.woff2",
  "inter-latin-400.woff2",
  "inter-latin-600.woff2"
];
const fontAssets = {};
const distFontVersionDir = path.join(dist, "assets", "fonts", "v");
const rootFontVersionDir = path.join(root, "assets", "fonts", "v");
await mkdir(distFontVersionDir, { recursive: true });
await mkdir(rootFontVersionDir, { recursive: true });

for (const fileName of fontFiles) {
  const sourcePath = path.join(root, "assets", "fonts", fileName);
  const data = await readFile(sourcePath);
  const hash = createHash("sha256").update(data).digest("hex").slice(0, 12);
  const parsed = path.parse(fileName);
  const hashedName = `${parsed.name}.${hash}${parsed.ext}`;
  await writeFile(path.join(distFontVersionDir, hashedName), data);
  await writeFile(path.join(rootFontVersionDir, hashedName), data);
  fontAssets[fileName] = `/assets/fonts/v/${hashedName}`;
}

const tokensCss = await readFile(path.join(root, "css", "tokens.css"), "utf8");
const siteCss = await readFile(path.join(root, "css", "site.css"), "utf8");
let bundledCss = siteCss.startsWith('@import url("./tokens.css");')
  ? `${tokensCss}\n${siteCss.replace(/^@import url\("\.\/tokens\.css"\);\s*/u, "")}`
  : siteCss;

for (const [fileName, hashedPath] of Object.entries(fontAssets)) {
  bundledCss = bundledCss
    .replaceAll(`url("../assets/fonts/${fileName}")`, `url("${hashedPath}")`)
    .replaceAll(`url("/assets/fonts/${fileName}")`, `url("${hashedPath}")`);
}

const cssHash = createHash("sha256").update(bundledCss).digest("hex").slice(0, 12);
const cssAsset = `site.${cssHash}.css`;
const distCssVersionDir = path.join(cssDir, "v");
const rootCssVersionDir = path.join(root, "css", "v");
const distJsVersionDir = path.join(jsDir, "v");
const rootJsVersionDir = path.join(root, "js", "v");

await mkdir(distCssVersionDir, { recursive: true });
await mkdir(rootCssVersionDir, { recursive: true });
await mkdir(distJsVersionDir, { recursive: true });
await mkdir(rootJsVersionDir, { recursive: true });

await writeFile(path.join(cssDir, "site.css"), bundledCss);
await writeFile(path.join(distCssVersionDir, cssAsset), bundledCss);
await writeFile(path.join(root, "css", "site.css"), bundledCss);
await writeFile(path.join(rootCssVersionDir, cssAsset), bundledCss);

async function hashJsAsset(fileName) {
  const source = await readFile(path.join(root, "js", fileName), "utf8");
  const hash = createHash("sha256").update(source).digest("hex").slice(0, 12);
  const parsed = path.parse(fileName);
  const hashedName = `${parsed.name}.${hash}${parsed.ext}`;
  await writeFile(path.join(distJsVersionDir, hashedName), source);
  await writeFile(path.join(rootJsVersionDir, hashedName), source);
  return hashedName;
}

const networkStatusJs = await hashJsAsset("network-status.js");
const navMenuJs = await hashJsAsset("nav-menu.js");
const assets = {
  css: `/css/v/${cssAsset}`,
  fonts: {
    archivo900: fontAssets["archivo-latin-900.woff2"],
    inter400: fontAssets["inter-latin-400.woff2"]
  },
  networkStatusJs: `/js/v/${networkStatusJs}`,
  navMenuJs: `/js/v/${navMenuJs}`
};

for (const locale of locales) {
  const pageDir = locale.path === "/" ? dist : path.join(dist, locale.path);
  await mkdir(pageDir, { recursive: true });
  const html = renderPage(locale.code, assets);
  await writeFile(path.join(pageDir, "index.html"), html);

  const rootPageDir = locale.path === "/" ? root : path.join(root, locale.path);
  await mkdir(rootPageDir, { recursive: true });
  await writeFile(path.join(rootPageDir, "index.html"), html);
}

const sitemap = renderSitemap();
await writeFile(path.join(dist, "sitemap.xml"), sitemap);
await writeFile(path.join(root, "sitemap.xml"), sitemap);

const notFound = renderNotFoundPage("en", assets);
await writeFile(path.join(dist, "404.html"), notFound);
await writeFile(path.join(root, "404.html"), notFound);

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
