# Qwertycoin Website

Source for the official public Qwertycoin website at [qwertycoin.org](https://qwertycoin.org/).
This repository contains the Qwertycoin v2 relaunch site and preserves the relevant contributor credits from the previous website.

## Scope and stack

- Static HTML, CSS, JavaScript, and SVG assets
- Twelve complete language editions generated from structured locale files
- Cloudflare Pages deployment with no framework preset
- No wallet key handling on the main domain
- No third-party JavaScript, external stylesheets, or externally hosted fonts

The homepage links to independent third-party resources below the community section: the current-network [Blockspot.io profile](https://blockspot.io/coin/qwertycoin-qwc/), the [MiningPoolStats QWC directory](https://miningpoolstats.stream/qwertycoin), the [2026 Bitcointalk announcement](https://bitcointalk.org/index.php?topic=5594105), and the [CoinMarketCap QWC profile](https://coinmarketcap.com/currencies/qwertycoin/) as the final, clearly labeled legacy-data card. The separate Trade QWC section links directly to the Neoxa QWC/USDT market. These categories are not interchangeable: a directory, forum entry, or price profile is not an exchange listing or a partnership.

CoinMarketCap still shows the old chain's supply, so its card explicitly identifies those figures as legacy data rather than current-network market data. Live Coin Watch still describes CryptoNight and an old trading date and remains excluded pending correction. Use the official explorer for current-chain data. Other P2/P3, historical, and unconfirmed entries from the 29 October 2026 editorial inventory remain unpublished.

The listing marks are served locally: the official [Blockspot icon](https://blockspot.io/logo/), [MiningPoolStats site icon](https://miningpoolstats.stream/android-icon-192x192.png), [Bitcointalk favicon](https://bitcointalk.org/favicon.ico), and [CoinMarketCap site icon](https://coinmarketcap.com/apple-touch-icon.png). They identify independent third-party services; their trademarks remain with their owners and their appearance does not imply endorsement.

The non-custodial browser wallet is a separate application at [wallet.qwertycoin.org](https://wallet.qwertycoin.org/).

## Requirements

- Node.js 20 or newer
- npm

## Development

```bash
npm ci
npm test
npm run build
```

The generated site is written to `dist/`. To preview it locally:

```bash
npm run serve
```

Then open <http://localhost:4173/>.

## Available checks

```bash
npm run i18n:check
npm test
```

The checks verify translation structure, required and forbidden content, internal links, local-only scripts and styles, security headers, redirects, sitemap entries, and generated assets.

## Cloudflare Pages

- Framework preset: `None`
- Build command: `npm ci && npm run build && npm test`
- Build output directory: `dist`
- Production branch: `master`
- Preview branch: `feature/website-redesign-2026-09-11`

The root `CNAME` is retained for compatibility with the historical GitHub Pages configuration.

## Project structure

```text
assets/              Local images and visual assets
css/                 Site styles and design tokens
docs/                Design, migration, and translation notes
js/                  Small browser-side modules
scripts/             Build and validation scripts
src/config/          Public network and site configuration
src/i18n/            Canonical English and translated content
src/render-site.mjs  Static page and sitemap renderer
```

Generated files such as `dist/`, dependency directories, artifacts, and macOS metadata must not be committed.

## Translations

The relaunch publishes English, German, simplified Chinese, Dutch, Esperanto,
French, Italian, Japanese, Lojban, Portuguese, Russian, and Spanish. See
[docs/TRANSLATIONS.md](docs/TRANSLATIONS.md) for URL conventions, language
quality notes, validation, and the translation workflow.

The previous website also received translation contributions for Arabic, Bengali, Bhojpuri, Chinese, Farsi, Finnish, French, Hebrew, Hindi, Italian, Japanese, Korean, Malay, Dutch, Punjabi, Polish, Portuguese, Romanian, Russian, Spanish, Swedish, Tamil, Turkish, Urdu, and Vietnamese. Those legacy files remain available through the repository history and are not presented as current v2 translations until reviewed against the new source schema.

## Contributors and thanks

### Development

- [Alex / nnian](https://github.com/nnian)
- Swordfish

### Historical translation contributors

- Arabic: [daoudhichem](https://github.com/daoudhichem)
- Chinese: [mainframer](https://github.com/mainframer)
- French: [christelleleroy92](https://github.com/christelleleroy92)
- Romanian: [ghostx1x](https://github.com/ghostx1x)
- Russian: [Aiwe](https://github.com/aivve), Hamanosh
- Spanish: coinvigilante
- Additional community contributors credited in the previous website history

## Contributing

Keep changes focused and reviewable. Run `npm test` before opening a pull request,
update every registered locale when changing user-facing content, and avoid
introducing remote scripts, trackers, wallet logic, secrets, or private
infrastructure values.
