# Backlog

Deferred post-migration follow-ups. Not blocking, tackled as time allows.

## Priority

| Priority | Item |
|----------|------|
| 🔴 High | [Broader dead-CSS sweep](#broader-dead-css-sweep) |
| 🟡 Medium | [Dojo notice banner](#dojo-notice-banner) |
| 🟡 Medium | [Images to `astro:assets`](#images-to-astroassets) |
| 🟢 Low | [Nav to native Popover API](#nav-to-native-popover-api) |
| 🟢 Low | [`@astrojs/sitemap`](#astrojssitemap) |
| 🟢 Low | [Lightning CSS](#lightning-css) |

## Dojo notice banner

- One-line, time-windowed, dismissible notice strip above the nav, e.g. "Experience Iaijutsu at the 2026 Austin-Oita Festival".
- Content and dates come from `src/data/dojo-notice.ts`, the notice appears and expires on its own dates with no redeploy.
- Scrolls away, the nav re-pins. Dismissal persists in `localStorage`, keyed on the notice id.
- Zero CLS in every state, the show/hide decision runs before first paint.
- Plan: [docs/plans/incoming/20260725-dojo-notice.md](plans/incoming/20260725-dojo-notice.md).

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
