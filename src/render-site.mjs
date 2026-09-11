import en from "./i18n/en.json" with { type: "json" };
import de from "./i18n/de.json" with { type: "json" };
import locales from "./i18n/locales.json" with { type: "json" };
import network from "./config/network.json" with { type: "json" };

const dictionaries = { en, de };

const eposeParams = {
  blocks: network.epose.epochLengthBlocks,
  seconds: network.epose.blockTargetSeconds,
  hours: Math.round(network.epose.epochLengthBlocks * network.epose.blockTargetSeconds / 3600),
  committee: network.epose.verifierCommitteeSize,
  fullCommitteeAttestations: Math.ceil(network.epose.verifierCommitteeSize * network.epose.attestationQuorumNumerator / network.epose.attestationQuorumDenominator),
  rewardPercent: network.epose.serviceRewardBps / 100
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function interpolate(value, params = eposeParams) {
  return String(value).replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => params[key] ?? `{${key}}`);
}

function text(value, params) {
  return escapeHtml(interpolate(value, params));
}

function scriptJson(value) {
  return JSON.stringify(value).replace(/[<>&]/g, (char) => ({
    "<": "\\u003c",
    ">": "\\u003e",
    "&": "\\u0026"
  })[char]);
}

function pathFor(locale) {
  return locale.path;
}

function absoluteUrl(locale) {
  return `${network.siteUrl}${pathFor(locale)}`;
}

function languageSwitcher(currentLocale) {
  const languageLabel = text(dictionaries[currentLocale.code].nav.language);
  const languageShortLabel = text(dictionaries[currentLocale.code].nav.languageShort);
  const menuId = `locale-menu-${currentLocale.code}`;
  return `<div class="locale-switcher" aria-label="${languageLabel}">
    <button class="locale-toggle" type="button" aria-expanded="false" aria-controls="${menuId}" data-locale-toggle>
      <span>${languageShortLabel}</span>
      <strong>${text(currentLocale.code.toUpperCase())}</strong>
    </button>
    <div class="locale-menu" id="${menuId}">
${locales.map((locale) => `<a href="${pathFor(locale)}" hreflang="${locale.code}" lang="${locale.code}" data-locale-option="${locale.code}"${locale.code === currentLocale.code ? ' aria-current="true"' : ""}><strong>${text(locale.code.toUpperCase())}</strong><span>${text(locale.nativeName)}</span></a>`).join("\n")}
    </div>
  </div>`;
}

function brand(locale) {
  const label = dictionaries[locale.code]?.nav?.homeLabel || "Qwertycoin home";
  return `<a class="brand" href="${pathFor(locale)}#home" aria-label="${text(label)}">
          <img src="/assets/qwertycoin-mark.svg" alt="" width="42" height="42">
          <span>Qwertycoin</span>
        </a>`;
}

function sectionHeader(eyebrow, title, body) {
  const bodyHtml = body ? `
            <p>${text(body)}</p>` : "";
  return `<div class="section-header">
            <p class="eyebrow">${text(eyebrow)}</p>
            <h2>${text(title)}</h2>${bodyHtml}
          </div>`;
}

function metricCard(metric, valueKey, loadingLabel) {
  return `<div class="pulse-stat metric-help">
                  <span>${text(metric.shortLabel || metric.label)}</span>
                  <strong data-status="${valueKey}">${text(loadingLabel)}</strong>
                  <small>${text(metric.help)}</small>
                </div>`;
}

function networkKpi(metric, valueKey, loadingLabel) {
  return `<div class="network-kpi metric-help">
                <span>${text(metric.label)}</span>
                <strong data-status="${valueKey}">${text(loadingLabel)}</strong>
                <small>${text(metric.help)}</small>
              </div>`;
}

function releaseItemLink(item) {
  const className = item.href ? "release-link" : "release-link disabled";
  const href = item.href ? ` href="${item.href}"` : "";
  const target = item.href && item.href.startsWith("http") ? ' target="_blank" rel="noopener"' : "";
  return `<a class="${className}"${href}${target}><span aria-hidden="true">${text(item.icon)}</span>${text(item.label)}</a>`;
}

function releaseCard(card) {
  return `<article class="release-card">
                <div class="release-card-head">
                  <div>
                    <span class="badge ${text(card.badgeClass)}">${text(card.badge)}</span>
                    <h3>${text(card.title)}</h3>
                  </div>
                  <span class="release-glyph" aria-hidden="true">${text(card.glyph)}</span>
                </div>
                <p>${text(card.body)}</p>
                <div class="release-links">${card.links.map(releaseItemLink).join("")}</div>
              </article>`;
}

