# Qwertycoin Design System

The website and the future web wallet should share a quiet, technical visual
language. The primary tokens live in `css/tokens.css`.

## Direction

- Modern, reduced, infrastructure-oriented
- High contrast without casino or trading visual language
- No external fonts, no remote icon libraries, no decorative gradient orbs
- Dense enough for technical users, still readable on mobile
- QWC-specific network motif: a living QWC chain pulse, restrained node
  connections, EPoSe attestation flow, and deterministic reward rotation

## Tokens

- Colors: ink, surface, panel, QWC blue, amber accent, status colors, and soft
  accent surfaces
- Typography: native system sans stack and system monospace
- Radius: 4px controls, 8px cards, 14px large surfaces
- Spacing: explicit `--space-*` scale
- Components: buttons, cards, badges, alerts, tables, code blocks, status panels

## Visual Motif

The relaunch uses one recurring motif instead of generic crypto imagery:

```text
QWC chain pulse -> distributed nodes -> EPoSe proof -> deterministic rewards
```

Use it differently by context. The hero stays simple: a living network field and
the live chain pulse, not an architecture diagram. The EPoSe section carries the
technical flow: registration, attestation, qualification, and deterministic
rewards. Future wallet surfaces should reuse the same amber QWC accent, blue
network lines, and green live-state indicators. Keep motion subtle and always
support reduced motion.

## Wallet Reuse

The web wallet should import or mirror `tokens.css` before copying component
patterns. Wallet-specific views may add secure form controls and modal dialogs,
but should keep the same typography, status badges, spacing, and restrained
technical style.

## Product Header

The website, explorer, and web wallet use one product-header contract:

- 82px minimum height on desktop and 72px at the 1200px navigation breakpoint
- 42px Qwertycoin mark with an Archivo 900 uppercase wordmark
- optional product label beside the wordmark on desktop; hide it at 720px
- Inter/Archivo navigation treatment with the product-specific links only
- 2px ink divider on the full-width header
- 44px square mobile menu control with a 2px ink border, amber fill, 4px ink
  offset shadow, and three 2px bars
- expanded mobile menu as an ink-bordered surface; `Escape` closes it and
  returns focus to the control

Keep the dimensions and breakpoints byte-for-byte aligned across the three
products. Product names and destination links may differ.

The wallet preview on the website is static by design. It establishes the visual
language for `wallet.qwertycoin.org` without accepting seeds or signing
transactions on the main website.
