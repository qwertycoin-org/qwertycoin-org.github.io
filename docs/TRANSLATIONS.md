# Qwertycoin Website Translations

English is the canonical source language. Every public UI or content change must
be added to `src/i18n/en.json` first and then translated in every registered
locale before it is published. The site intentionally has no silent per-string
English fallback: an incomplete locale fails validation.

The website language is independent from the language of a wallet recovery
phrase. Changing the website language never changes, converts, or selects a
mnemonic word list.

## Published Locales and URLs

| Code | Native name | URL | Search alternate |
| --- | --- | --- | --- |
| `en` | English | `/` | yes; `x-default` |
| `de` | Deutsch | `/de/` | yes |
| `zh-Hans` | 简体中文 | `/zh-hans/` | yes |
| `nl` | Nederlands | `/nl/` | yes |
| `eo` | Esperanto | `/eo/` | yes |
| `fr` | Français | `/fr/` | yes |
| `it` | Italiano | `/it/` | yes |
| `ja` | 日本語 | `/ja/` | yes |
| `jbo` | lojban | `/jbo/` | no; see below |
| `pt` | Português | `/pt/` | yes |
| `ru` | Русский | `/ru/` | yes |
| `es` | Español | `/es/` | yes |

`jbo` is a valid BCP 47/ISO 639-3 language tag and is used for the document
language, direct URL, canonical URL, Open Graph metadata, and sitemap location.
Google documents `hreflang` language values as ISO 639-1 language codes, with
optional ISO 3166-1 regions or ISO 15924 scripts. Lojban has no ISO 639-1 code,
so the renderer deliberately omits a Lojban `hreflang` alternate instead of
inventing a replacement. See the [Google localized-version guidance][google]
and the [IANA language-subtag registry][iana].

[google]: https://developers.google.com/search/docs/specialty/international/localized-versions
[iana]: https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry

## Language Conventions

- `zh-Hans` uses simplified Chinese characters only.
- `pt` uses a broadly understandable international Portuguese register. It
  avoids region-specific idioms; established technical vocabulary follows
  European spelling where a single URL requires a choice.
- `es` uses neutral international Spanish and avoids region-specific idioms.
- Product names and protocol identifiers such as Qwertycoin, QWC, EPoSe,
  RandomX, API names, commands, URLs, versions, hashes, and checksums remain
  unchanged.
- Esperanto is edited as an independent target language, not as English with
  substituted words. Community review by a fluent speaker is still recommended.
- Lojban uses the official grammar and dictionary as references, keeps protocol
  names unchanged, and favors explicit descriptions over invented jargon. The
  translation is structurally complete but requires review by a fluent Lojban
  speaker before it can be described as linguistically certified. References:
  [The Complete Lojban Language][cll] and the [official Lojban site][lojban].

[cll]: https://lojban.org/publications/cll/
[lojban]: https://lojban.org/

The normative terminology for all languages is maintained in
[`LOCALIZATION_GLOSSARY.md`](LOCALIZATION_GLOSSARY.md).

## Add or Update a Language

1. Change `src/i18n/en.json` first.
2. Apply the same key change to every registered locale. Keep the JSON shape
   identical and do not add HTML fragments.
3. Preserve every named placeholder exactly. Translate the surrounding sentence
   as a complete unit instead of concatenating fragments.
4. Keep immutable technical identifiers, numeric protocol rules, commands,
   download URLs, checksums, and formulas unchanged.
5. For a new locale, register a stable URL and metadata in
   `src/i18n/locales.json`. Use a valid BCP 47 tag and a native language name;
   never use a flag as a language label.
6. Update the glossary if a new technical term is introduced.
7. Run the full validation and visually inspect desktop and mobile layouts.

Example locale entry:

```json
{
  "code": "es",
  "label": "Spanish",
  "nativeName": "Español",
  "menuCode": "ES",
  "path": "/es/",
  "ogLocale": "es_ES"
}
```

## Validation

```bash
npm run i18n:check
npm test
```

`npm run i18n:check` verifies:

- valid JSON and one file for every registered locale;
- an exact match with the English key structure;
- no unknown, stale, empty, or HTML-bearing strings;
- valid locale codes, unique stable paths, and required metadata;
- exact named-placeholder multisets;
- preservation of immutable protocol and product identifiers.

`npm test` also builds every locale and verifies direct URLs, document language,
self-canonical URLs, supported `hreflang` alternates, `x-default`, sitemap
entries, Open Graph metadata, language-menu coverage, local-only assets,
internal links, security contracts, and the language-neutral technical graphics.

Before review, inspect at least:

- every locale at its direct URL;
- the language switcher and section/hash preservation;
- narrow mobile widths and the full desktop navigation;
- Chinese and Japanese line breaking;
- Cyrillic and CJK font fallback;
- long French, German, Dutch, Portuguese, and Spanish controls/cards;
- loading, partial, unavailable, and empty network states;
- download labels, compatibility notes, checksum labels, and warnings;
- page title, description, social metadata, image alternatives, and controls.

## Graphics and Accessibility

English and German retain their existing labeled illustrations. Other languages
use language-neutral variants for diagrams whose original labels are converted
to SVG paths. The surrounding localized HTML supplies the translated alternative
text and caption. Mathematical formulas and protocol identifiers stay unchanged.
Decorative images keep empty alternative text.

## Review Expectations

A pull request adding or changing translations must state:

- affected locales and pages;
- the language/register conventions used;
- automated and visual checks performed;
- any unresolved linguistic questions;
- whether a fluent human reviewer has approved Esperanto and Lojban.

Do not describe a machine-assisted or non-fluent review as linguistic approval.
