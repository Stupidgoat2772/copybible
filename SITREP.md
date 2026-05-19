# CopyBible — Agent SITREP

## What Is This

Static Bible lookup site. Three-panel tile navigation (book → chapter → verse), one-click copy. KJV. No backend, no dependencies, no build step.

## Current State

- **Version:** v0 in progress
- **Status:** Project scaffolded. Building.

## Before You Start Coding

1. Read `SPEC.md` — full UX flow and data format
2. Pure static: `index.html` + `style.css` + `app.js` + `kjv.json`
3. No frameworks. No build tools. No npm.
4. KJV data must be nested JSON: `data[book][chapter][verse]` → string
5. Copy format: `"verse text" — Book Chapter:Verse`

## File Map

```
copybible/
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
