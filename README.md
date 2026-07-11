# AKJ Dojo UI

Static marketing site for the Austin Komei Jyuku dojo, built with [Astro](https://astro.build/).
Migrated from Create React App to a zero-runtime static MPA: pages ship as plain HTML/CSS with
no client framework. The three pieces of interactivity (nav dropdown, parallax hero, image
gallery) are dependency-free vanilla-TypeScript islands. The original CSS and breakpoints were
ported as-is.

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
  `src/components/SeoHead.astro` (canonical, Open Graph, Twitter, icons); SEO URL/image helpers
  live in `src/lib/seo.ts`.
- **Islands.** Three vanilla-TS modules in `src/scripts/` — `nav.ts` (accessible dropdown),
  `parallax.ts` (hero parallax), `gallery.ts` (image gallery). No framework runtime is shipped.
- **Styles/assets.** CSS ported from the original app; global styles in `src/styles/`,
  per-component CSS alongside the `.astro` components. Static files in `public/` (favicon,
  manifest, PWA icons, `robots.txt`, `sitemap.xml`) are copied verbatim into `dist/`.

## Testing

- **Unit** — Vitest (jsdom) over the island logic and SEO helpers; `npm run coverage` for V8
  coverage.
- **E2E / a11y** — Playwright drives the built site and runs `@axe-core/playwright` accessibility
  checks against the pages.

## Deploy

CI/CD via [CircleCI](https://circleci.com/) (`.circleci/config.yml`, image
`cimg/node:24.18.0-browsers`). On push to `master`: install → `npm run check` →
`npx playwright install --with-deps chromium` → `npm test` → `npm run build` → deploy.

`.circleci/production.sh` uploads `dist/` to S3: a `s3 sync` for all non-HTML assets, then each
`*.html` uploaded to an extensionless key (`iaijutsu.html` → `/iaijutsu`) with `text/html`,
except `index.html` which stays at `/` for the root. Finally it issues a CloudFront invalidation.