function specCard(item) {
  return `<div class="spec-mobile-card"><span>${text(item[0])}</span><strong>${text(item[1])}</strong></div>`;
}

function faqSchema(t, locale) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${network.siteUrl}/#organization`,
        "name": "Qwertycoin",
        "url": `${network.siteUrl}/`,
        "logo": `${network.siteUrl}/assets/favicon-192x192.png`,
        "sameAs": [network.githubUrl, "https://x.com/Qwertycoin_QWC"]
      },
      {
        "@type": "WebSite",
        "@id": `${network.siteUrl}/#website`,
        "name": "Qwertycoin",
        "url": `${network.siteUrl}/`,
        "publisher": { "@id": `${network.siteUrl}/#organization` }
      },
      {
        "@type": "WebPage",
        "@id": `${absoluteUrl(locale)}#webpage`,
        "url": absoluteUrl(locale),
        "name": interpolate(t.meta.title),
        "description": interpolate(t.meta.description),
        "inLanguage": locale.code,
        "isPartOf": { "@id": `${network.siteUrl}/#website` },
        "about": { "@id": `${network.siteUrl}/#organization` }
      },
      {
        "@type": "FAQPage",
        "@id": `${absoluteUrl(locale)}#faq`,
        "inLanguage": locale.code,
        "isPartOf": { "@id": `${absoluteUrl(locale)}#webpage` },
        "mainEntity": t.faq.items.map((item) => ({
          "@type": "Question",
          "name": interpolate(item.question),
          "acceptedAnswer": { "@type": "Answer", "text": interpolate(item.answer) }
        }))
      }
    ]
  };
}

const defaultAssets = {
  css: "/css/site.css",
  fonts: {
    archivo900: "/assets/fonts/archivo-latin-900.woff2",
    inter400: "/assets/fonts/inter-latin-400.woff2"
  },
  networkStatusJs: "/js/network-status.js",
  navMenuJs: "/js/nav-menu.js"
};

