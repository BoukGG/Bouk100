# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

The website of **Both Clocks**, the owner's endurance brand. The model: the owner takes on hard endurance events by choice; each event sponsors one charity serving people in unchosen suffering (cancer, hunger, abuse, neglect, disease, loss — keep this broad, never one cause); donations go directly to the sponsored charity, and merch profits are donated too (owner keeps break-even only, and is explicit about not profiting). First event: a 100-mile ultramarathon in 24 hours (Southern Tour Ultra, Wilmington, NC, Jan 15–16, 2027). **No charity has been chosen yet** — the site deliberately says "announced before race day." When the owner picks one, the Causes page callout, the shop "where profits go" copy, and donate CTAs are where it lands.

**Brand rules:** the thesis is *chosen vs. unchosen suffering* — "I get to choose my hard thing and it ends at a finish line; others never got that choice." The only numbers the brand uses are **100 miles** and **24 hours**. Never reintroduce the old "67 hours without school meals" framing — the owner explicitly removed it. The brand is deliberately broader than any one race or cause: keep event-specific and charity-specific copy swappable, never baked into the brand identity.

## Structure

The site is `index.html`, with no build step, no dependencies, and no framework. CSS and JavaScript are inlined. It's designed to be hosted as a static file (Netlify, GitHub Pages, Cloudflare Pages).

`training-data.json` is the single source of truth for the training block: the 25-week plan (`weeks`, `phases`, dates), the completed-session record (`completed`, keyed `"weekIndex-dayIndex"`, zero-based), and public daily actuals (`actuals`, keyed `"YYYY-MM-DD"` with `miles` and an optional `note`). Both `index.html` (the "Live from the build" block on the `#log` view) and the training console read it. **Nightly update flow:** when the owner reports a completed session, add its key to `completed`, add an `actuals` entry for the date, and bump `updated` — nothing else needs to change. Never put private health data (weight, sleep, soreness) in this file; it's public. Those stay in the console's localStorage.

Within `index.html`:

- **One-page scroll**: Six sections (`#home`, `#why`, `#causes`, `#race`, `#log`, `#shop`) form one continuous scroll narrative — there is no view switching. `[data-go]` elements smooth-scroll to their section; a fixed nav scrollspies the sections (IntersectionObserver) and highlights the active tab; a 2px orange scroll-progress line runs along the top. The Shop is reached via the nav CTA button, not a tab.
- **Night-to-dawn arc**: the page background deliberately runs dark → light down the page (ink hero/clocks/why → pine causes band → `.dawn` gradient divider with sunrise glow → dune-sand paper for race/log/shop → ink footer), mirroring the race's night. Preserve this order when adding sections.
- **Scroll reveals**: `.rv` elements fade/rise in via IntersectionObserver (`.is-in`). New content blocks should get `class="rv"` to match. Reduced-motion renders everything in place.
- **Hero animation**: The "hour rule" (24 ticks from Friday noon) animates on load; the two clock bars light when scrolled into view.
- **Design tokens**: Colors, fonts, and spacing are CSS custom properties in `:root`. The palette is coastal North Carolina: Atlantic-night navy (`--ink`), Cape Fear channel blue (`--deep`), longleaf pine (`--pine`), dune-sand paper (`--paper`), and two accents with distinct jobs — blaze orange (`--lamp`) for the hero sunrise motif and donate CTAs, and Carolina blue (`--carolina`) as the secondary accent (dark-band kickers, the no-finish-line clock bar, footer links). Keep that division when adding accented elements. Several `rgba()` values in the stylesheet are derived from the token hexes, so changing a token means updating its matching `rgba()` occurrences too. Fonts load from Google Fonts (Bricolage Grotesque, Newsreader, IBM Plex Mono).

## Conventions

- **Placeholder content**: Elements marked `class="edit"` (dashed underline) and `<!-- EDIT -->` comments are draft content awaiting the site owner's real values — currently the shop's two product cards, the sponsored-cause announcement on the Causes page, the personal paragraph on the Why page, and the contact/social links in the footer. Preserve these markers when editing unless the user is supplying the real content. There are intentionally no donate links yet; they return when a sponsored charity is announced (and must point at the charity's own page, never a personal account).
- **Training log entries**: New entries are added by copying an `<article class="entry">` block in the `#log` section, newest at the top.
- **Mobile-first care**: The stylesheet has extensive commented `@media` blocks explaining specific mobile fixes (tab-strip edge fades, stacked buttons, label collision fixes). Keep desktop breakpoints untouched when adjusting mobile styles, and match the existing comment style explaining *why* a mobile override exists.
- **Accessibility**: Respect the existing `prefers-reduced-motion` block (animations resolve to their end state) and `:focus-visible` styles when adding interactive elements.

## Training Console (`ultra-console.jsx`)

A React component (originally a claude.ai chat artifact; the website does not import it) that renders the owner's private training cockpit: today's session, interactive checkoffs, a daily log, and planned-vs-actual charts. It contains no plan data of its own — it reads everything from `window.TRAINING_DATA`, which `console.html` populates from `training-data.json` before compiling the component. Interactive checkmarks and log entries save to per-browser localStorage on top of the JSON baselines (`completed`, `actuals`); un-completing a baselined day requires editing the JSON.

`console.html` renders the component with no build step: it loads the React and Babel UMD builds vendored in `vendor/`, fetches `training-data.json` and the `.jsx`, compiles in the browser, and shims the artifact `window.storage` API onto `localStorage`. It must be served over HTTP (`fetch` fails from `file://`).

## Development

There are no build, lint, or test commands — open `index.html` directly in a browser (or serve with any static file server) to preview changes.
