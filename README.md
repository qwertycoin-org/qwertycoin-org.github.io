# Qwertycoin Website

Source for the official public Qwertycoin website at [qwertycoin.org](https://qwertycoin.org/).
This repository contains the Qwertycoin v2 relaunch site and preserves the relevant contributor credits from the previous website.

## Scope and stack

- Static HTML, CSS, JavaScript, and SVG assets
- Twelve complete language editions generated from structured locale files
- Cloudflare Pages deployment with no framework preset
- No wallet key handling on the main domain
- No third-party JavaScript, external stylesheets, or externally hosted fonts

The community section links to [Discord](https://qwertycoin.org/out/discord) and the [2026 Bitcointalk discussion](https://bitcointalk.org/index.php?topic=5594105), alongside GitHub, X and the official explorer. Below it, four independent third-party resources appear in this order: the current-network [Blockspot.io profile](https://blockspot.io/coin/qwertycoin-qwc/), the [MiningPoolStats QWC directory](https://miningpoolstats.stream/qwertycoin), the [Coinranking QWC profile](https://coinranking.com/coin/1QwUFzI4O2xu_+qwertycoin-qwc), and the [CoinMarketCap QWC profile](https://coinmarketcap.com/currencies/qwertycoin/) as the final card. The separate Trade QWC section links directly to the Neoxa QWC/USDT market. A directory or price profile is not an exchange listing or a partnership.

Coinranking describes the 2026 relaunch but still shows legacy-chain supply and no current markets. CoinMarketCap also shows old-chain supply. Both cards explicitly label their figures as legacy data rather than current-network market data. Live Coin Watch still describes CryptoNight and an old trading date and remains excluded pending correction. Use the official explorer for current-chain data. Other P2/P3, historical, and unconfirmed entries from the 29 October 2026 editorial inventory remain unpublished.

The listing marks are served locally: the official [Blockspot icon](https://blockspot.io/logo/), [MiningPoolStats site icon](https://miningpoolstats.stream/android-icon-192x192.png), [Coinranking site icon](https://coinranking.com/static/logo.svg), and [CoinMarketCap site icon](https://coinmarketcap.com/apple-touch-icon.png). They identify independent third-party services; their trademarks remain with their owners and their appearance does not imply endorsement.

Both `/whitepaper` and `/whitepaper/` permanently redirect to the current whitepaper at [wp.qwertycoin.org](https://wp.qwertycoin.org/).

Both `/out/discord` and `/out/discord/` temporarily redirect (HTTP 302) to the current Discord invite. Update the destination in `_redirects` if the invite changes. A permanent 301 would risk browsers retaining an obsolete invite. Wallet download links are not routed through `/out/` yet.

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
