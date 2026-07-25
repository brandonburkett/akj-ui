# Backlog

Deferred post-migration follow-ups. Not blocking, tackled as time allows.

## Priority

| Priority  | Item                                                    |
| --------- | ------------------------------------------------------- |
| 🔴 High   | [Broader dead-CSS sweep](#broader-dead-css-sweep)       |
| 🟡 Medium | [Dojo notice banner](#dojo-notice-banner)               |
| 🟡 Medium | [CSS colour variables](#css-colour-variables)           |
| 🟡 Medium | [Images to `astro:assets`](#images-to-astroassets)      |
| 🟢 Low    | [Page-scope `home.css`](#page-scope-homecss)            |
| 🟢 Low    | [DRY the breakpoints](#dry-the-breakpoints)             |
| 🟢 Low    | [Nav to native Popover API](#nav-to-native-popover-api) |
| 🟢 Low    | [`@astrojs/sitemap`](#astrojssitemap)                   |
| 🟢 Low    | [Lightning CSS](#lightning-css)                         |

## Dojo notice banner

- One-line, time-windowed, dismissible notice strip above the nav, e.g. "Experience Iaijutsu at the 2026 Austin-Oita Festival".
- Content and dates come from `src/data/dojo-notice.ts`, the notice appears and expires on its own dates with no redeploy.
- Scrolls away, the nav re-pins. Dismissal persists in `localStorage`, keyed on the notice id.
- Zero CLS in every state, the show/hide decision runs before first paint.
- Plan: [docs/plans/incoming/20260725-dojo-notice.md](plans/incoming/20260725-dojo-notice.md).

## CSS colour variables

- The palette is duplicated as literals across 10 CSS files, and the same colour appears in more than one notation. `rgb(067 091 013)` and `#435b0d` are byte-identical, split across `master.css`, `footer.css`, `nav.css` (twice), `quote.css`, and `dojo-notice.css`. Black and white have the same problem: `#000` ×10 vs `rgb(0 0 0)` ×4, `#fff` ×25 vs `rgb(255 255 255)` ×2, and `rgb(000 000 000 / 90%)` vs `rgb(0 0 0 / 90%)`.
- Worth naming, by frequency: `#fff` 25, `#eae6db` cream 16, `#000` 10, `#d1d1d1` 8, `#435b0d` olive 7, `#394352` slate 6, `#2d3d09` dark olive 6, `#595959` 5, `#fffaf4` 4, `#b00000` red 2, `#aaa88f` sage 2, `rgb(110 024 011)` deep red 1.
- Extend the `:root` block already in `master.css` (it holds `--focus-ring-band`). Custom properties resolve at computed-value time, so bundle order does not matter and every component sheet can use them.
- Purely additive to define, so the risk is all in the migration. Needs a full screenshot pass, which pairs it with the dead-CSS sweep.

## Page-scope `home.css`

- `home.css` sits in `src/styles/` next to the genuinely global sheets, but every selector in it (`.home`, `.big-brand`, `.logo`, `.home-ctas`, `.isshin`) is markup in `index.astro` only.
- Move it to `src/pages/home.css`, matching how `src/pages/home-images/` already scopes page assets. One file move, one import path, one line in `CODE_STYLE.md`.
- Do not split it into components. Those four sections are used once each, unlike `FullScreenParallaxImage` and `BlockImageCta`, so componentizing adds indirection with no reuse.

## DRY the breakpoints

- 37 `@media (min-width: …)` blocks repeat 8 values: 320 ×8, 400 ×2, 480 ×5, 600 ×6, 768 ×4, 1024 ×5, 1200 ×5, 1500 ×2.
- **Custom properties cannot do this.** `@media (min-width: var(--bp-600))` is invalid and silently never matches, because `var()` resolves at computed-value time against an element and media queries are evaluated with no element context.
- The mechanism is `@custom-media` from Media Queries Level 5, which no browser supports natively, so it has to be a build-time transform.
- Lightning CSS supports `@custom-media`, so this largely falls out of that migration. Otherwise add `postcss-custom-media` to the chain already running autoprefixer.
- Either way the definitions must be visible per file at transform time, so it needs Lightning CSS bundling or `postcss-import` wired up.

## Nav to native Popover API

- Replace the JS toggle, outside-click, and Escape handling with `<button popovertarget>` and `popover`.
- Keep the `.site-menu.open` reveal and focus return to the button.

## Images to `astro:assets`

- Adopt `<Image>`, or widen `ResponsiveImage` beyond `{src, alt, class}` for responsive images.

## `@astrojs/sitemap`

- Auto-generate `sitemap.xml` from routes instead of the hand-maintained file.

## Lightning CSS

- v7 makes lightningcss the default minifier, but we pin `cssMinify: 'esbuild'` so autoprefixer's prefixes survive.
- Later, adopt lightningcss as the full transformer with `browserslist` targets, drop PostCSS, and re-verify prefixes.

## Broader dead-CSS sweep

- Grep every `master.css` selector and delete unreferenced rules.
