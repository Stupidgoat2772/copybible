# CopyBible — Agent SITREP

## What Is This

Static Bible lookup site. Three-panel tile navigation (book → chapter → verse), one-click copy. KJV. No backend, no dependencies, no build step.

## Current State

- **Version:** v0 shipped
- **Status:** Live production static app.
- **Public URL:** https://copybible.app
- **Vercel fallback:** https://copybible-ivory.vercel.app
- **GitHub:** https://github.com/Stupidgoat2772/copybible
- **License:** 0BSD. No attribution requirement; downstream users can copy, modify, sell, or relicense their versions.
- **Vault integration:** Tracked from the parent vault as a Git submodule at `System/Programs/copybible`.

## Deployment

- **Host:** Vercel
- **Project:** `copybible`
- **Vercel account/scope:** `stupidgoat2772-6885`
- **Production domain:** `copybible.app`
- **Git integration:** Connected to `Stupidgoat2772/copybible`, branch `main`
- **Build:** None. Vercel serves the repository root as static output.

## Before You Start Coding

1. Read `SPEC.md` — full UX flow and data format
2. Pure static: `index.html` + `style.css` + `app.js` + `kjv.json`
3. No frameworks. No build tools. No npm.
4. KJV data must be nested JSON: `data[book][chapter][verse]` → string
5. Copy format: `"verse text" — Book Chapter:Verse`

## File Map

```
copybible/
├── .gitignore      # Ignores local Vercel metadata/env files
├── LICENSE         # 0BSD license
├── index.html      # Single page
├── style.css       # Tile grid layout
├── app.js          # Navigation logic + clipboard
├── kjv.json        # Full KJV Bible as nested JSON
├── SPEC.md         # Architecture spec
├── SITREP.md       # This file
└── DOCS.md         # Usage docs
```

## Context

- Owner: Kumo (Damian)
- Solves: every Bible site is bloated. This is instant lookup + copy.
- Stack: pure static HTML/CSS/JS. Ship anywhere.
- Current primary domain is `copybible.app`; `.bible` was skipped because Vercel/domain setup had unsupported-TLD friction.
