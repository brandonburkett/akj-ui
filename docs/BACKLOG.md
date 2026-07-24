# Backlog

Deferred post-migration follow-ups. Not blocking, tackled as time allows.

## Priority

| Priority | Item |
|----------|------|
| 🔴 High | [Gallery skips two slides on first advance](#gallery-skips-two-slides-on-first-advance) |
| 🔴 High | [Visible keyboard focus outline](#visible-keyboard-focus-outline) |
| 🔴 High | [Broader dead-CSS sweep](#broader-dead-css-sweep) |
| 🟡 Medium | [Images to `astro:assets`](#images-to-astroassets) |
| 🟢 Low | [Nav to native Popover API](#nav-to-native-popover-api) |
| 🟢 Low | [`@astrojs/sitemap`](#astrojssitemap) |
| 🟢 Low | [Lightning CSS](#lightning-css) |

## Gallery skips two slides on first advance

- Bug: the first chevron click or mobile swipe sometimes jumps forward two images instead of one.
- `active` in `gallery.ts` is written from two places, `setActive` inside `goTo` and the IntersectionObserver callback, so a click landing while the observer is still settling advances from an index that already moved.
- The observer also takes the last intersecting entry in the batch rather than the most-centered one, so mid-scroll a neighbor can win.
- Fix ideas: derive the active slide from scroll position on `scrollend` instead of intersection, or ignore observer updates while a programmatic scroll is in flight.
- Add a regression test, current `gallery.test.ts` only covers the pure index helpers.

## Visible keyboard focus outline

- Bug: tabbing through the site gives no consistent focus indicator, so you cannot tell what is focused.
- `master.css` only styles `a:focus` with `outline: thin dotted` and then clears it on `:hover`/`:active`, buttons get nothing. `SlideGallery` is the one component with real `:focus-visible` rings.
- Add a global `:focus-visible` ring covering links, buttons, and the focusable gallery track, in a token that reads on both the light and dark sections.
- Drop the legacy `a:focus` / `outline: 0` rules once the global ring lands.
- Accessibility is a hard requirement, so pair this with an e2e check that tab order is visibly tracked.

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
