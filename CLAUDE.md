# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

The website of **Both Clocks**, the owner's endurance-fundraising brand. Its first event: a 100-mile ultramarathon in 24 hours (Southern Tour Ultra, Wilmington, NC, Jan 15–16, 2027) raising money for NourishNC, a nonprofit feeding food-insecure kids in New Hanover County.

**Brand rules:** the thesis is *chosen vs. unchosen suffering* — "I get to choose my hard thing and it ends at a finish line; others (like kids facing hunger) never got that choice." The only numbers the brand uses are **100 miles** and **24 hours**. Never reintroduce the old "67 hours without school meals" framing — the owner explicitly removed it. The brand is deliberately broader than this one race: future events may have different challenges and different beneficiary charities, so keep event-specific and charity-specific copy swappable rather than baked into the brand identity.

## Structure

The site is `index.html`, with no build step, no dependencies, and no framework. CSS and JavaScript are inlined. It's designed to be hosted as a static file (Netlify, GitHub Pages, Cloudflare Pages).

`training-data.json` is the single source of truth for the training block: the 25-week plan (`weeks`, `phases`, dates), the completed-session record (`completed`, keyed `"weekIndex-dayIndex"`, zero-based), and public daily actuals (`actuals`, keyed `"YYYY-MM-DD"` with `miles` and an optional `note`). Both `index.html` (the "Live from the build" block on the `#log` view) and the training console read it. **Nightly update flow:** when the owner reports a completed session, add its key to `completed`, add an `actuals` entry for the date, and bump `updated` — nothing else needs to change. Never put private health data (weight, sleep, soreness) in this file; it's public. Those stay in the console's localStorage.

Within `index.html`:

- **Views/routing**: Six sections (`#home`, `#why`, `#charity`, `#race`, `#log`, `#give`) are `<section class="view">` elements. Inline JS at the bottom handles tab-style routing via `data-go` attributes and `history.pushState` — only one view is visible at a time (`.is-on`). There is no server-side routing.
- **Hero animation**: The "hour rule" (24 ticks from Friday noon) and the two comparison clock bars are generated/animated by the inline script when the home view activates.
- **Design tokens**: Colors, fonts, and spacing are CSS custom properties in `:root`. The palette is coastal North Carolina: Atlantic-night navy (`--ink`), Cape Fear channel blue (`--deep`), longleaf pine (`--pine`), dune-sand paper (`--paper`), and two accents with distinct jobs — blaze orange (`--lamp`) for the hero sunrise motif and donate CTAs, and Carolina blue (`--carolina`) as the secondary accent (dark-band kickers, the no-finish-line clock bar, footer links). Keep that division when adding accented elements. Several `rgba()` values in the stylesheet are derived from the token hexes, so changing a token means updating its matching `rgba()` occurrences too. Fonts load from Google Fonts (Bricolage Grotesque, Newsreader, IBM Plex Mono).

## Conventions

- **Placeholder content**: Elements marked `class="edit"` (dashed underline) and `<!-- EDIT -->` comments are draft content awaiting the site owner's real values. Notably, `DONATE_URL` is a placeholder that appears in every donate link and must be replaced with the real NourishNC fundraising page URL before launch. Preserve these markers when editing unless the user is supplying the real content.
- **Training log entries**: New entries are added by copying an `<article class="entry">` block in the `#log` section, newest at the top.
- **Mobile-first care**: The stylesheet has extensive commented `@media` blocks explaining specific mobile fixes (tab-strip edge fades, stacked buttons, label collision fixes). Keep desktop breakpoints untouched when adjusting mobile styles, and match the existing comment style explaining *why* a mobile override exists.
- **Accessibility**: Respect the existing `prefers-reduced-motion` block (animations resolve to their end state) and `:focus-visible` styles when adding interactive elements.

## Training Console (`ultra-console.jsx`)

A React component (originally a claude.ai chat artifact; the website does not import it) that renders the owner's private training cockpit: today's session, interactive checkoffs, a daily log, and planned-vs-actual charts. It contains no plan data of its own — it reads everything from `window.TRAINING_DATA`, which `console.html` populates from `training-data.json` before compiling the component. Interactive checkmarks and log entries save to per-browser localStorage on top of the JSON baselines (`completed`, `actuals`); un-completing a baselined day requires editing the JSON.

`console.html` renders the component with no build step: it loads the React and Babel UMD builds vendored in `vendor/`, fetches `training-data.json` and the `.jsx`, compiles in the browser, and shims the artifact `window.storage` API onto `localStorage`. It must be served over HTTP (`fetch` fails from `file://`).

## Development

There are no build, lint, or test commands — open `index.html` directly in a browser (or serve with any static file server) to preview changes.