export function renderPage(localeCode, assets = defaultAssets) {
  const locale = locales.find((item) => item.code === localeCode);
  const t = dictionaries[localeCode] || dictionaries.en;
  const canonical = absoluteUrl(locale);
  const alternates = locales.map((item) => `<link rel="alternate" hreflang="${item.code}" href="${absoluteUrl(item)}">`).join("\n    ");
  const alternateOgLocales = locales
    .filter((item) => item.code !== locale.code)
    .map((item) => `<meta property="og:locale:alternate" content="${item.ogLocale}">`)
    .join("\n    ");
  const networkData = {
    locale: locale.code,
    labels: t.metrics,
    config: { epochLengthBlocks: network.epose.epochLengthBlocks }
  };

  return `<!doctype html>
<html lang="${locale.code}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${text(t.meta.title)}</title>
    <meta name="description" content="${text(t.meta.description)}">
    <link rel="canonical" href="${canonical}">
    ${alternates}
    <link rel="alternate" hreflang="x-default" href="${network.siteUrl}/">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${text(t.meta.ogTitle)}">
    <meta property="og:description" content="${text(t.meta.ogDescription)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:site_name" content="Qwertycoin">
    <meta property="og:image" content="${network.siteUrl}/assets/og-image.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:alt" content="${text(t.meta.imageAlt)}">
    <meta property="og:locale" content="${locale.ogLocale}">
    ${alternateOgLocales}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${text(t.meta.ogTitle)}">
    <meta name="twitter:description" content="${text(t.meta.twitterDescription)}">
    <meta name="twitter:image" content="${network.siteUrl}/assets/og-image.png">
    <meta name="twitter:image:alt" content="${text(t.meta.imageAlt)}">
    <link rel="icon" href="/assets/favicon-192x192.png" type="image/png" sizes="192x192">
    <link rel="icon" href="/assets/favicon-32x32.png" type="image/png" sizes="32x32">
    <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
    <link rel="preload" href="${assets.fonts.archivo900}" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="${assets.fonts.inter400}" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="${assets.css}">
    <script type="application/ld+json">${JSON.stringify(faqSchema(t, locale))}</script>
    <script type="application/json" id="qwc-network-data">${scriptJson(networkData)}</script>
  </head>
  <body>
    <a class="skip-link" href="#main-content">${text(t.nav.skip)}</a>
    <header class="site-header">
      <nav class="nav" aria-label="${text(t.nav.menu)}">
        ${brand(locale)}
        <button class="nav-toggle" type="button" aria-controls="primary-menu" aria-expanded="false" data-nav-toggle>
          <span class="nav-toggle-bar"></span>
          <span class="nav-toggle-bar"></span>
          <span class="nav-toggle-bar"></span>
          <span class="nav-toggle-label">${text(t.nav.menu)}</span>
        </button>
        <div class="nav-links" id="primary-menu" data-nav-menu>
          <a href="#technology">${text(t.nav.about)}</a>
          <a href="#epose">${text(t.nav.epose)}</a>
          <a href="#mining">${text(t.nav.mining)}</a>
          <a href="#network">${text(t.nav.network)}</a>
          ${languageSwitcher(locale)}
          <a class="nav-wallet" href="${network.walletUrl}">${text(t.nav.wallet)}</a>
        </div>
      </nav>
    </header>

    <main id="main-content">
      <span class="anchor-alias" id="home"></span>
      <section class="hero classic-hero">
        <div class="hero-inner hero-grid">
          <div class="hero-copy">
            <p class="hero-label"><span class="live-dot" aria-hidden="true"></span>${text(t.hero.pulseLabel)}</p>
            <h1>${text(t.hero.title)}</h1>
            <p class="lead hero-lead">${text(t.hero.lead)}</p>
            <p class="hero-kicker">${text(t.hero.kicker)}</p>
            <div class="actions hero-actions">
              <a class="button primary" href="${network.walletUrl}">${text(t.hero.wallet)}</a>
              <a class="button secondary" href="${network.explorerUrl}">${text(t.hero.explore)}</a>
              <a class="text-link" href="#technology">${text(t.hero.mining)}</a>
            </div>
          </div>
          <div class="hero-system q-motif-stage">
            <img class="q-motif" src="/assets/qwc-hero-motif.svg" alt="${text(t.hero.visualAlt)}" width="1254" height="1254" fetchpriority="high">
          </div>
        </div>
      </section>

      <section class="network-strip" aria-label="${text(t.hero.pulseLabel)}" data-network-status>
        <div class="section-inner network-strip-inner">
          <div>
            <p class="eyebrow">${text(t.hero.pulseLabel)}</p>
            <p>${text(t.hero.pulseBody)}</p>
          </div>
          <div class="pulse-grid">
            ${metricCard(t.metrics.height, "height", t.metrics.loading)}
            ${metricCard(t.metrics.registered, "service-nodes", t.metrics.loading)}
            ${metricCard(t.metrics.qualified, "qualified", t.metrics.loading)}
            ${metricCard(t.metrics.epoch, "epoch", t.metrics.loading)}
          </div>
          <div class="pulse-foot"><span data-status="nettype">mainnet</span><span data-status="sync">${text(t.metrics.syncLoading)}</span><span data-status="updated-at">${text(t.metrics.loading)}</span></div>
          <p class="network-status-message" data-status-message role="status" aria-live="polite" hidden></p>
          <noscript><p class="network-noscript">${text(t.metrics.noScript)}</p></noscript>
        </div>
      </section>

      <section class="system-strip" aria-label="Qwertycoin dual system">
        <div class="section-inner"><div class="dual-system">
          <article><span class="system-label">${text(t.system.securityLabel)}</span><h2>${text(t.system.securityTitle)}</h2><p>${text(t.system.securityBody)}</p></article>
          <div class="system-plus" aria-hidden="true">+</div>
          <article><span class="system-label">${text(t.system.infrastructureLabel)}</span><h2>${text(t.system.infrastructureTitle)}</h2><p>${text(t.system.infrastructureBody)}</p></article>
        </div></div>
      </section>

      <section class="section" id="technology">
        <div class="section-inner">
          ${sectionHeader(t.technology.eyebrow, t.technology.title, t.technology.body)}
          <div class="feature-mosaic">
            ${t.technology.features.map((feature) => `<article class="feature-card">
              <img class="card-icon" src="/assets/classic/${feature.icon}" alt="" width="86" height="86" loading="lazy" decoding="async">
              <span class="badge mainnet">${text(feature.badge)}</span>
              <h3>${text(feature.title)}</h3><p>${text(feature.body)}</p>
            </article>`).join("\n")}
          </div>
        </div>
      </section>

      <section class="section specs-section" id="specs"><div class="section-inner">
        <div class="spec-orbit" aria-label="${text(t.specs.visualAlt)}">
          <picture>
            <source media="(max-width: 720px)" srcset="/assets/classic/about_bg_img-mobile.svg" width="600" height="1080">
            <img src="/assets/classic/about_bg-01_img.svg" alt="" width="1000" height="720" loading="lazy" decoding="async">
          </picture>
          <div class="spec-mobile-grid">
            ${t.specs.items.slice(0, 10).map(specCard).join("\n")}
          </div>
${t.specs.originNote ? `          <p class="spec-origin-note">${text(t.specs.originNote)}</p>` : ""}
        </div>
      </div></section>

      <section class="section dark" id="epose">
        <div class="section-inner">
          ${sectionHeader(t.epose.eyebrow, t.epose.title, t.epose.body)}
          <div class="epose-compact" aria-label="EPoSe flow">
            ${t.epose.compactCards.map((card, index) => `<article class="epose-summary-card"><span>${String(index + 1).padStart(2, "0")}</span><h3>${text(card.title)}</h3><p>${text(card.body)}</p></article>`).join("\n")}
          </div>
          <div class="epose-note-row">
            <div class="tribute"><p class="eyebrow">${text(t.epose.originEyebrow)}</p><h3>${text(t.epose.originTitle)}</h3><p>${text(t.epose.originBody)}</p></div>
            <div class="reward-rules-note"><strong>${text(t.epose.rewardRulesTitle)}</strong><span>${text(t.epose.rewardRulesBody)}</span></div>
          </div>
        </div>
      </section>

      <section class="section alt" id="service-nodes"><div class="section-inner">
        ${sectionHeader(t.serviceNodes.eyebrow, t.serviceNodes.title, t.serviceNodes.body)}
        <table class="comparison"><thead><tr><th>${text(t.serviceNodes.normal)}</th><th>${text(t.serviceNodes.service)}</th></tr></thead><tbody>${t.serviceNodes.rows.map((row) => `<tr><td>${text(row[0])}</td><td>${text(row[1])}</td></tr>`).join("")}</tbody></table>
        <div class="comparison-stack" aria-label="${text(t.serviceNodes.comparisonLabel)}">${t.serviceNodes.rows.map((row) => `<article class="comparison-pair"><div><h3>${text(t.serviceNodes.normal)}</h3><p>${text(row[0])}</p></div><div><h3>${text(t.serviceNodes.service)}</h3><p>${text(row[1])}</p></div></article>`).join("")}</div>
      </div></section>

      <section class="section" id="mining"><div class="section-inner">${sectionHeader(t.mining.eyebrow, t.mining.title, t.mining.body)}<div class="grid two">${t.mining.cards.map((card) => `<article class="card"><h3>${text(card.title)}</h3><p>${text(card.body)}</p></article>`).join("")}</div></div></section>

      <section class="section alt releases-section" id="releases"><span class="anchor-alias" id="wallet"></span><div class="section-inner">
        ${sectionHeader(t.releases.eyebrow, t.releases.title, t.releases.body)}
        <div class="release-grid">
          ${t.releases.cards.map(releaseCard).join("\n")}
        </div>
        <div class="release-note"><strong>${text(t.releases.noteTitle)}</strong><span>${text(t.releases.noteBody)}</span></div>
      </div></section>

      <section class="section dark" id="network"><div class="section-inner">${sectionHeader(t.network.eyebrow, t.network.title, t.network.body)}
        <div class="network-board"><div class="network-kpis">${networkKpi(t.metrics.height, "height", t.metrics.loading)}${networkKpi(t.metrics.epoch, "epoch", t.metrics.loading)}${networkKpi(t.metrics.registered, "service-nodes", t.metrics.loading)}${networkKpi(t.metrics.qualified, "qualified", t.metrics.loading)}</div>
        <p class="qualification-ratio" data-status="qualification-ratio"></p>
        <div class="network-details"><div><span>${text(t.metrics.topHash)}</span><strong data-status="top-hash">${text(t.metrics.loading)}</strong></div><div><span>${text(t.metrics.stateHash)}</span><strong data-status="epose-hash">${text(t.metrics.loading)}</strong></div><div><span>${text(t.metrics.explorer)}</span><strong><a href="${network.explorerUrl}">explorer.qwertycoin.org</a></strong></div><div><span>${text(t.metrics.currentSource)}</span><strong>${text(t.metrics.sourcePending)}</strong></div></div></div>
      </div></section>

      <section class="section" id="faq"><div class="section-inner">${sectionHeader(t.faq.eyebrow, t.faq.title, "")}<div class="faq-list">${t.faq.items.map((item) => `<details><summary>${text(item.question)}</summary><p>${text(item.answer)}</p></details>`).join("")}</div></div></section>
      <section class="section alt" id="roadmap"><div class="section-inner">${sectionHeader(t.roadmap.eyebrow, t.roadmap.title, t.roadmap.body)}<div class="roadmap rail">${t.roadmap.items.map((item) => `<article class="roadmap-item"><div><span class="badge mainnet">${text(item.badge)}</span></div><div><h3>${text(item.title)}</h3><p>${text(item.body)}</p></div></article>`).join("")}</div></div></section>
      <section class="section" id="history"><div class="section-inner">${sectionHeader(t.history.eyebrow, t.history.title, t.history.body)}<div class="history-bridge"><div class="history-year"><strong>2018</strong><span>${text(t.history.bridge[0])}</span></div><div class="history-line" aria-hidden="true"><span></span></div><div class="history-year"><strong>2026</strong><span>${text(t.history.bridge[1])}</span></div></div><div class="timeline">${t.history.items.map((item) => `<article class="timeline-item"><div class="date">${text(item.date)}</div><div><h3>${text(item.title)}</h3><p>${text(item.body)}</p></div></article>`).join("")}</div><div class="alert">${text(t.history.alert)}</div></div></section>
      <section class="section dark" id="developers"><div class="section-inner">${sectionHeader(t.developers.eyebrow, t.developers.title, t.developers.body)}<div class="grid three"><article class="card"><h3>${text(t.developers.sourceTitle)}</h3><p><a href="https://github.com/qwertycoin-org/qwertycoin">${text(t.developers.sourceBody)}</a></p></article><article class="card"><h3>${text(t.developers.legacyTitle)}</h3><p>${text(t.developers.legacyBody)}</p></article><article class="card"><h3>${text(t.developers.registrationTitle)}</h3><p>${text(t.developers.registrationBody)}</p></article></div></div></section>
      <section class="section" id="community"><div class="section-inner">${sectionHeader(t.community.eyebrow, t.community.title, t.community.body)}<div class="grid three"><article class="card"><h3>GitHub</h3><p><a href="${network.githubUrl}">${text(t.community.github)}</a></p></article><article class="card"><h3>Explorer</h3><p><a href="${network.explorerUrl}">${text(t.community.explorer)}</a></p></article><article class="card"><h3>X / Twitter</h3><p><a href="https://x.com/Qwertycoin_QWC">@Qwertycoin_QWC</a></p></article></div></div></section>
    </main>

    <footer class="site-footer"><div class="footer-inner"><div>${brand(locale)}</div><div class="footer-links"><a href="#technology">${text(t.footer.technology)}</a><a href="#history">${text(t.footer.history)}</a><a href="#roadmap">${text(t.footer.roadmap)}</a></div></div></footer>
    <script src="${assets.networkStatusJs}" defer></script>
    <script src="${assets.navMenuJs}" defer></script>
  </body>
</html>
`;
}

