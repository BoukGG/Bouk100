# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

The website of **Both Clocks**, the owner's endurance brand. The model: the owner takes on hard endurance events by choice; each event sponsors one charity serving people in unchosen suffering (cancer, hunger, abuse, neglect, disease, loss — keep this broad, never one cause); donations go directly to the sponsored charity, and merch profits are donated too (owner keeps break-even only, and is explicit about not profiting). First event: a 100-mile ultramarathon in 24 hours (Southern Tour Ultra, Wilmington, NC, Jan 15–16, 2027). **No charity has been chosen yet** — the site deliberately says "announced before race day." When the owner picks one, the Causes page callout, the shop "where profits go" copy, and donate CTAs are where it lands.

**Brand rules:** the thesis is *chosen vs. unchosen suffering* — "I get to choose my hard thing and it ends at a finish line; others never got that choice." The only numbers the brand uses are **100 miles** and **24 hours**. Never reintroduce the old "67 hours without school meals" framing — the owner explicitly removed it. The brand is deliberately broader than any one race or cause: keep event-specific and charity-specific copy swappable, never baked into the brand identity.

## Structure

The site is `index.html`, with no build step, no dependencies, and no framework. CSS and JavaScript are inlined. It's designed to be hosted as a static file (Netlify, GitHub Pages, Cloudflare Pages).

`training-data.json` is the single source of truth for the training block: the 25-week plan (`weeks`, `phases`, dates), the completed-session record (`completed`, keyed `"weekIndex-dayIndex"`, zero-based), and public daily actuals (`actuals`, keyed `"YYYY-MM-DD"` with `miles` and an optional `note`). `index.html` reads it for the "Live from the build" block on the `#log` section. **Nightly update flow:** when the owner reports a completed session, add its key to `completed`, add an `actuals` entry for the date, and bump `updated` — nothing else needs to change. Never put private health data (weight, sleep, soreness) in this file; it's public.

Within `index.html`:

- **One-page scroll**: Six sections (`#home`, `#why`, `#causes`, `#race`, `#log`, `#shop`) form one continuous scroll — no view switching. `[data-go]` elements smooth-scroll; a fixed slim nav scrollspies sections (underline-style active tab), hides on scroll-down and returns on scroll-up, and switches from dark (over the hero) to a bone `lite` style in the gallery. The Shop is the nav CTA pill, not a tab.
- **Intro gate**: every page load opens on a full-screen carbon overlay (`.gate`) where the mark assembles — ring draws, tape drops, inner ring breathes in, wordmark fades — then FLIP-flies into the nav mark slot (~2.4s total). Instantly skippable via scroll/click/key; `prefers-reduced-motion` skips it entirely. `body.gating` hides hero content until handoff.
- **Interactive hero**: the large hero mark is two stacked SVGs — the chosen ring (`.hm-chosen`) tilts toward the pointer (hover/fine-pointer devices only); the unchosen inner ring never reacts and breathes forever. Design rule: nothing in the design may reference any duration or distance figure — the brand is event-agnostic; only the generic two-clocks metaphor (one ring completes, one never stops) is allowed.
- **Scroll dial**: a small fixed mark (`.dial`, bottom-right, `mix-blend-mode:difference` so it reads on both grounds) whose outer ring fills with scroll progress; the tape appears near the page end.
- **Gallery layout**: after the hero, one `.dawn` grayscale gradient transitions to quiet bone for everything until the carbon footer. Chapters are narrow centered columns (`.chapter`, ~640px) with vast vertical padding, centered mono kickers, hairline `.items` lists, and small mark separators (`.sep`). The Why statement (`.statement`) and the two `.callout`s are the only large typographic moments — keep the restraint.
- **Scroll reveals**: `.rv` elements fade/rise in via IntersectionObserver (`.is-in`). New content blocks should get `class="rv"` to match. Reduced-motion renders everything in place.
- **Clock bars**: the two clock bars light when scrolled into view; the unchosen bar fades off the track edge (no finish line).
- **Design tokens**: Colors, fonts, and spacing are CSS custom properties in `:root`. The system is **fully monochrome by owner decree**: carbon darks (`--ink`, `--deep`, `--pine` — the last is legacy-named, now a slate gray) and bone lights (`--paper`, `--paper-2`). There is NO color anywhere and none may be introduced — no accents, ever (the `.btn-lamp` class name is legacy; it's a monochrome solid button). The two clock bars are distinguished by weight/opacity, not hue. Several `rgba()` values in the stylesheet are derived from the token hexes, so changing a token means updating its matching `rgba()` occurrences too. Fonts load from Google Fonts: Space Grotesk (display/headings), Inter (body), JetBrains Mono (labels).
- **The mark**: the Both Clocks logo ("the Finish Tape") is a heavy broken ring stopped by a floating tape at noon, wrapped around a lighter unbroken ring — chosen vs. unchosen, told by weight alone. It appears as inline SVG in the nav brand and the footer (drawn with `currentColor`, always monochrome) and as `favicon.svg`. Never rotate it, color it, close the gap, or break the inner ring. A full site-design overhaul incorporating the mark is planned.

## Conventions

- **Placeholder content**: Elements marked `class="edit"` (dashed underline) and `<!-- EDIT -->` comments are draft content awaiting the site owner's real values — currently the shop's two product cards, the sponsored-cause announcement on the Causes page, and the contact/Instagram/LinkedIn links in the footer. The Why page is finished copy in the owner's voice (written from an interview) — don't rewrite it without being asked. Preserve these markers when editing unless the user is supplying the real content. There are intentionally no donate links yet; they return when a sponsored charity is announced (and must point at the charity's own page, never a personal account).
- **Training log entries**: New entries are added by copying an `<article class="entry">` block in the `#log` section, newest at the top.
- **Mobile-first care**: The stylesheet has extensive commented `@media` blocks explaining specific mobile fixes (tab-strip edge fades, stacked buttons, label collision fixes). Keep desktop breakpoints untouched when adjusting mobile styles, and match the existing comment style explaining *why* a mobile override exists.
- **Accessibility**: Respect the existing `prefers-reduced-motion` block (animations resolve to their end state) and `:focus-visible` styles when adding interactive elements.

## Development

There are no build, lint, or test commands — open `index.html` directly in a browser (or serve with any static file server) to preview changes.
