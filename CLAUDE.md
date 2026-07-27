# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A single-page fundraising website: "Both Clocks Start Friday at Noon" — a 100-mile ultramarathon run (Southern Tour Ultra, Wilmington, NC, Jan 15–16, 2027) raising money for NourishNC, a nonprofit feeding food-insecure kids in New Hanover County.

## Structure

The entire site is one file, `index.html`, with no build step, no dependencies, and no framework. CSS and JavaScript are inlined. It's designed to be hosted as a static file (Netlify, GitHub Pages, Cloudflare Pages).

Within `index.html`:

- **Views/routing**: Six sections (`#home`, `#why`, `#charity`, `#race`, `#log`, `#give`) are `<section class="view">` elements. Inline JS at the bottom handles tab-style routing via `data-go` attributes and `history.pushState` — only one view is visible at a time (`.is-on`). There is no server-side routing.
- **Hero animation**: The "hour rule" (24 ticks from Friday noon) and the two comparison clock bars are generated/animated by the inline script when the home view activates.
- **Design tokens**: Colors, fonts, and spacing are CSS custom properties in `:root`. The palette is coastal North Carolina: Atlantic-night navy (`--ink`), Cape Fear channel blue (`--deep`), longleaf pine (`--pine`), dune-sand paper (`--paper`), and two accents with distinct jobs — sea-oats gold (`--lamp`) for the hero sunrise motif and donate CTAs, and Carolina blue (`--carolina`) as the secondary accent (dark-band kickers, the 67-hour clock bar, footer links). Keep that division when adding accented elements. Several `rgba()` values in the stylesheet are derived from the token hexes, so changing a token means updating its matching `rgba()` occurrences too. Fonts load from Google Fonts (Bricolage Grotesque, Newsreader, IBM Plex Mono).

## Conventions

- **Placeholder content**: Elements marked `class="edit"` (dashed underline) and `<!-- EDIT -->` comments are draft content awaiting the site owner's real values. Notably, `DONATE_URL` is a placeholder that appears in every donate link and must be replaced with the real NourishNC fundraising page URL before launch. Preserve these markers when editing unless the user is supplying the real content.
- **Training log entries**: New entries are added by copying an `<article class="entry">` block in the `#log` section, newest at the top.
- **Mobile-first care**: The stylesheet has extensive commented `@media` blocks explaining specific mobile fixes (tab-strip edge fades, stacked buttons, label collision fixes). Keep desktop breakpoints untouched when adjusting mobile styles, and match the existing comment style explaining *why* a mobile override exists.
- **Accessibility**: Respect the existing `prefers-reduced-motion` block (animations resolve to their end state) and `:focus-visible` styles when adding interactive elements.

## Development

There are no build, lint, or test commands — open `index.html` directly in a browser (or serve with any static file server) to preview changes.
