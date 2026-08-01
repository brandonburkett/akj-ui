# Backlog

Deferred post-migration follow-ups. Not blocking, tackled as time allows.

## Priority

| Priority  | Item                                                    |
| --------- | ------------------------------------------------------- |
| 🟡 Medium | [Images to `astro:assets`](#images-to-astroassets)      |
| 🟡 Medium | [Font loading](#font-loading)                           |
| 🟢 Low    | [DRY the breakpoints](#dry-the-breakpoints)             |
| 🟢 Low    | [Nav to native Popover API](#nav-to-native-popover-api) |
| 🟢 Low    | [`@astrojs/sitemap`](#astrojssitemap)                   |
| 🟢 Low    | [Lightning CSS](#lightning-css)                         |

## Font loading

- No `@font-face` sets `font-display`, so all 8 fall back to `auto`, which browsers treat as `block`. Text stays invisible for up to 3s on a slow connection. `swap` fixes it.
- There are no woff2 files. woff2 is roughly 30% smaller than woff and every browserslist target supports it. Generating them and listing woff2 first in each `src` is the biggest single font win.
- 5 of the 8 families (`ambleregular`, `amblelight`, `ambleitalic`, `amblebold_italic`, `amblelight_italic`) are declared but nothing uses them. Kept on purpose so they are there when wanted. Browsers never fetch an unmatched face, so this costs deploy size only, not page speed.

## DRY the breakpoints

- 42 `@media (min-width: …)` blocks repeat 8 values: 320 ×9, 400 ×2, 480 ×5, 600 ×7, 768 ×5, 1024 ×6, 1200 ×6, 1500 ×2.
- The 8 values are also the only breakpoints, so a `--bp-*` set would cover every query with no exceptions.
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
