# AKJ Dojo UI

Static marketing site for the Austin Komei Jyuku dojo, built with [Astro](https://astro.build/),
live at [austin.komeijyuku.com](https://austin.komeijyuku.com/). A zero-runtime static MPA. Pages
ship as plain HTML and CSS with no client framework. The three interactive pieces (nav dropdown,
parallax hero, image gallery) are dependency-free vanilla TypeScript scripts.

## Prerequisites

- Node **24.18.0**, pinned in `.nvmrc`. With nvm, run `nvm use`.
- `npm install`
- Playwright's Chromium installs automatically before e2e via the `pretest:e2e` hook, or run
  `npx playwright install chromium` yourself.

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the Astro dev server. |
| `npm run build` | Static production build to `dist/`. |
| `npm run preview` | Serve the built `dist/` locally. |
| `npm run check` | Type-check with `astro check`. |
| `npm run test:unit` | Unit tests (Vitest). |
| `npm run test:e2e` | E2E and a11y tests (Playwright). |
| `npm test` | Runs `test:unit` then `test:e2e`. |
| `npm run coverage` | Unit tests with V8 coverage. |
| `npm run lint:style` | Lint and fix CSS with stylelint. |
| `npm run prettier:write` | Format `src`, `prettier:check` to verify. |

## Architecture

- **Static MPA.** `output: 'static'`, one route per file in `src/pages/`.
- **Extensionless URLs.** `build.format: 'file'` emits `iaijutsu.html`, not
  `iaijutsu/index.html`, so S3 and CloudFront serve extensionless paths.
- **Layout and SEO.** `StandardLayout.astro` wraps every page and renders `SeoHead.astro`.
- **Scripts.** Uses vanilla TypeScript modules (not React, Vue, or other libs).
- **Imports.** `@/*` aliases `src/*` for cross-folder imports.
- **Styles and assets.** Global styles in `src/styles/`, per-component CSS beside each `.astro`.
  Autoprefixer (PostCSS) adds vendor prefixes at build from `browserslist`. Files in `public/`
  copy verbatim into `dist/`.

## Testing

- **Unit.** Vitest (jsdom) over the script logic and SEO helpers. `npm run coverage` for V8
  coverage.
- **E2E and a11y.** Playwright drives the site in real headless Chromium and runs
  `@axe-core/playwright` checks. The `pretest:e2e` hook installs Chromium on first run, so a fresh
  clone needs no manual setup.

## Deploy

CI/CD via [CircleCI](https://circleci.com/) (`.circleci/config.yml`, image
`cimg/node:24.18.0-browsers`, AWS CLI v2). On push to `master`:

- `npm ci`, `npm run check`, install Chromium, `npm test`, `npm run build`.
- `.circleci/production.sh` syncs `dist/` to S3. HTML uploads to extensionless keys
  (`iaijutsu.html` becomes `/iaijutsu`, `index.html` stays at `/`).
- Tiered `Cache-Control`, `_astro/*` immutable for 1 year, other assets 30 days, HTML short
  browser `max-age` with long CloudFront `s-maxage`.
- CloudFront invalidation on every deploy.

## Follow-ups / TODO

Post-migration candidates deliberately deferred:

- **Nav to native Popover API.** Replace the JS toggle, outside-click, and Escape handling with
  `<button popovertarget>` and `popover`. Keep the `.site-menu.open` reveal and focus return to
  the button.
- **Images to `astro:assets`.** Adopt `<Image>` or widen `ResponsiveImage` beyond
  `{src, alt, class}` for responsive images.
- **`@astrojs/sitemap`.** Auto-generate `sitemap.xml` from routes instead of the hand-maintained
  file.
- **Lightning CSS.** v7 makes lightningcss the default minifier, but we pin `cssMinify: 'esbuild'`
  so autoprefixer's prefixes survive. Later, adopt lightningcss as the full transformer with
  `browserslist` targets, drop PostCSS, and re-verify prefixes.
- **SEO audit.** Run Lighthouse and Google Rich Results on the live site, validate the home
  JSON-LD, consider per-page OG images.
- **Broader dead-CSS sweep.** Grep every `master.css` selector and delete unreferenced rules.
- **Service worker.** The manifest already gives installability. Add `@vite-pwa/astro` only if
  offline caching is wanted.