export function renderSitemap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${locales.map((locale) => `  <url>
    <loc>${absoluteUrl(locale)}</loc>
${locales.map((alternate) => `    <xhtml:link rel="alternate" hreflang="${alternate.code}" href="${absoluteUrl(alternate)}" />`).join("\n")}
    <xhtml:link rel="alternate" hreflang="x-default" href="${network.siteUrl}/" />
    <changefreq>weekly</changefreq>
    <priority>${locale.code === "en" ? "1.0" : "0.9"}</priority>
  </url>`).join("\n")}
</urlset>
`;
}

export function renderNotFoundPage(localeCode = "en", assets = defaultAssets) {
  const locale = locales.find((item) => item.code === localeCode) || locales[0];
  const t = dictionaries[locale.code] || dictionaries.en;
  return `<!doctype html>
<html lang="${locale.code}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>${text(t.notFound.title)}</title>
    <link rel="stylesheet" href="${assets.css}">
  </head>
  <body>
    <main class="not-found">
      <div class="not-found-panel">
        ${brand(locale)}
        <p class="eyebrow">${text(t.notFound.eyebrow)}</p>
        <h1>${text(t.notFound.heading)}</h1>
        <p>${text(t.notFound.body)}</p>
        <div class="actions">
          <a class="button primary" href="${pathFor(locale)}">${text(t.notFound.home)}</a>
          <a class="button secondary" href="${locale.code === "de" ? "/" : "/de/"}">${text(t.notFound.language)}</a>
        </div>
      </div>
    </main>
  </body>
</html>
`;
}
