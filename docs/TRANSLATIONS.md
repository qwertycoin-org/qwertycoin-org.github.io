# Qwertycoin Website Translations

English is the canonical source language. Every UI or content change should be
added to `src/i18n/en.json` first.

## Add a New Language

1. Copy the English source file:

```bash
cp src/i18n/en.json src/i18n/es.json
```

2. Translate the strings in the new JSON file. Keep the key structure exactly
   the same. Do not add HTML fragments.

3. Register the locale in `src/i18n/locales.json`:

```json
{
  "code": "es",
  "label": "Spanish",
  "nativeName": "Espanol",
  "path": "/es/",
  "ogLocale": "es_ES"
}
```

4. Run validation:

```bash
npm run i18n:check
npm test
```

5. Open a pull request, for example:

```text
feat(i18n): add Spanish translation
```

For a new community language, the expected files are usually only:

- `src/i18n/<code>.json`
- `src/i18n/locales.json`

## Validation Rules

`npm run i18n:check` verifies:

- valid JSON
- every locale file matches the English key structure
- no unknown or stale keys
- no empty strings
- no HTML-like markup in translation strings
- every translation file is registered
- no duplicate locale codes

The current site expects complete registered languages. If partial community
languages are allowed later, keep English fallback behavior explicit in the
rendering code and mark incomplete languages clearly in `locales.json`.

## Interpolation

Use named placeholders for protocol values:

```json
{
  "epoch": "{blocks} blocks, roughly {hours} hours"
}
```

The current EPoSe network parameters live in `src/config/network.json`.
Do not duplicate values such as `720 blocks` in many places.

## Translation Glossary

Recommended German terms:

| English | German guidance |
| --- | --- |
| Service Node | Service Node |
| EPoSe | EPoSe, do not translate |
| RandomX | RandomX, do not translate |
| Epoch | Epoch |
| Attestation | Attestation |
| Qualified | Qualified |
| Registered | Registered |
| Reward Rotation | Reward Rotation |
| Reward Source Epoch | Reward Source Epoch |
| Verifier Committee | Verifier Committee |
| Admission Proof | Admission Proof |
| Proof of Work | Proof of Work |
| Proof of Service | Proof of Service |

Technical dynamic values are not translated: block hashes, state hashes, QWC
addresses, version numbers, heights, epoch numbers, and ticker symbols.
