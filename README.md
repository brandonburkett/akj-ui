# AKJ Dojo UI

Static marketing site for the Austin Komei Jyuku dojo, built with [Astro](https://astro.build/).
A zero-runtime static MPA: pages ship as plain HTML/CSS with no client framework. The three
interactive pieces (nav dropdown, parallax hero, image gallery) are dependency-free
vanilla-TypeScript scripts.

## Prerequisites

- Node **24.18.0** (pinned in `.nvmrc`). With nvm:
  ```
  nvm use
  ```
- `npm install`

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the Astro dev server (`npm start` is an alias). |
| `npm run build` | Static production build to `dist/` (extensionless `*.html`). |
| `npm run preview` | Serve the built `dist/` locally. |
| `npm run check` | Type-check with `astro check`. |
| `npm run test:unit` | Unit tests (Vitest). |
| `npm run test:e2e` | End-to-end + a11y tests (Playwright). |
| `npm test` | Runs `test:unit` then `test:e2e`. |
| `npm run coverage` | Unit tests with V8 coverage. |
| `npm run lint:style` | Lint/fix CSS with stylelint. |
| `npm run prettier:write` | Format `src` (`.ts`, `.astro`, `.css`); `prettier:check` to verify. |

## Architecture

- **Static MPA.** `output: 'static'`, one route per file under `src/pages/` (`index`,
  `iaijutsu`, `schedule`, `seminars`, `tokai`, `404`).
- **Extensionless URLs.** `build.format: 'file'` emits `iaijutsu.html` (not `iaijutsu/index.html`)
  so S3/CloudFront serve extensionless paths (see Deploy).
- **Layout + SEO.** `src/layouts/StandardLayout.astro` wraps every page and renders
  `src/components/SeoHead/SeoHead.astro` (canonical, Open Graph, Twitter, icons); SEO URL/image
  helpers live in `src/components/SeoHead/seo.ts`.
- **Islands.** Three vanilla-TS modules colocated with their components —
  `src/components/Nav/nav.ts` (accessible dropdown),
  `src/components/FullScreenParallaxImage/parallax.ts` (hero parallax),
  `src/components/SlideGallery/gallery.ts` (image gallery). No framework runtime is shipped.
- **Imports.** `@/*` aliases `src/*` (configured in `tsconfig.json`) for cross-folder imports;
  same-folder imports stay relative (`./`).
- **Styles/assets.** Global styles in `src/styles/`, per-component CSS alongside the `.astro`
  components. Autoprefixer (PostCSS, `postcss.config.cjs`) adds vendor prefixes at build from the
  `browserslist`. Static files in `public/` (favicon, manifest, PWA icons, `robots.txt`,
  `sitemap.xml`) are copied verbatim into `dist/`.

## Testing

- **Unit** — Vitest (jsdom) over the island logic and SEO helpers; `npm run coverage` for V8
  coverage.
- **E2E / a11y** — Playwright drives the built site and runs `@axe-core/playwright` accessibility
  checks against the pages.

## Deploy

CI/CD via [CircleCI](https://circleci.com/) (`.circleci/config.yml`, image
`cimg/node:24.18.0-browsers`, AWS CLI v2). On push to `master`:

- `npm ci` → `npm run check` → `npx playwright install --with-deps chromium` → `npm test` → `npm run build`
- `.circleci/production.sh` syncs `dist/` to S3; `*.html` upload to extensionless keys
  (`iaijutsu.html` → `/iaijutsu`; `index.html` stays at `/`)
- Tiered `Cache-Control`: `_astro/*` immutable (1yr); other assets 30d; HTML short browser
  `max-age` + long CloudFront `s-maxage`
- CloudFront invalidation on every deploy (flushes the long edge TTL)

## Follow-ups / TODO

Post-migration candidates deliberately deferred:

- **Nav → native Popover API** — replace the JS toggle / outside-click / Escape island with
  `<button popovertarget>` + `popover`; must preserve the `.site-menu.open` reveal and
  focus-return-to-button on close.
- **Images → `astro:assets`** — adopt `<Image>` (or widen `ResponsiveImage` beyond
  `{src, alt, class}`) for responsive/optimized images.
- **`@astrojs/sitemap`** — auto-generate `sitemap.xml` from routes instead of the hand-maintained
  file.
- **Lightning CSS** — evaluate replacing PostCSS/autoprefixer with Lightning CSS (faster; also
  minifies).
- **SEO audit** — run Lighthouse + Google Rich Results on the deployed site; validate the home
  JSON-LD; consider per-page OG images and structured data beyond the home page.
- **Broader dead-CSS sweep** — grep-audit every `master.css` selector and delete unreferenced
  rules (bigger/riskier than the naming-rule cleanup already done).
- **Service worker (offline)** — the manifest already provides installability (desktop install +
  mobile add-to-home); add `@vite-pwa/astro` only if offline caching is later wanted.
- **Verify deploy on first master push** — the CircleCI `config.yml` + `production.sh`
  cache-header changes were untested in the migration env (no AWS creds); confirm on the first
  real `master` deploy that the tiered `Cache-Control` headers apply and that CloudFront honors
  origin `Cache-Control`.
