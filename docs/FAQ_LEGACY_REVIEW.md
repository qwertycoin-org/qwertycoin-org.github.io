# Legacy-wallet FAQ editorial review

## Scope

This update extends the existing FAQ on every published home page: `en`, `de`,
`zh-Hans`, `nl`, `eo`, `fr`, `it`, `ja`, `jbo`, `pt`, `ru`, `es`. It replaces the
previous abbreviated legacy-wallet question rather than keeping two answers.
The existing current-network restore answer, participation card, download
compatibility note and history warning explicitly exclude legacy balances.

The ten answers live in `faq.legacyItems` in each locale file. The renderer uses
these same entries for native `<details>` and the existing FAQPage JSON-LD.
Paragraphs and resource links are shared with the structured answer; there is no
second copy of the content. No release number is used in the new guidance.

## Support links

Append these fragments to the existing locale URL, for example
`https://qwertycoin.org/de/#faq-legacy-balances`:

| Topic | Fragment |
| --- | --- |
| Legacy balances cannot be transferred | `#faq-legacy-balances` |
| Pre-relaunch wallet software | `#faq-legacy-wallets` |
| Reasons for the separate network | `#faq-legacy-relaunch` |
| Historical thousand-to-one proposal, no current exchange | `#faq-legacy-1000-to-1` |
| Keeping old backups and keys safe | `#faq-legacy-backups` |
| Keys are not universally invalid; chain history is needed | `#faq-legacy-keys` |
| Possible legacy-chain recovery, not current-chain credit | `#faq-legacy-chain-recovery` |
| Historical transport token and separate unconfirmed planning | `#faq-legacy-transition-token` |
| Infrastructure costs, known servers and EPoSe incentives | `#faq-legacy-network-support` |
| No premine or reserved developer allocation | `#faq-legacy-no-premine` |

`#faq` is preserved; `#faq-legacy` targets the group heading. Item fragments open
their answer on initial load and hash changes. The existing language switcher
preserves them. Without JavaScript, the native summaries remain operable.

## Editorial sources and limits

- The project operator's revised brief dated 16 October 2026 is the editorial
  authority for the 2023 discussions, jointly agreed community-inspired
  transition, transport-token purpose, team knowledge about legacy copies and
  the last two known servers. These are not presented as independently proven
  worldwide facts or as the result of a formal on-chain vote.
- The [project account's historical 2025 announcement][archive] confirms the
  transition-token phase and historical 1000:1 ratio. The FAQ labels this link
  as historical and **not a current swap offer**. It does not reproduce the old
  procedure, portal, dates, addresses or redemption instructions. The archive
  is not evidence of any current or future entitlement.
- The [2026 project announcement][launch] explicitly describes a fresh genesis,
  no premine and no imported old balances, while distinguishing 2025-token
  participants from legacy-chain balances.
- The [current Core documentation][core] describes RandomX block production and
  EPoSe service rewards separately. No unambiguous official documentation was
  found connecting today's emission scale to the historical 1000:1 proposal.
  Answer 4 therefore omits the reference draft's denomination/emission claim.
  No supply number, maximum-supply assertion or new financial promise is added.

[archive]: https://bitcointalk.org/index.php?topic=5552541.0
[launch]: https://bitcointalk.org/index.php?topic=5594105.0
[core]: https://github.com/qwertycoin-org/qwertycoin

## Language review still required

No fluent human language approval is claimed. Every locale has a complete target
text, not an English fallback. Community proofreading is welcome for all
translations. In particular, please obtain fluent **Lojban** and **Esperanto**
review before merging:

- `jbo`, all ten `faq.legacyItems`: review clause scope and negation, especially
  `balances`, `1000-to-1`, `keys`, `transition-token`, and `no-premine`.
- `jbo`: review the descriptive terms `lo zasni jdini sinxa` (temporary token),
  `lo xruti valsi` (recovery phrase), `lo sivni ckiku` (private key), and the
  distinction between restoring chain history and running a live network.
- `jbo.network-support`: ensure the statement about two known servers remains
  explicitly attributed to the project team, without implying global knowledge.
- `jbo.transition-token`: ensure planning and a possible allocation cannot be
  read as a promise, entitlement or current redemption service.
- `eo`: review `transporta ĵetono`, `restaŭra frazo`, and `geneza bloko`, plus the
  distinction between future planning and an enforceable or automatic payout.
- Across all languages, check that local formatting of thousand-to-one retains
  the factor **1000:1**, not one-to-one or one-to-one-thousand.

Automated completeness, terminology and browser checks do not replace this
linguistic review. See [TRANSLATIONS.md](TRANSLATIONS.md) for existing conventions.

## Verification

- `npm ci` and `npm test`: locale structure/identifiers, all twelve generated
  pages, website contracts, FAQ/JSON-LD identity and network-status tests pass.
- `node --check` on the renderer, navigation script and site test passes.
- `html-validate` passes for all twelve generated FAQ sections in document
  wrappers. Full-page validation has the same 61 errors as the
  exact `master` baseline: lowercase doctype, existing `aria-label` usage on
  generic elements and one existing long title. No new findings or relaxed
  validation rules; unrelated baseline markup is not changed in this PR.
- The historical 2025 announcement returns HTTP 200. Locale-aware internal
  wallet/community links are checked by the site and browser checks.
- Chromium browser verification passes for all twelve locales at 1440×1000,
  390×844 and 320×740: 36 layouts, all 19 questions expanded/collapsed by
  keyboard, visible-answer/JSON-LD equality, ten legacy anchors, hash changes,
  actual language-switch navigation, internal links and no horizontal overflow.
  Long translated answers were also visually inspected in desktop/mobile
  screenshots. Motion was reduced for repeatable checks; live explorer requests
  were isolated from these content tests.
- Native accordions work with JavaScript disabled in all twelve locales at
  390×844. No screenshot or temporary test artifact is committed.
