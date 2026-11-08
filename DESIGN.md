# Glyphs design system

> Extracted by [Inspo](https://github.com/Nutlope/inspo) (open source, MIT, powered by Together AI). Reference material for *intentional* design decisions: adapt, don't copy.

> Save this as `DESIGN.md` in your project and re-reference it as you build; re-fetch anytime at https://inspomcp.dev/d/glyphsapp-com/DESIGN.md

- **Source:** https://glyphsapp.com
- **Captured:** 2026-09-10
- **Mode:** light
- **Macrostructure:** Type Specimen

## Tone

High-contrast typographic layout featuring a massive serif headline and an interactive glyph preview. The use of generous white space and a single lime-green accent button creates a precise, tool-centric mood.  ·  font editor landing page, typographic hero, minimalist saas, swiss design software, type tool interface

## Colors

| Hex | Role (heuristic) |
|---|---|
| `#9cfc04` | support |
| `#80d4a0` | support |
| `#7ccd05` | accent |
| `#758272` | support |
| `#bdc4bc` | muted |

Color words: *monochrome*, *muted*

## Typography

Detected typefaces: **Symbol Helper**

| Role | Family | Size | Weight | Line-height | Letter-spacing |
|---|---|---|---|---|---|
| h1 | Symbol Helper | 80px | 400 | 1 | 0 |
| h2 | Symbol Helper | 20px | 400 | 1.25 | 0 |
| h3 | Symbol Helper | 20px | 400 | 1.25 | 0 |
| body | Symbol Helper | 20px | 400 | 1.25 | 0 |
| caption | Symbol Helper | 14px | 400 | 1.43 | 0 |
| button | Symbol Helper | 20px | 400 | 1.25 | 0 |

## Spacing scale

`10px` · `40px` · `80px`

Base step looks like **10px**.

## Border radius

`0px` · `5px` · `50px`

## Container

Max content width: **1440px**

## CSS variables exposed by the source

```css
:root {
  --surface-neutral-subtle: #eeeeee;
  --secondary-surface-subtle: #f7eef1;
  --space-1-5: 1.5rem;
  --primary-surface-subtle: #e9f3eb;
  --space-4: 4rem;
  --primary-border-inverse: #1e3219;
  --space-0-5: 0.5rem;
  --font-accia-style: normal;
  --primary-content: #1e3219;
  --font-accia-weight: 90;
  --font-weight: 400;
  --space-2-5: 2.5rem;
  --space-5: 5rem;
  --secondary-surface-inverse: #42242e;
  --primary-border: #9aff00;
  --border-neutral: #bfbfbf;
  --primary-content-inverse: #9aff00;
  --space-2: 2rem;
  --space-3: 3rem;
  --space-0-25: 0.25rem;
  --primary-surface-inverse: #1e3219;
  --space-1: 1rem;
  --font-serif: 0;
  --primary-surface: #9aff00;
  --secondary-surface: #f66a06;
  --secondary-content-inverse: #f66a06;
  --primary-content-accent: #1e3219;
  --font-italic: 0;
  --secondary-border: #f66a06;
  --secondary-content: #42242e;
  --space-2-25: 2.25rem;
  --secondary-border-inverse: #42242e;
  --secondary-content-accent: #243f42;
  --_tone-page-content: #000000;
  --_tone-page-surface: #ffffff;
  --focus-outline-color: currentColor;
  --header-height: 4rem;
  --ease-in-out-quint: cubic-bezier(0.86, 0, 0.07, 1);
  --arizona: "Symbol Helper", "ABC Arizona Serif", Arial, sans-serif;
  --list-marker-content: #ffffff;
  --block-gap: 2.5rem;
  --_tone-cyan-strong: #243f42;
  --serif: "Symbol Helper", "ABC Arizona Serif", serif;
  --ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --_tone-yellow-strong: #604900;
  --table-highlight-surface: #f5f0ed;
  --mono: "Symbol Helper", "Plex", monospace;
  --content-neutral: #303030;
  --_tone-primary-surface-inverse: #1e3219;
  --focus-outline-style: solid;
  --selection-surface: #e9318d;
  --section-gap: 4rem;
  --_tone-primary-content-inverse: #9aff00;
  --ease-in-quint: cubic-bezier(0.755, 0.05, 0.855, 0.06);
  --focus-outline-offset: 0.25rem;
  --ease-out-cubic: cubic-bezier(0.215, 0.61, 0.355, 1);
  --_tone-orange-subtle: #f5f0ed;
  --underline-offset: 0.15em;
  --_tone-neutral-subtle: #eeeeee;
  --_tone-primary-surface: #9aff00;
}
```

## Components present

- hero with cta

## Notes for the agent

- **Adapt, don't copy.** The type ramp is a *starting point*. Scale it to your project's base size; preserve the *ratio*, not the literal pixels.
- **Color roles are heuristic** (luminance + dominance). Verify against the source URL before committing tokens.
- **Spacing** assumes a constant base step; round detected values to your project's scale (4 / 8 / 16) when implementing.
- **CSS variables** dumped above (when present) are the source's *actual* tokens - those are higher signal than guesses.
- This page's macrostructure is **Type Specimen**.
