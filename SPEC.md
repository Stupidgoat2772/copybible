# CopyBible — SPEC

## Purpose

Look up a Bible verse. Copy it. One click. No ads, no commentary, no friction.

## UX Flow

Three-panel tile selector → verse display → copy button.

```
[Book tiles]  →  [Chapter tiles]  →  [Verse tiles]  →  [Verse text + Copy]
 Genesis          1  2  3 ...         1  2  3 ...       "In the beginning..."
 Exodus                                                  [COPY]
 Leviticus
 ...
```

1. **Book panel** — 66 tiles (all books). Click one → chapter panel appears.
2. **Chapter panel** — N tiles (number of chapters in that book). Click one → verse panel appears.
3. **Verse panel** — N tiles (number of verses in that chapter). Click one → verse text renders.
4. **Verse display** — Clean rendered text with reference. Single copy button copies `"verse text" — Book Chapter:Verse` to clipboard.

Panels are tiled grids of clickable squares. Keyboard nav welcome but not v0.

## Stack

- **Pure static site** — HTML + CSS + JS. No framework. No build step.
- **Data** — KJV as JSON, shipped client-side. ~31,000 verses, ~4-5MB raw, <1.5MB gzipped.
- **Hosting** — Anywhere static files can live. GitHub Pages, Vercel, local file://.
- **Dependencies** — Zero.

## Data Format

```json
{
  "Genesis": {
    "1": {
      "1": "In the beginning God created the heaven and the earth.",
      "2": "And the earth was without form, and void..."
    }
  }
}
```

Nested: `data[book][chapter][verse]` → string.

## Copy Format

Clipboard output: `"In the beginning God created the heaven and the earth." — Genesis 1:1`

Quoted verse text + em dash + reference.

## v0 Scope

- KJV only
- Tile navigation (book → chapter → verse)
- One-click copy to clipboard
- Visual copy confirmation (button flash or text)
- Mobile-friendly tile layout
- Fuzzy book search/filter (type to narrow book tiles)

## v1 Ideas (not now)

- Range select (Genesis 1:1-3)
- Keyboard-driven nav (type reference directly)
- Multiple translations
- URL defined verse for sharing (copybible.com/John/3/16)
- Dark/light mode toggle
- Recent lookups
