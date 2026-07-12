# Backlog

Deferred post-migration follow-ups. Not blocking, tackled as time allows.

## Priority

| Priority | Item |
|----------|------|
| 🔴 High | [Broader dead-CSS sweep](#broader-dead-css-sweep) |
| 🟡 Medium | [Images to `astro:assets`](#images-to-astroassets) |
| 🟢 Low | [Nav to native Popover API](#nav-to-native-popover-api) |
| 🟢 Low | [`@astrojs/sitemap`](#astrojssitemap) |
| 🟢 Low | [Lightning CSS](#lightning-css) |

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
