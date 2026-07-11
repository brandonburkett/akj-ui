# Astro Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Austin Komei Jyuku dojo site from Create React App (React 16 + react-router-dom v5 + react-helmet + react-snap prerender) to Astro (TypeScript), producing the same statically-generated, extensionless-URL site with the CSS/breakpoints ported as-is and zero framework runtime shipped to the browser.

**Architecture:** Astro static MPA (`output: 'static'`, `build.format: 'file'`). Every page is a `.astro` file under `src/pages/` that renders through a single `StandardLayout.astro` (which owns `<head>` SEO + the nav). All presentational React components become static `.astro` components. The three interactive pieces — nav dropdown, parallax hero, and the image gallery — become small, dependency-free TypeScript `<script>` islands (Astro bundles/hashes them). The whole existing CSS (master + responsive + per-component) is imported as global stylesheets so the cascade and breakpoints are byte-for-byte the same. **No UI framework integration is added — the project ends with zero React dependencies.**

**Tech Stack:** Astro 6.x, TypeScript (strict), vanilla DOM APIs (CSS scroll-snap + Fullscreen API + IntersectionObserver), Playwright + @axe-core/playwright for e2e/a11y tests, Prettier (+ prettier-plugin-astro), Stylelint. CI stays on CircleCI → S3 + CloudFront.

## Execution Environment

This migration runs in an **isolated git worktree** at `.claude/worktrees/astro-migration` (branch `worktree-astro-migration`), created with the native worktree tool. The main checkout at `/Users/brandonburkett/git/akj-ui` stays on `master` as an **untouched reference to the current site** — read the original `.tsx`/CSS there while porting. The CRA source is deleted only in Task 11 (after everything is built + verified), so the originals stay available the whole way through; git history is the final backstop. `.claude/worktrees/` and `.claude/settings.local.json` are gitignored (committed on `master`, `7a98fe6`) while `.claude/settings.json` stays tracked.

## Global Constraints

- **Output must be static & extensionless.** `output: 'static'`, `build.format: 'file'`, `trailingSlash: 'never'`. Build emits `dist/index.html`, `dist/iaijutsu.html`, `dist/schedule.html`, `dist/seminars.html`, `dist/404.html`. The deploy uploads these as extensionless S3 keys (`/iaijutsu`), preserving today's URLs exactly. **Do not introduce trailing-slash or `/page/` directory URLs.**
- **Canonical base URL:** `https://austin.komeijyuku.com/` (production). Local dev base is irrelevant to output; canonical/OG URLs derive from the `site` config value.
- **Port CSS as-is.** Reuse the existing `.css` files unchanged wherever possible (only the gallery's internal slide styles are rewritten, since `react-image-gallery`'s stylesheet is being dropped). Keep all 8 breakpoints: 320, 400, 480, 600, 768, 1024, 1200, 1500 px.
- **Zero framework runtime.** No `@astrojs/react`, no React/ReactDOM/react-router/react-helmet/react-image-gallery in the final `package.json`.
- **Full accessibility with keyboard support** is a hard requirement for the nav and the gallery (user directive). Every interactive control is a real `<button>`/`<a>`, keyboard operable, with correct ARIA state; each page must pass an axe-core scan with zero serious/critical violations.
- **Node:** Node 24.18.0 (Active LTS "Krypton"). `.nvmrc` is pinned to `24.18.0` and the CircleCI image to `cimg/node:24.18.0-browsers`. Local dev: `nvm install 24.18.0 && nvm use`.
- **Routes:** `/` (Home), `/iaijutsu`, `/schedule`, `/seminars`, `404`, plus a redirect `/tokai` → `/seminars`.
- **Preserve SEO artifacts:** per-page `<title>`/description/canonical/OG/Twitter tags, the home page JSON-LD (`SportsActivityLocation`), `robots.txt`, `sitemap.xml`, `manifest.json`, favicon, and the PWA icons.

---

## File Structure

New Astro tree (created alongside, then CRA files deleted in Task 11):

```
astro.config.mjs                 # static + build.format 'file' + site
tsconfig.json                    # extends astro/tsconfigs/strict (replaces CRA tsconfig)
playwright.config.ts             # e2e/a11y runner (astro dev on :4321)
.nvmrc                           # 24.18.0
.husky/pre-commit                # git pre-commit hook (lint-staged) — re-added in Task 12
CLAUDE.md                        # Claude Code project guide (Task 12)
.claude/settings.json            # shared Claude settings — TRACKED (worktrees + settings.local.json are gitignored)
src/
  consts.ts                      # SITE_URL, SITE_NAME, nav items, social links
  env.d.ts                       # astro client types (replaces react-app-env.d.ts)
  layouts/
    StandardLayout.astro         # <html><head>(SeoHead)</head><body> Nav + <slot/>
  components/
    SeoHead.astro                # replaces react-helmet Head (meta/OG/twitter/canonical)
    Nav.astro                    # masthead + dropdown, inline TS island
    Footer.astro
    Quote.astro
    PanelSection.astro
    PanelContent.astro
    BelowFold.astro
    ResponsiveImage.astro
    ResponsiveMap.astro
    BlockImageCta.astro
    FullScreenParallaxImage.astro  # hero, inline TS parallax/scroll island
    SlideGallery.astro             # accessible scroll-snap carousel, inline TS island
  pages/
    index.astro                  # Home
    iaijutsu.astro
    schedule.astro
    seminars.astro
    404.astro
    tokai.astro                  # meta-refresh + canonical redirect to /seminars
  styles/                        # MOVED from src/styles, unchanged
    master.css                   # (+ fonts/ and images/ subfolders, url() intact)
    responsive.css
    fonts/…                      # unchanged
    images/…                     # unchanged (lilly.jpg referenced by master.css url())
  components/**/<name>.css        # per-component CSS MOVED unchanged (except slide-gallery.css rewritten)
  components/**/images/…          # per-component images MOVED unchanged
  containers/**/images/…          # page images MOVED unchanged
  data/
    local-business-schema.json   # MOVED from containers/home
public/                          # unchanged: favicon.ico, manifest.json, pwa-*.webp
  robots.txt                     # MOVED from src/robots.txt
  sitemap.xml                    # MOVED from src/sitemap.xml
tests/
  a11y.spec.ts                   # axe scan every route
  nav.spec.ts                    # dropdown keyboard/outside-click/aria
  gallery.spec.ts                # carousel keyboard/bullets/fullscreen
  routing.spec.ts               # routes + /tokai redirect + head tags
```

Deleted in Task 11: `src/index.tsx`, `src/app.tsx`, `src/app.test.tsx`, `src/logo.svg`, `src/registerServiceWorker.ts`, `src/react-app-env.d.ts`, `src/containers/**/*.tsx`, `src/containers/layouts/`, all `.tsx` component files, `tslint.json`, CRA `.env`/`.env.production` (superseded by `site` config), `public/index.html`.

**Component responsibility notes:**
- `StandardLayout.astro` owns the document shell so pages contain only body content — mirrors the old `StandardLayoutRoute` + `standard-layout` + `public/index.html` combined. Scroll-to-top-on-nav is free (full page loads).
- `SeoHead.astro` is pure markup (no client JS) — takes `title`, `desc`, `path`, optional `image`/`noIndex`; computes canonical from `SITE_URL`.
- The three island components each colocate their `<script>` with their markup so behavior + DOM live together.

---

## Task 1: Scaffold Astro + tooling

**Files:**
- Create: `astro.config.mjs`, `tsconfig.json` (replace), `src/env.d.ts`, `src/consts.ts`, `package.json` (rewrite deps/scripts)
- Delete later (not now): CRA files

**Interfaces:**
- Produces: `SITE_URL`, `SITE_NAME`, `NAV_ITEMS`, `SOCIAL_LINKS` from `src/consts.ts`; a working `npm run dev`/`npm run build`/`npm run check`.

- [ ] **Step 1: Branch + Node** — the isolated worktree/branch (`worktree-astro-migration`) already exists (see Execution Environment), so pin Node and switch to it.

Create `.nvmrc`:
```
24.18.0
```
Then locally:
```bash
nvm install 24.18.0 && nvm use   # Active LTS
node -v                          # expect v24.18.0
```

- [ ] **Step 2: Rewrite `package.json`** (remove CRA/React, add Astro + test tooling)

```json
{
  "name": "akj-ui",
  "version": "3.0.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">= 24" },
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "playwright test",
    "lint:style": "stylelint \"src/**/*.css\" --fix",
    "prettier:write": "prettier --write \"./src/**/*.{ts,astro,css}\"",
    "prettier:check": "prettier -l \"./src/**/*.{ts,astro,css}\""
  },
  "dependencies": {
    "astro": "^6.3.1"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.4",
    "@axe-core/playwright": "^4.10.0",
    "@playwright/test": "^1.48.0",
    "husky": "^9.1.0",
    "lint-staged": "^15.2.0",
    "prettier": "^3.3.0",
    "prettier-plugin-astro": "^0.14.0",
    "stylelint": "^16.0.0",
    "stylelint-config-standard": "^36.0.0",
    "typescript": "^5.6.0"
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"]
  }
}
```

- [ ] **Step 3: Install (and neutralize the stale husky v4 hook)**

The old CRA setup installed a husky v4 `pre-commit` hook (runs `react-scripts test`). Once the new deps replace `node_modules`, that shim breaks every commit. Remove it now; a fresh husky v9 hook is re-added in Task 12. (`.git/hooks` is the shared common dir — this also stops the old hook on the `master` checkout, which is fine mid-migration.)

```bash
rm -f .git/hooks/pre-commit         # stale husky v4 shim
rm -rf node_modules package-lock.json
npm install
```
Expected: installs cleanly; no React packages (`npm ls react` → empty); `git commit` no longer runs the CRA test. `husky` + `lint-staged` are installed but **inactive** (no `prepare` script / `.husky/` dir yet — added in Task 12).

- [ ] **Step 4: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

// https://astro.build
export default defineConfig({
  site: 'https://austin.komeijyuku.com',
  output: 'static',
  trailingSlash: 'never',
  build: {
    // Emit `iaijutsu.html` (not `iaijutsu/index.html`) so S3 can serve
    // extensionless URLs exactly like the old react-snap + production.sh flow.
    format: 'file',
    inlineStylesheets: 'never',
  },
});
```

- [ ] **Step 5: Replace `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "src/**/*.tsx", "src/registerServiceWorker.ts", "src/react-app-env.d.ts"]
}
```
During migration the legacy CRA React sources (`src/**/*.tsx`, `registerServiceWorker.ts`, `react-app-env.d.ts`) stay in-tree as the porting reference but import packages that are no longer installed — excluding them keeps `astro check` green. **Remove this exclude in Task 11** once those files are deleted.

- [ ] **Step 6: Create `src/env.d.ts`**

```ts
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
```

- [ ] **Step 7: Create `src/consts.ts`**

```ts
export const SITE_URL = 'https://austin.komeijyuku.com';
export const SITE_NAME = 'Austin Komei Jyuku';
export const CONTACT_EMAIL = 'brandon@komeijyuku.com';

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Iaijutsu', href: '/iaijutsu' },
  { label: 'Schedule', href: '/schedule' },
  { label: 'Seminars', href: '/seminars' },
  { label: 'Contact', href: 'mailto:brandon@komeijyuku.com', external: true },
];

export interface SocialLink {
  label: string;
  href: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Facebook', href: 'https://www.facebook.com/austinkomeijyuku' },
  { label: 'Instagram', href: 'https://www.instagram.com/austinkomeijyuku/' },
  { label: 'YouTube', href: 'http://www.youtube.com/user/austinkomeijyuku' },
];
```

- [ ] **Step 8: Create a temporary placeholder page so the build runs**

`src/pages/index.astro`:
```astro
---
---
<html lang="en"><head><title>scaffold</title></head><body><h1>scaffold ok</h1></body></html>
```

- [ ] **Step 9: Verify dev + build + check**

Run:
```bash
npm run check && npm run build
```
Expected: `astro check` reports 0 errors; build writes `dist/index.html`. `ls dist/index.html` succeeds.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro, remove CRA toolchain"
```

---

## Task 2: Port global styles, fonts, and assets

Moves the existing stylesheets and their referenced assets so the cascade/breakpoints are preserved verbatim. Vite resolves the relative `url()` refs (fonts + `images/lilly.jpg`) and hashes them.

**Files:**
- Move: `src/styles/master.css`, `src/styles/responsive.css`, `src/styles/fonts/*`, `src/styles/images/*` (stay under `src/styles/`)
- Move: `public/robots.txt` ← `src/robots.txt`; `public/sitemap.xml` ← `src/sitemap.xml`
- Move: `src/containers/home/local-business-schema.json` → `src/data/local-business-schema.json`

**Interfaces:**
- Produces: two global stylesheets importable via `import '../styles/master.css'` etc. from any `.astro` frontmatter.

- [ ] **Step 1: Relocate SEO text files into `public/`** (served at site root, byte-identical)

```bash
git mv src/robots.txt public/robots.txt
git mv src/sitemap.xml public/sitemap.xml
mkdir -p src/data
git mv src/containers/home/local-business-schema.json src/data/local-business-schema.json
```
Note: `src/styles/` already lives where Astro expects; leave `master.css`, `responsive.css`, `fonts/`, `images/` in place. Their internal `url('./fonts/...')` and `url("images/lilly.jpg")` refs resolve relative to the CSS file — no edits needed.

- [ ] **Step 2: Update `stylelint` config** — replace `.stylelintrc` contents

`.stylelintrc`:
```json
{ "extends": "stylelint-config-standard", "rules": { "no-descending-specificity": null, "font-family-no-missing-generic-family-keyword": null } }
```

- [ ] **Step 3: Build a throwaway smoke page that imports the globals**

Temporarily edit `src/pages/index.astro`:
```astro
---
import '../styles/master.css';
import '../styles/responsive.css';
---
<html lang="en">
  <head><meta charset="utf-8" /><title>styles smoke</title></head>
  <body><h1 class="cover-title">Font + base CSS smoke test</h1></body>
</html>
```

- [ ] **Step 4: Verify fonts + CSS load in the built output**

Run:
```bash
npm run build
```
Expected: build succeeds; `dist/_astro/` contains hashed `master`/`responsive` CSS and hashed Amble font files (`ls dist/_astro | grep -i amble` shows woff/ttf/etc). No unresolved-asset errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: relocate global styles, fonts, robots/sitemap, schema data"
```

---

## Task 3: SEO head + StandardLayout (replace react-helmet + index.html)

**Files:**
- Create: `src/components/SeoHead.astro`, `src/layouts/StandardLayout.astro`
- Test: `tests/routing.spec.ts` (head assertions added here, expanded in Task 10)

**Interfaces:**
- `SeoHead.astro` **Consumes** props `{ title: string; desc: string; path: string; image?: string; noIndex?: boolean }`. Renders `<meta charset>`, `<title>` (template `"%s, Austin Komei Jyuku"` unless title already is the site name), description, viewport, canonical, OG, Twitter, PWA meta, manifest link, favicon. Canonical/OG URL = `new URL(path, SITE_URL)` with trailing slash stripped (except root).
- `StandardLayout.astro` **Consumes** the same SEO props (forwarded to `SeoHead`) plus a default `<slot />`. **Produces** the full `<html><head>…</head><body><Nav/><slot/></body></html>` shell. Every page renders through it.

- [ ] **Step 1: Write `tests/routing.spec.ts` (failing — head tags)**

```ts
import { test, expect } from '@playwright/test';

test('home has canonical + OG url without trailing slash', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Austin Komei Jyuku/);
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute('href', 'https://austin.komeijyuku.com/');
  const ogTitle = page.locator('meta[property="og:title"]');
  await expect(ogTitle).toHaveAttribute('content', /.+/);
});

test('iaijutsu canonical is extensionless, no trailing slash', async ({ page }) => {
  await page.goto('/iaijutsu');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://austin.komeijyuku.com/iaijutsu',
  );
});
```

- [ ] **Step 2: Run it — verify it fails**

Run: `npx playwright test tests/routing.spec.ts` (after Task 9's playwright config exists this passes; for now expected FAIL/config-missing). If Playwright not yet configured, defer running to Task 10 and continue.

- [ ] **Step 3: Create `src/components/SeoHead.astro`**

```astro
---
import { SITE_URL, SITE_NAME } from '../consts';
import defaultOgp from '../components/head/images/ogp-mon-1200-630.png';
import appleIcon from '../styles/images/ogp-mon-375.jpg';

interface Props {
  title: string;
  desc: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}

const { title, desc, path, image, noIndex = false } = Astro.props;

// canonical: absolute, strip trailing slash except root
const canonicalUrl = new URL(path, SITE_URL).href.replace(/(.+)\/$/, '$1');
const ogImage = new URL(image ?? defaultOgp.src, SITE_URL).href;
const fullTitle = title === SITE_NAME ? SITE_NAME : `${title}, ${SITE_NAME}`;
---
<meta charset="utf-8" />
<title lang="en">{fullTitle}</title>
<meta name="description" content={desc} />
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
<link rel="canonical" href={canonicalUrl} />
{noIndex && <meta name="robots" content="noindex" />}

<meta property="og:site_name" content={SITE_NAME} />
<meta property="og:title" content={title} />
<meta property="og:description" content={desc} />
<meta property="og:url" content={canonicalUrl} />
<meta property="og:image" content={ogImage} />
<meta property="og:type" content="website" />
<meta property="og:locale" content="en_US" />

<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={desc} />
<meta name="twitter:url" content={canonicalUrl} />
<meta name="twitter:image" content={ogImage} />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@akjdojo" />

<meta name="mobile-web-app-capable" content="yes" />
<meta name="theme-color" content="#000000" />
<meta name="application-name" content="Austin Komei Jyuku" />
<meta name="apple-mobile-web-app-status-bar-style" content="black" />
<link rel="apple-touch-icon" href={appleIcon.src} />

<link rel="manifest" href="/manifest.json?v=20240219" />
<link rel="shortcut icon" href="/favicon.ico" />
```
Note: keep the source images where they are (`src/components/head/images/…`, `src/styles/images/…`) until Task 11; imports resolve now.

- [ ] **Step 4: Create `src/layouts/StandardLayout.astro`**

```astro
---
import SeoHead from '../components/SeoHead.astro';
import Nav from '../components/Nav.astro';
import '../styles/master.css';
import '../styles/responsive.css';

interface Props {
  title: string;
  desc: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}

const { title, desc, path, image, noIndex } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <SeoHead title={title} desc={desc} path={path} image={image} noIndex={noIndex} />
    <slot name="head" />
  </head>
  <body>
    <Nav />
    <slot />
  </body>
</html>
```
Note: `Nav.astro` is created in Task 5; until then temporarily comment the `import Nav` + `<Nav />` lines, or stub `src/components/Nav.astro` with `<header class="masthead"></header>`.

- [ ] **Step 5: Point the temp index page at the layout to smoke it**

`src/pages/index.astro`:
```astro
---
import StandardLayout from '../layouts/StandardLayout.astro';
---
<StandardLayout title="Traditional Japanese Swordsmanship" desc="test" path={Astro.url.pathname}>
  <main><h1>layout smoke</h1></main>
</StandardLayout>
```

- [ ] **Step 6: Verify build + head output**

Run:
```bash
npm run build && grep -o 'rel="canonical" href="[^"]*"' dist/index.html
```
Expected: prints `rel="canonical" href="https://austin.komeijyuku.com/"` (root keeps its single slash).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: SeoHead + StandardLayout replacing react-helmet and index.html"
```

---

## Task 4: Port purely-static presentational components

Straight JSX→Astro ports. Rules applied to each: `className`→`class`; `{/* */}`→`<!-- -->`; drop `React`/interfaces into frontmatter `interface Props`; destructure `Astro.props`; `defaultProps`→default values in destructure; children→`<slot />`; keep the component's `.css` import in frontmatter (global, as CRA did); `react-router` `<Link to>`→`<a href>`; image imports use `img.src`.

**Files (create each; move its CSS unchanged):**
- `src/components/Footer.astro` (from `footer/footer.tsx`, import `footer/footer.css`)
- `src/components/Quote.astro` (from `quote/quote.tsx`)
- `src/components/PanelSection.astro`, `src/components/PanelContent.astro`
- `src/components/BelowFold.astro`
- `src/components/ResponsiveImage.astro`, `src/components/ResponsiveMap.astro`
- `src/components/BlockImageCta.astro`

**Interfaces (Produces — later tasks rely on these prop names):**
- `Footer` — no props.
- `Quote` — `{ content: string; author: string; quotes?: boolean }` (default `quotes = true`).
- `PanelSection` — `{ color?: 'olive' | 'cream' }` (default `'olive'`) + slot.
- `PanelContent` — `{ fullViewHeight?: boolean }` (default `false`) + slot.
- `BelowFold` — passes through `class`/`role` extras + slot (renders `<div class="below-fold group">`). Accept `role?: string` and merge.
- `ResponsiveImage` — native `<img>` attrs: `{ src: string; alt?: string; class?: string }` (default `alt = ''`).
- `ResponsiveMap` — wrapper `<div>` + slot + passthrough `class`.
- `BlockImageCta` — `{ to: string; title?: string; content?: string; imgSrc: string; imgAlt: string }`. Renders `<a href={to}>` with a `ResponsiveImage`, title/content, and the static "more" icon (`ctas/images/more.png` via import → `.src`).

- [ ] **Step 1: Move each component's CSS unchanged**

```bash
git mv src/components/footer/footer.css src/components/footer.css
git mv src/components/quote/quote.css src/components/quote.css
git mv src/components/panels/panel-section.css src/components/panel-section.css
git mv src/components/panels/panel-content.css src/components/panel-content.css
git mv src/components/below-fold/below-fold.css src/components/below-fold.css
git mv src/components/images/responsive-image.css src/components/responsive-image.css
git mv src/components/maps/responsive-map.css src/components/responsive-map.css
git mv src/components/ctas/block-image-cta.css src/components/block-image-cta.css
git mv src/components/ctas/images src/components/ctas-images
```

- [ ] **Step 2: Create `src/components/Footer.astro`**

```astro
---
import './footer.css';
const year = new Date().getFullYear();
---
<footer class="site-footer">
  <p>© {year} Austin Komei Jyuku. All rights reserved.</p>
</footer>
```
Note: open `src/components/footer/footer.tsx` and copy its exact inner markup/class names; the copyright line above is a placeholder — match the source verbatim.

- [ ] **Step 3: Create `src/components/Quote.astro`**

```astro
---
import './quote.css';
interface Props { content: string; author: string; quotes?: boolean; }
const { content, author, quotes = true } = Astro.props;
---
<aside class="quote">
  <blockquote>{quotes ? `“${content}”` : content}</blockquote>
  <cite>{author}</cite>
</aside>
```
Note: match `quote/quote.tsx` markup/classes exactly (it may use a different element structure for the quote marks — port verbatim).

- [ ] **Step 4: Create `PanelSection.astro`, `PanelContent.astro`, `BelowFold.astro`**

`PanelSection.astro`:
```astro
---
import './panel-section.css';
interface Props { color?: 'olive' | 'cream'; }
const { color = 'olive' } = Astro.props;
---
<section class={`panel-section ${color}`}><slot /></section>
```

`PanelContent.astro`:
```astro
---
import './panel-content.css';
interface Props { fullViewHeight?: boolean; }
const { fullViewHeight = false } = Astro.props;
---
<div class={`panel-content ${fullViewHeight ? 'full-view-height' : ''}`}>
  <div class="panel-content-inner group"><slot /></div>
</div>
```

`BelowFold.astro`:
```astro
---
import './below-fold.css';
const { class: className, ...rest } = Astro.props;
---
<div class:list={['below-fold', 'group', className]} {...rest}><slot /></div>
```
Note: verify exact class names/structure against `panels/*.tsx` and `below-fold/below-fold.tsx` and match verbatim.

- [ ] **Step 5: Create `ResponsiveImage.astro`, `ResponsiveMap.astro`**

`ResponsiveImage.astro`:
```astro
---
import './responsive-image.css';
const { src, alt = '', class: className, ...rest } = Astro.props;
---
<img src={src} alt={alt} class:list={[className]} {...rest} />
```

`ResponsiveMap.astro`:
```astro
---
import './responsive-map.css';
const { class: className, ...rest } = Astro.props;
---
<div class:list={['responsive-map', className]} {...rest}><slot /></div>
```
Note: match wrapper class names from `maps/responsive-map.tsx`.

- [ ] **Step 6: Create `src/components/BlockImageCta.astro`**

```astro
---
import './block-image-cta.css';
import ResponsiveImage from './ResponsiveImage.astro';
import imgMore from './ctas-images/more.png';

interface Props {
  to: string;
  title?: string;
  content?: string;
  imgSrc: string;
  imgAlt: string;
}
const { to, title = '', content = '', imgSrc, imgAlt } = Astro.props;
---
<a class="block-image-cta" href={to}>
  <ResponsiveImage src={imgSrc} alt={imgAlt} />
  <div class="block-image-cta-info">
    <h3>{title}</h3>
    <p set:html={content} />
    <img class="block-image-cta-more" src={imgMore.src} alt="" aria-hidden="true" />
  </div>
</a>
```
Note: open `ctas/block-image-cta.tsx` and mirror its exact class names/structure. `content` may contain HTML entities (`&ldquo;` etc.) — use `set:html` as above so they render, matching the React behavior.

- [ ] **Step 7: Typecheck**

Run: `npm run check`
Expected: 0 errors (some components are unused until pages exist — that's fine).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: port static presentational components to Astro"
```

---

## Task 5: Accessible nav dropdown (vanilla TS island)

Replaces the React class component. Implements the WAI-ARIA **Disclosure Navigation** pattern (correct for a link menu — no arrow-key menubar semantics required): a real toggle `<button aria-expanded>` controlling a region of links, plus close-on-outside-click and Escape-to-close with focus return. Removes the old `role="menubar"/menuitem` roles (they impose arrow-key requirements inappropriate for site links). CSS ported unchanged.

**Files:**
- Create: `src/components/Nav.astro`
- Move: `git mv src/components/nav/nav.css src/components/nav.css`; `git mv src/components/nav/images src/components/nav-images`
- Test: `tests/nav.spec.ts`

**Interfaces:**
- `Nav.astro` — no props. Reads `NAV_ITEMS`, `SOCIAL_LINKS` from `consts.ts`. **Produces** DOM with stable hooks the script binds to: button `.menu-icon`, nav `.site-menu`, menu region `#aria-menu-list`. The open state is the `open` class on `.site-menu` + `aria-expanded` on the button + `aria-hidden` on the region.

- [ ] **Step 1: Write `tests/nav.spec.ts` (failing)**

```ts
import { test, expect } from '@playwright/test';

test.describe('nav dropdown', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/'); });

  test('toggles open/closed via button, aria-expanded tracks', async ({ page }) => {
    const btn = page.locator('.menu-icon');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.site-menu')).toHaveClass(/open/);
    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  test('opens via keyboard (Enter) and closes on Escape returning focus', async ({ page }) => {
    const btn = page.locator('.menu-icon');
    await btn.focus();
    await page.keyboard.press('Enter');
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(btn).toBeFocused();
  });

  test('closes when clicking outside', async ({ page }) => {
    await page.locator('.menu-icon').click();
    await expect(page.locator('.site-menu')).toHaveClass(/open/);
    await page.locator('body').click({ position: { x: 5, y: 400 } });
    await expect(page.locator('.site-menu')).not.toHaveClass(/open/);
  });
});
```

- [ ] **Step 2: Run — verify it fails**

Run: `npx playwright test tests/nav.spec.ts`
Expected: FAIL (no `.menu-icon` yet / config pending Task 9). If config not ready, note failure reason and proceed; re-run in Task 10.

- [ ] **Step 3: Move nav assets**

```bash
git mv src/components/nav/nav.css src/components/nav.css
git mv src/components/nav/images src/components/nav-images
```

- [ ] **Step 4: Create `src/components/Nav.astro`** (markup mirrors `nav/nav.tsx` classes; roles adjusted to disclosure pattern)

```astro
---
import './nav.css';
import { NAV_ITEMS, SOCIAL_LINKS } from '../consts';
import imgMon from './nav-images/komei-jyuku-mon-64.png';
import imgMenu from './nav-images/menu.png';
import imgMenuClose from './nav-images/menu-close.png';
import imgFacebook from './nav-images/facebook.svg';
import imgInstagram from './nav-images/instagram.svg';
import imgYoutube from './nav-images/youtube.svg';

const socialImg: Record<string, string> = {
  Facebook: imgFacebook.src,
  Instagram: imgInstagram.src,
  YouTube: imgYoutube.src,
};
---
<header class="masthead translate-z">
  <div class="masthead-left">
    <a class="brand-logo" href="/"><img src={imgMon.src} alt="Dojo homepage" /></a>
  </div>
  <a class="brand-title" href="/">Austin Komei Jyuku</a>

  <nav class="site-menu" aria-label="Site Navigation">
    <button class="menu-icon" aria-expanded="false" aria-controls="aria-menu-list">
      <span class="menu-title">Menu</span>
      <img class="menu-open-img" src={imgMenu.src} alt="" aria-hidden="true" />
      <img class="menu-close-img" src={imgMenuClose.src} alt="" aria-hidden="true" />
    </button>

    <div id="aria-menu-list" class="menu-bar group" hidden>
      <ul id="nav-list" class="nav-list">
        {NAV_ITEMS.map((item) => (
          <li class="nav-list-item">
            <a class="nav-parent" href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>
      <div class="social">
        {SOCIAL_LINKS.map((s) => (
          <a class="social-link" href={s.href} target="_blank" rel="noopener noreferrer">
            <img class="social-icon" src={socialImg[s.label]} alt={s.label} />
          </a>
        ))}
      </div>
    </div>
  </nav>
</header>

<script>
  const nav = document.querySelector<HTMLElement>('.site-menu');
  const btn = nav?.querySelector<HTMLButtonElement>('.menu-icon');
  const region = document.getElementById('aria-menu-list');

  if (nav && btn && region) {
    const setOpen = (open: boolean) => {
      nav.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (open) region.removeAttribute('hidden');
      else region.setAttribute('hidden', '');
    };

    const isOpen = () => btn.getAttribute('aria-expanded') === 'true';

    btn.addEventListener('click', () => setOpen(!isOpen()));

    // close after following an internal link (kept for parity; full loads anyway)
    region.querySelectorAll('a.nav-parent').forEach((a) =>
      a.addEventListener('click', () => setOpen(false)),
    );

    // Escape closes and returns focus to the toggle
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        setOpen(false);
        btn.focus();
      }
    });

    // click/tap outside closes
    document.addEventListener('mousedown', (e) => {
      if (isOpen() && e.target instanceof Node && !nav.contains(e.target)) setOpen(false);
    });
  }
</script>
```
Note: `nav.css` targets `.site-menu.open`, `.menu-open-img`, `.menu-close-img` etc. — the `open` class + `hidden` attr keep those selectors working. Verify against `nav/nav.css` that hiding the region via `hidden` doesn't fight an existing `display` rule; if it does, drop the `hidden` attribute and rely solely on the `open` class + set `aria-hidden` on the region instead (update the script's `setOpen` accordingly). Keep whichever matches the original visual behavior.

- [ ] **Step 5: Wire `Nav` into `StandardLayout.astro`** (uncomment the import + `<Nav />` from Task 3 Step 4).

- [ ] **Step 6: Verify build + typecheck**

Run: `npm run check && npm run build`
Expected: 0 type errors; `dist/index.html` contains `class="menu-icon"` and `aria-expanded="false"`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: accessible nav dropdown as vanilla TS island"
```

---

## Task 6: Parallax hero (vanilla TS island)

Replaces `FullScreenParallaxImage` React class. Vanilla script does the scroll-driven background-position parallax, the smooth-scroll "scroll down" button, and the mobile `background-attachment` fix. Accepts either a title/content pair or slotted children (home uses children).

**Files:**
- Create: `src/components/FullScreenParallaxImage.astro`
- Move: `git mv src/components/images/full-screen-parallax-image.css src/components/full-screen-parallax-image.css`; move its chevron icon.
- Test: covered by `tests/a11y.spec.ts` + a scroll assertion in `tests/routing.spec.ts`.

**Interfaces:**
- `FullScreenParallaxImage.astro` — **Consumes** `{ backgroundImgSrc: string; title?: string; content?: string; parallaxSpeed?: number; scrollTargetId?: string }`. When default slot has content, render it instead of title/content (mirrors the React `children ? children : text` branch). `scrollTargetId` is the id of the element to smooth-scroll to (replaces the React ref). Default `parallaxSpeed = 5`.

- [ ] **Step 1: Move CSS + icon**

```bash
git mv src/components/images/full-screen-parallax-image.css src/components/full-screen-parallax-image.css
mkdir -p src/components/images-icons
git mv src/components/images/images/chevron-down-icon.svg src/components/images-icons/chevron-down-icon.svg
```

- [ ] **Step 2: Create `src/components/FullScreenParallaxImage.astro`**

```astro
---
import './full-screen-parallax-image.css';
import imgChevron from './images-icons/chevron-down-icon.svg';

interface Props {
  backgroundImgSrc: string;
  title?: string;
  content?: string;
  parallaxSpeed?: number;
  scrollTargetId?: string;
}
const { backgroundImgSrc, title = '', content = '', parallaxSpeed = 5, scrollTargetId } = Astro.props;
const hasSlot = Astro.slots.has('default');
---
<section class="cover-parallax">
  <div
    class="cover-image"
    style={`background-image: url('${backgroundImgSrc}')`}
    data-parallax-speed={parallaxSpeed}
  >
    {hasSlot ? (
      <slot />
    ) : (
      <div class="cover-text">
        <h1 class="cover-title">{title}</h1>
        <p class="cover-content">{content}</p>
      </div>
    )}

    {scrollTargetId && (
      <div class="cover-scroll-cue" data-scroll-target={scrollTargetId}>
        <!-- real anchor: works with JS disabled (native #jump); script upgrades to smooth-scroll -->
        <a class="cover-scroll-btn" href={`#${scrollTargetId}`} aria-label="Scroll Down">
          <img src={imgChevron.src} alt="" aria-hidden="true" />
        </a>
      </div>
    )}
  </div>
</section>

<script>
  const cover = document.querySelector<HTMLElement>('.cover-parallax .cover-image');
  if (cover) {
    const speed = Number(cover.dataset.parallaxSpeed) || 5;

    // disable fixed attachment on touch devices (matches original UA sniff intent)
    if (/Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      cover.style.backgroundAttachment = 'scroll';
    }

    const onScroll = () => {
      const y = window.pageYOffset || window.scrollY;
      cover.style.backgroundPosition = `50% ${-(y / speed)}px`;
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const cue = document.querySelector<HTMLElement>('.cover-scroll-cue');
    const targetId = cue?.dataset.scrollTarget;
    if (cue && targetId) {
      cue.addEventListener('click', (e) => {
        // upgrade the native anchor jump to a smooth scroll (no-JS still gets the jump)
        e.preventDefault();
        document
          .getElementById(targetId)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      });
    }
  }
</script>
```
Note: the old code passed a `scrollToRef`; here the page gives the below-fold wrapper an `id` (e.g. `id="below-fold-main"`) and passes `scrollTargetId="below-fold-main"`. Verify `full-screen-parallax-image.css` selectors (`.cover-parallax`, `.cover-image`, `.cover-text`, `.cover-title`, `.cover-content`, `.cover-scroll-cue`, `.cover-scroll-btn`) are all present — they are ported unchanged.

**Progressive enhancement (works with JS disabled):** the hero image is a CSS `background-image` written into the static HTML, so it renders without JavaScript — the script only *adds* the parallax motion and upgrades the scroll cue's native `#anchor` jump to a smooth scroll. This is plain HTML + an enhancement `<script>`, not a hydrated framework island.

- [ ] **Step 3: Build check**

Run: `npm run check`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: parallax hero as vanilla TS island"
```

---

## Task 7: Accessible scroll-snap image gallery (vanilla TS island)

Replaces `react-image-gallery` entirely. CSS scroll-snap track (native swipe, fully responsive), bullet buttons, prev/next buttons, native Fullscreen API, IntersectionObserver active-slide tracking, and keyboard support (Arrow/Home/End, Enter/Space on controls). Follows the WAI-ARIA carousel pattern (`aria-roledescription`, slide labels, `aria-live` announcements). New internal CSS replaces the dropped `image-gallery.css`; the existing `.slide-gallery-images` responsive wrapper rules are reused.

**Files:**
- Create: `src/components/SlideGallery.astro`
- Rewrite: `src/components/slide-gallery.css` (keep `.slide-gallery-group`/`.slide-gallery-images` rules from the old file; replace `.image-gallery-*` internals with `.sg-*`)
- Test: `tests/gallery.spec.ts`

**Interfaces:**
- `SlideGallery.astro` — **Consumes** `{ items: Array<{ src: string; alt: string }>; label?: string }`. (Home/iaijutsu build this array from image imports.) **Produces** a self-contained carousel; no external control needed.

- [ ] **Step 1: Write `tests/gallery.spec.ts` (failing)**

```ts
import { test, expect } from '@playwright/test';

test.describe('image gallery', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/iaijutsu'); });

  test('renders slides with alt text and bullet controls', async ({ page }) => {
    const slides = page.locator('.sg-slide');
    await expect(slides.first()).toBeVisible();
    expect(await slides.count()).toBeGreaterThan(1);
    await expect(page.locator('.sg-bullet').first()).toHaveAttribute('aria-label', /slide 1/i);
  });

  test('next button advances active slide and updates aria-current', async ({ page }) => {
    await expect(page.locator('.sg-bullet[aria-current="true"]')).toHaveAttribute(
      'data-index', '0');
    await page.locator('.sg-next').click();
    await expect(page.locator('.sg-bullet[aria-current="true"]')).toHaveAttribute(
      'data-index', '1');
  });

  test('keyboard arrows move slides when track focused', async ({ page }) => {
    await page.locator('.sg-track').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.sg-bullet[aria-current="true"]')).toHaveAttribute(
      'data-index', '1');
    await page.keyboard.press('Home');
    await expect(page.locator('.sg-bullet[aria-current="true"]')).toHaveAttribute(
      'data-index', '0');
  });

  test('fullscreen button is present and labelled', async ({ page }) => {
    await expect(page.locator('.sg-fullscreen')).toHaveAttribute('aria-label', /fullscreen/i);
  });
});
```

- [ ] **Step 2: Run — verify it fails**

Run: `npx playwright test tests/gallery.spec.ts` → FAIL (no `.sg-track`). Re-run in Task 10 if config pending.

- [ ] **Step 3: Rewrite `src/components/slide-gallery.css`**

```css
/* wrapper — ported verbatim from the old slide-gallery.css */
.slide-gallery-group { background: #eae6db; }
.slide-gallery-images {
  width: 80%;
  max-width: 1200px;
  margin: 80px auto 100px;
  position: relative;
}

/* track: native swipe + scroll-snap, fully responsive */
.sg-track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  list-style: none;
  margin: 0;
  padding: 0;
  scrollbar-width: none;
}
.sg-track::-webkit-scrollbar { display: none; }
.sg-track:focus-visible { outline: 2px solid #eae6db; outline-offset: 2px; }

.sg-slide { flex: 0 0 100%; scroll-snap-align: center; }
.sg-slide img { display: block; width: 100%; height: auto; }

/* prev/next arrows */
.sg-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: 0;
  color: #eae6db;
  font-size: 3em;
  line-height: 1;
  cursor: pointer;
  padding: 0 10px;
  display: none; /* hidden on mobile, shown >=480px below */
}
.sg-prev { left: 0; }
.sg-next { right: 0; }
.sg-nav:hover, .sg-nav:focus { color: #fff; }

/* bullets */
.sg-bullets {
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
}
.sg-bullet {
  width: 12px;
  height: 12px;
  padding: 0;
  border: 1px solid #eae6db;
  border-radius: 0;
  background: transparent;
  cursor: pointer;
}
.sg-bullet[aria-current="true"] { background: #eae6db; }
.sg-bullet:hover, .sg-bullet:focus { background: #eae6db; }

/* fullscreen toggle */
.sg-fullscreen {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: none;
  border: 0;
  color: #eae6db;
  font-size: 1.5em;
  cursor: pointer;
}
.sg-fullscreen:hover, .sg-fullscreen:focus { color: #fff; }

/* fullscreen presentation via native Fullscreen API */
.slide-gallery-images:fullscreen { width: 100%; max-width: none; margin: 0; background: #000; }
.slide-gallery-images:fullscreen .sg-track { height: 100vh; align-items: center; }
.slide-gallery-images:fullscreen .sg-slide { display: flex; align-items: center; justify-content: center; }
.slide-gallery-images:fullscreen .sg-slide img { max-height: 100vh; width: auto; object-fit: contain; }

/* Responsive — mirrors original breakpoints */
@media screen and (min-width: 320px) {
  .slide-gallery-images { width: 95%; }
  .sg-nav { display: none; }
}
@media screen and (min-width: 480px) {
  .slide-gallery-images { width: 80%; }
  .sg-nav { display: block; }
}
@media screen and (min-width: 768px) {
  .sg-bullet[aria-current="true"] { padding: 0; }
}
```

- [ ] **Step 4: Create `src/components/SlideGallery.astro`**

```astro
---
import './slide-gallery.css';

interface Props {
  items: Array<{ src: string; alt: string }>;
  label?: string;
}
const { items, label = 'Iaido training photos' } = Astro.props;
const count = items.length;
---
<section class="slide-gallery-group group" aria-roledescription="carousel" aria-label={label}>
  <div class="slide-gallery-images">
    <ul class="sg-track" tabindex="0" aria-live="polite">
      {items.map((item, i) => (
        <li
          class="sg-slide"
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${count}`}
        >
          <img src={item.src} alt={item.alt} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
        </li>
      ))}
    </ul>

    <button class="sg-nav sg-prev" type="button" aria-label="Previous slide">&#8249;</button>
    <button class="sg-nav sg-next" type="button" aria-label="Next slide">&#8250;</button>

    <div class="sg-bullets" role="group" aria-label="Choose slide to display">
      {items.map((_, i) => (
        <button
          class="sg-bullet"
          type="button"
          data-index={i}
          aria-current={i === 0 ? 'true' : 'false'}
          aria-label={`Go to slide ${i + 1}`}
        ></button>
      ))}
    </div>

    <button class="sg-fullscreen" type="button" aria-label="View gallery fullscreen">&#9974;</button>
  </div>
</section>

<script>
  const root = document.querySelector<HTMLElement>('.slide-gallery-images');
  const track = root?.querySelector<HTMLElement>('.sg-track');
  if (root && track) {
    const slides = Array.from(track.querySelectorAll<HTMLElement>('.sg-slide'));
    const bullets = Array.from(root.querySelectorAll<HTMLButtonElement>('.sg-bullet'));
    const prev = root.querySelector<HTMLButtonElement>('.sg-prev');
    const next = root.querySelector<HTMLButtonElement>('.sg-next');
    const fs = root.querySelector<HTMLButtonElement>('.sg-fullscreen');
    let active = 0;

    const setActive = (i: number) => {
      active = Math.max(0, Math.min(slides.length - 1, i));
      bullets.forEach((b, bi) => b.setAttribute('aria-current', String(bi === active)));
    };

    const goTo = (i: number) => {
      const clamped = Math.max(0, Math.min(slides.length - 1, i));
      slides[clamped].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      setActive(clamped);
    };

    // track active slide as the user swipes/scrolls
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(slides.indexOf(e.target as HTMLElement));
        });
      },
      { root: track, threshold: 0.6 },
    );
    slides.forEach((s) => io.observe(s));

    prev?.addEventListener('click', () => goTo(active - 1));
    next?.addEventListener('click', () => goTo(active + 1));
    bullets.forEach((b) =>
      b.addEventListener('click', () => goTo(Number(b.dataset.index))),
    );

    // keyboard support on the focusable track
    track.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowRight': e.preventDefault(); goTo(active + 1); break;
        case 'ArrowLeft':  e.preventDefault(); goTo(active - 1); break;
        case 'Home':       e.preventDefault(); goTo(0); break;
        case 'End':        e.preventDefault(); goTo(slides.length - 1); break;
      }
    });

    // native fullscreen (Escape exits automatically); no translateZ hack needed
    fs?.addEventListener('click', async () => {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await root.requestFullscreen().catch(() => {});
    });
    document.addEventListener('fullscreenchange', () => {
      const on = document.fullscreenElement === root;
      fs?.setAttribute('aria-label', on ? 'Exit fullscreen' : 'View gallery fullscreen');
    });
  }
</script>
```

- [ ] **Step 5: Typecheck + build**

Run: `npm run check && npm run build`
Expected: 0 errors (component unused until iaijutsu page exists — fine).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: accessible scroll-snap image gallery replacing react-image-gallery"
```

---

## Task 8: Port the pages

Each page becomes a `.astro` file that renders `StandardLayout` with SEO props and the ported body. **Conversion recipe for the body markup** (apply to every page): copy the JSX inside each container's `return (…)` verbatim, then `className`→`class`; `{/* */}`→`<!-- -->`; `<React.Fragment>`/`<>` → remove (content goes directly in the slot); child components `<Head …>` → the layout props; `<BelowFold role="main" ref=…>` → `<BelowFold role="main" id="below-fold-main">`; image imports move to frontmatter and are referenced as `img.src`; `props.location.pathname` → `Astro.url.pathname`; `dangerouslySetInnerHTML` → `set:html`. Keep text content, `lang="ja"` spans, entities, and class names exactly.

**Files:**
- Create: `src/pages/index.astro`, `iaijutsu.astro`, `schedule.astro`, `seminars.astro`, `404.astro`, `tokai.astro`
- Move: `git mv src/containers/home/images src/pages/home-images`; `git mv src/containers/iaijutsu/images src/pages/iaijutsu-images`

**Interfaces:**
- **Consumes** every component from Tasks 3–7 (`StandardLayout`, `BelowFold`, `Footer`, `Quote`, `PanelSection`, `PanelContent`, `ResponsiveImage`, `ResponsiveMap`, `BlockImageCta`, `FullScreenParallaxImage`, `SlideGallery`).

- [ ] **Step 1: Move page images**

```bash
git mv src/containers/home/images src/pages/home-images
git mv src/containers/iaijutsu/images src/pages/iaijutsu-images
```

- [ ] **Step 2: Create `src/pages/index.astro`** (Home)

Frontmatter:
```astro
---
import StandardLayout from '../layouts/StandardLayout.astro';
import BelowFold from '../components/BelowFold.astro';
import Footer from '../components/Footer.astro';
import BlockImageCta from '../components/BlockImageCta.astro';
import FullScreenParallaxImage from '../components/FullScreenParallaxImage.astro';
import ResponsiveImage from '../components/ResponsiveImage.astro';
import schema from '../data/local-business-schema.json';

import imgIsshin from './home-images/isshin-800.png';
import imgOitaFest from './home-images/800-oita-fest.webp';
import imgEnbu from './home-images/1920-mjer-enbu-2025.webp';
import imgMap from './home-images/800-map-itk.webp';
import imgMjerKanji from './home-images/mjer-kanji.png';
import imgSeminar from './home-images/800-seminar-2025.webp';

const title = 'Traditional Japanese Swordsmanship';
const desc =
  'The Austin Komei Jyuku dojo teaches Yamauchi-Ha Muso Jikiden Eishin-ryu Iaijutsu under Sekiguchi Komei Sensei in Austin, Texas.';
---
<StandardLayout title={title} desc={desc} path={Astro.url.pathname}>
  <FullScreenParallaxImage backgroundImgSrc={imgEnbu.src} scrollTargetId="below-fold-main" parallaxSpeed={5}>
    <div class="big-brand">
      <div class="logo">
        <ResponsiveImage src={imgMjerKanji.src} alt="Muso Jikiden Eishin-ryu Iaijutsu" />
      </div>
      <h1 class="invisible" aria-hidden="false">Austin Komei Jyuku</h1>
    </div>
  </FullScreenParallaxImage>

  <BelowFold role="main" id="below-fold-main">
    <!-- port the <section class="home …"> … isshin block VERBATIM from home.tsx lines 61-155,
         using imgOitaFest.src / imgMap.src / imgSeminar.src / imgIsshin.src in the CTAs,
         and <BlockImageCta to="/iaijutsu" …> etc. -->
    <Footer />
  </BelowFold>

  <script type="application/ld+json" set:html={JSON.stringify(schema)} />
</StandardLayout>
```
Note: reproduce the About section, the 3 `BlockImageCta`s (with the exact `content` strings/entities), and the isshin block from `src/containers/home/home.tsx` lines 61–155 exactly. The JSON-LD `<script>` is placed inside the layout slot (renders in `<body>`, valid for structured data) — or hoist into `<head>` via `<Fragment slot="head">` if preferred.

- [ ] **Step 3: Create `src/pages/iaijutsu.astro`**

Frontmatter builds the gallery array from the 14 imports currently in `iaijutsu-image-gallery.ts` (all alt `'Iaido training at Austin Komei Jyuku'`):
```astro
---
import StandardLayout from '../layouts/StandardLayout.astro';
import BelowFold from '../components/BelowFold.astro';
import Footer from '../components/Footer.astro';
import FullScreenParallaxImage from '../components/FullScreenParallaxImage.astro';
import PanelContent from '../components/PanelContent.astro';
import PanelSection from '../components/PanelSection.astro';
import Quote from '../components/Quote.astro';
import SlideGallery from '../components/SlideGallery.astro';

import imgUkenagashi from './iaijutsu-images/1920-ukenagashi.webp';
import g0 from './iaijutsu-images/1280-tokyo-enbu.webp';
import g1 from './iaijutsu-images/yasukuni-2020.jpg';
import g2 from './iaijutsu-images/1280-oita-enbu-group.webp';
import g3 from './iaijutsu-images/1280-seiza.webp';
import g4 from './iaijutsu-images/sekiguchi-sensei-zengogiri.jpg';
import g5 from './iaijutsu-images/tameshigiri-2022.jpg';
import g6 from './iaijutsu-images/kumitachi-2022.jpg';
import g7 from './iaijutsu-images/1280-oita-kesagake.webp';
import g8 from './iaijutsu-images/1280-tokyo-group.webp';
import g9 from './iaijutsu-images/muto-dori.jpg';
import g10 from './iaijutsu-images/inazuma-2022.jpg';
import g11 from './iaijutsu-images/suigetsuto-2022.jpg';
import g12 from './iaijutsu-images/sekiguchi-sensei-chuden.jpg';
import g13 from './iaijutsu-images/reiho.jpg';

const gallery = [g0, g1, g2, g3, g4, g5, g6, g7, g8, g9, g10, g11, g12, g13].map((img) => ({
  src: img.src,
  alt: 'Iaido training at Austin Komei Jyuku',
}));

const title = 'Muso Jikiden Eishin-ryu Iaijutsu';
const desc =
  'The Austin Komei Jyuku dojo teaches Yamauchi-Ha Muso Jikiden Eishin-ryu Iaido under Sekiguchi Komei sensei.';
---
<StandardLayout title={title} desc={desc} path={Astro.url.pathname}>
  <FullScreenParallaxImage
    backgroundImgSrc={imgUkenagashi.src}
    scrollTargetId="below-fold-main"
    parallaxSpeed={5}
    title="Muso Jikiden Eishin-ryu Iaijutsu"
    content="Iaijutsu classes are held each Monday and Wednesday from 7:30pm - 9:30pm at Immortal Martial Arts Academy. Saturday morning training from 9:00am - 10:00am."
  />

  <BelowFold role="main" id="below-fold-main">
    <PanelSection>
      <!-- History PanelContent: port iaijutsu.tsx lines 48-107 verbatim -->
      <SlideGallery items={gallery} />
      <!-- Lineage PanelContent: port lines 113-155 verbatim -->
    </PanelSection>

    <PanelSection color="cream">
      <!-- Waza / Kumitachi / Toho PanelContent: port lines 158-293 verbatim -->
    </PanelSection>

    <Quote
      content="Once you understand the long sword, you will know all shorter swords."
      author="Sekiguchi Komei sensei"
    />
    <Footer />
  </BelowFold>
</StandardLayout>
```
Note: after this page works, delete the now-unused `src/containers/iaijutsu/iaijutsu-image-gallery.ts` in Task 11.

- [ ] **Step 4: Create `schedule.astro`, `seminars.astro`, `404.astro`** (pure static ports)

For each: frontmatter imports `StandardLayout`, `BelowFold`, `Footer`, `Quote`, `PanelSection`, `PanelContent`, `ResponsiveMap`; set `title`/`desc` from the container's `<Head>` props; body ports the container JSX verbatim (including the Google Maps `<iframe loading="lazy">` for schedule/seminars). `404.astro` sets `noIndex` — pass `noIndex={true}` to `StandardLayout` and forward it to `SeoHead` (add `noIndex` to the layout's Props + pass-through). Example skeleton:
```astro
---
import StandardLayout from '../layouts/StandardLayout.astro';
import BelowFold from '../components/BelowFold.astro';
import Footer from '../components/Footer.astro';
import Quote from '../components/Quote.astro';
import PanelSection from '../components/PanelSection.astro';
import PanelContent from '../components/PanelContent.astro';
import ResponsiveMap from '../components/ResponsiveMap.astro';
// title/desc copied from schedule.tsx <Head/>
---
<StandardLayout title={title} desc={desc} path={Astro.url.pathname}>
  <BelowFold role="main" id="below-fold-main">
    <!-- port schedule.tsx / seminars.tsx / no-match.tsx body verbatim -->
    <Footer />
  </BelowFold>
</StandardLayout>
```

- [ ] **Step 5: Create `src/pages/tokai.astro`** (redirect `/tokai` → `/seminars`)

```astro
---
// Static redirect (S3/CloudFront has no server rewrites); meta-refresh + canonical.
const target = '/seminars';
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content={`0; url=${target}`} />
    <link rel="canonical" href={`https://austin.komeijyuku.com${target}`} />
    <title>Redirecting…</title>
  </head>
  <body><p>Redirecting to <a href={target}>Seminars</a>.</p></body>
</html>
```
Note: Astro also supports `export const redirect` config, but S3 static hosting can't honor server 301s without CloudFront rules; meta-refresh preserves the old `/tokai` deep link. Optionally add a CloudFront function later for a true 301.

- [ ] **Step 6: Build all pages**

Run:
```bash
npm run build && ls dist/*.html
```
Expected: `dist/index.html dist/iaijutsu.html dist/schedule.html dist/seminars.html dist/404.html dist/tokai.html`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: port all pages to Astro"
```

---

## Task 9: Test harness — Vitest unit + coverage, Playwright e2e + axe

Two layers of tests plus the small refactor that makes the island logic unit-testable:
- **Unit (Vitest + jsdom, with coverage)** over pure/interaction logic extracted into importable TS modules.
- **E2E (Playwright + axe)** over the real pages: full-page behavior + accessibility on every route.

The e2e suite is set up and green FIRST so it is the safety net while the island `<script>`s are refactored into modules. Behavior must stay identical through the extraction (re-run e2e after each).

Split of responsibility: jsdom-testable logic (nav toggle/Escape/outside-click, gallery index/keyboard/bullet/status, parallax math, SeoHead canonical) is unit-tested; browser-only APIs (IntersectionObserver, Fullscreen) are exercised by the e2e layer (stub or skip them in unit).

**Files:**
- Create: `playwright.config.ts`, `vitest.config.ts`, `tests/a11y.spec.ts`, unit tests as `src/**/*.test.ts`
- Create (extraction): `src/lib/seo.ts`, `src/scripts/nav.ts`, `src/scripts/parallax.ts`, `src/scripts/gallery.ts`
- Modify: `SeoHead.astro`, `Nav.astro`, `FullScreenParallaxImage.astro`, `SlideGallery.astro` (import the modules); `package.json` (scripts + devDeps)

**Interfaces (Produces):**
- `src/lib/seo.ts` — `buildCanonical(path: string, siteUrl: string): string` (root keeps its slash; strips `.html`/`/index.html` and other trailing slashes) and `buildOgImage(image: string | undefined, defaultSrc: string, siteUrl: string): string`.
- `src/scripts/nav.ts` — `initNav(doc?: Document): void`.
- `src/scripts/parallax.ts` — pure `parallaxOffset(scrollY: number, speed: number): number` + `initParallax(doc?: Document): void`.
- `src/scripts/gallery.ts` — pure `clampIndex(i: number, len: number): number` + `initGallery(doc?: Document): void`.

### E2E first

- [ ] **Step 1: `playwright.config.ts`**

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://localhost:4321' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
```

- [ ] **Step 2: Install browsers** — `npx playwright install --with-deps chromium`

- [ ] **Step 3: `tests/a11y.spec.ts`** (axe sweep)

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const path of ['/', '/iaijutsu', '/schedule', '/seminars', '/404']) {
  test(`no serious/critical a11y violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''));
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
}
```

- [ ] **Step 4: Run e2e** — `npx playwright test`. All of `routing`/`nav`/`gallery`/`a11y` green (island behavior verified end-to-end). Fix any a11y violations (likely: `:focus-visible` on controls, contrast on `.cover-content`).

- [ ] **Step 5: Commit** — `git commit -m "test: playwright e2e + axe"`

### Unit + extraction

- [ ] **Step 6: Add deps + scripts** — `npm i -D vitest @vitest/coverage-v8 jsdom`. Set `package.json` scripts:
```json
"test": "npm run test:unit && npm run test:e2e",
"test:unit": "vitest run",
"test:e2e": "playwright test",
"coverage": "vitest run --coverage"
```

- [ ] **Step 7: `vitest.config.ts`** (jsdom; coverage on the extracted modules; do not collide with Playwright's `./tests`)

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    coverage: { provider: 'v8', include: ['src/lib/**', 'src/scripts/**'], reporter: ['text', 'html'] },
  },
});
```

- [ ] **Step 8: Extract SeoHead canonical → `src/lib/seo.ts`** and have `SeoHead.astro` import `buildCanonical`/`buildOgImage`. Behavior identical (root keeps slash, `.html` stripped). Re-run `npm run build` + `npx playwright test`.

- [ ] **Step 9: Extract island scripts → `src/scripts/{nav,parallax,gallery}.ts`**, each exporting `init*` (+ the pure helper). Each `.astro` replaces its inline logic with:
```astro
<script>
  import { initNav } from '../scripts/nav';
  initNav();
</script>
```
Do them one at a time and re-run `npx playwright test` after EACH so any behavior drift is caught immediately.

- [ ] **Step 10: Unit tests (`src/**/*.test.ts`, jsdom)**
  - `src/lib/seo.test.ts`: `buildCanonical` for `/`, `/index.html`, `/iaijutsu`, `/iaijutsu.html`, `/a/index.html`; `buildOgImage` returns an absolute URL.
  - `src/scripts/parallax.test.ts`: `parallaxOffset(1000, 5) === -200`, `parallaxOffset(0, 5) === 0`.
  - `src/scripts/nav.test.ts`: mount minimal nav DOM, `initNav(document)`; click toggle → `.open` + `aria-expanded="true"`; Escape → closed + button focused; mousedown outside → closed.
  - `src/scripts/gallery.test.ts`: `clampIndex` bounds; mount minimal gallery DOM, `initGallery(document)`; ArrowRight → active bullet index 1; Home → 0; bullet click moves `aria-current`; `.sg-status` text updates. Stub `IntersectionObserver` (a no-op class) in the test setup; leave fullscreen to e2e.

- [ ] **Step 11: Coverage + full run** — `npm run coverage` (confirm `src/lib` + `src/scripts` are well covered; aim high, not necessarily 100%), then `npm test` (unit + e2e) green.

- [ ] **Step 12: Commit** — `git commit -m "test: vitest unit tests + coverage"`

---

## Task 10: Verify parity + accessibility end-to-end

- [ ] **Step 1: Full typecheck + build + tests**

Run: `npm run check && npm run build && npm test`
Expected: 0 type errors, all pages emit, all Playwright/axe tests green.

- [ ] **Step 2: Manual visual parity pass** (use the `verify` skill / browser tools)

Serve `npm run preview` and compare each route against the current production site at the 8 breakpoints (320/400/480/600/768/1024/1200/1500). Confirm: fonts (Amble faces) load, hero parallax scrolls, nav opens/closes (mouse + keyboard + outside-click + Escape), gallery swipes/bullets/arrows/fullscreen/keyboard work, footer year renders, JSON-LD present in home, canonical URLs extensionless.

- [ ] **Step 3: Confirm extensionless output shape**

Run: `ls dist` and confirm flat `*.html` files (no `iaijutsu/` directory). This is what `production.sh` will upload as extensionless keys.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: visual + a11y parity adjustments"
```

---

## Task 11: Remove CRA remnants + update CI/docs

**Files:**
- Delete: CRA sources; Modify: `.circleci/config.yml`, `.circleci/production.sh`, `.nvmrc`, `README.md`, `.gitignore`, `.prettierrc`

- [ ] **Step 1: Delete dead CRA files**

```bash
git rm -r src/index.tsx src/app.tsx src/app.test.tsx src/logo.svg \
  src/registerServiceWorker.ts src/react-app-env.d.ts \
  src/containers tslint.json public/index.html \
  src/containers/iaijutsu/iaijutsu-image-gallery.ts 2>/dev/null || true
git rm .env .env.production 2>/dev/null || true
```
Then remove now-empty component source dirs (`src/components/nav`, `footer`, `quote`, `panels`, `images`, `maps`, `ctas`, `head`, `below-fold`) once their assets/CSS have been moved. Verify nothing references them: `grep -rn "containers/\|react-router\|react-helmet\|react-image-gallery\|react-dom" src` returns nothing.

- [ ] **Step 2: Confirm `.nvmrc`** — already set to `24.18.0` in Task 1; verify it is present and unchanged:

```
24.18.0
```

- [ ] **Step 3: Update `.prettierrc`** — add the Astro plugin

```json
{ "singleQuote": true, "trailingComma": "all", "printWidth": 100, "plugins": ["prettier-plugin-astro"] }
```

- [ ] **Step 4: Update `.circleci/config.yml`** — Node 24 image, drop separate prerender, replace test/build steps

Change the docker image to `cimg/node:24.18.0-browsers`; replace the two run steps:
```yaml
      - run:
          name: Type check and tests
          command: npm run check && npm test
      - run:
          name: Build (static, extensionless)
          command: npm run build
```
Add a Playwright browser install step before tests (`npx playwright install --with-deps chromium`). Keep the deploy step but point it at `dist` (see Step 5). Cache key stays `{{ checksum "package.json" }}` (or switch to `package-lock.json`).

- [ ] **Step 5: Update `.circleci/production.sh`** — Astro `file` format already outputs `dist/*.html`, so skip react-snap's directory-rename; upload from `dist` and drop the src robots/sitemap copy (now in `dist` from `public/`).

Replace `rename_html_files()` usage: set `HTML_FILES=$(ls ./dist/*.html)` directly (no `*/index.html` rename loop). Change every `./build` → `./dist`. Remove the two `aws s3 cp ./src/sitemap.xml`/`robots.txt` lines (they ship in `dist` via `public/` and are covered by `aws s3 sync ./dist … --exclude="*.html"`). Keep the extensionless `aws s3 cp $i s3://$BUCKET/<name>` loop and the `index.html` special-case exactly as-is.

- [ ] **Step 6: Update `README.md`** — replace CRA instructions with Astro (`npm run dev/build/preview/check/test`), note static+extensionless output and the S3/CloudFront deploy.

- [ ] **Step 7: Final green build**

Run: `npm run check && npm run build && npm test`
Expected: all green; `grep -rn "react" package.json` shows no react packages.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: remove CRA remnants, update CircleCI/deploy/docs for Astro"
```

- [ ] **Step 9: Open PR**

```bash
git push -u origin worktree-astro-migration
gh pr create --title "Migrate to Astro (static, extensionless, a11y islands)" \
  --body "Replaces CRA/react-snap with Astro static output. Ports CSS/breakpoints as-is; nav dropdown, parallax hero, and image gallery reimplemented as dependency-free accessible TS islands. Preserves extensionless URLs + SEO."
```

---

## Task 12: Project tooling — husky hook + CLAUDE.md + .claude/settings.json

Re-adds a git pre-commit hook (Astro ships none), plus a Claude Code project guide and shared settings. Runs last so the hook and docs reflect the final Astro setup. `.claude/settings.json` is tracked (only `.claude/worktrees/` + `.claude/settings.local.json` are gitignored).

**Files:**
- Create: `.husky/pre-commit`, `CLAUDE.md` (repo root), `.claude/settings.json`; Modify: `package.json` (add `prepare` script + `lint-staged` config)

- [ ] **Step 1: Re-add husky v9 + lint-staged pre-commit hook**

`husky` + `lint-staged` were installed in Task 1 but left inactive. Activate them now:

```bash
npx husky init          # creates .husky/pre-commit + adds "prepare": "husky" to package.json
```
Set `.husky/pre-commit` contents to:
```sh
npx lint-staged
```
Add a `lint-staged` block to `package.json` (mirrors the old CRA intent — format + lint staged files only; Playwright and `astro check` stay in CI, not on every commit, since running them per-commit is too slow):
```json
"lint-staged": {
  "*.{ts,astro}": ["prettier --write"],
  "*.css": ["stylelint --fix", "prettier --write"]
}
```
Verify: stage a trivial change and `git commit` — the hook runs prettier/stylelint on staged files and passes.

- [ ] **Step 2: Create `CLAUDE.md`**

````markdown
# CLAUDE.md

Austin Komei Jyuku dojo site — an **Astro** static site (migrated from CRA).

## Commands
- `npm run dev` — dev server (http://localhost:4321)
- `npm run build` — static build to `dist/` (extensionless `*.html`)
- `npm run preview` — serve the built site
- `npm run check` — `astro check` (types)
- `npm test` — Playwright + axe e2e/a11y
- `npm run lint:style` — stylelint; `npm run prettier:write` — format

## Architecture
- Static MPA: `output: 'static'`, `build.format: 'file'`, `trailingSlash: 'never'` → S3-served extensionless URLs (`/iaijutsu`).
- Pages in `src/pages/*.astro` render through `src/layouts/StandardLayout.astro` (owns `<head>` via `SeoHead.astro` + the nav).
- **No UI framework** — three interactive pieces are dependency-free vanilla TS `<script>` islands: nav dropdown (`Nav.astro`), parallax hero (`FullScreenParallaxImage.astro`), image gallery (`SlideGallery.astro`, CSS scroll-snap). All degrade gracefully without JS.
- CSS ported as-is: `src/styles/master.css` + `responsive.css` (global) plus per-component `.css` imported in each component's frontmatter. Breakpoints: 320/400/480/600/768/1024/1200/1500.
- Images imported in frontmatter, used via `img.src`. JSON-LD via `<script type="application/ld+json" set:html={...}>`.

## Conventions
- TypeScript strict; vanilla DOM APIs only (no React).
- Accessibility is a hard requirement: real `<button>`/`<a>`, keyboard support, correct ARIA; pages must pass axe (no serious/critical).
- Node 24.18.0 (`.nvmrc`).

## Deploy
- CircleCI on push to `master` → build → `.circleci/production.sh` syncs `dist/` to S3 (extensionless keys) + CloudFront invalidation.
````

- [ ] **Step 3: Create `.claude/settings.json`** — shared permission allowlist for this project's workflow, plus branch-from-HEAD for future worktrees

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(npm run:*)",
      "Bash(npm test:*)",
      "Bash(npm install)",
      "Bash(npm ci)",
      "Bash(npx astro:*)",
      "Bash(npx playwright:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git status)",
      "Bash(git diff:*)",
      "Bash(git mv:*)",
      "Bash(git log:*)"
    ]
  },
  "worktree": { "baseRef": "head" }
}
```
Note: `worktree.baseRef: "head"` makes future `EnterWorktree` branches start from local HEAD — avoids the origin/master-vs-local rebase we hit during setup. Refine the allowlist later with the `fewer-permission-prompts` skill. Keep anything sensitive out of `settings.json` and in the gitignored `settings.local.json`.

- [ ] **Step 4: Commit**

```bash
git add .husky package.json CLAUDE.md .claude/settings.json
git commit -m "chore: re-add husky pre-commit hook; add CLAUDE.md + shared settings"
```

---

## Task 13: CSS lint cleanup and modernization (final task)

Fixes the ~797 `stylelint-config-standard` errors on the ported legacy CSS WITHOUT changing rendered appearance or breakpoints. Runs last, after the whole site is built and verified (Task 10) and after tooling is in place, so verified visual parity is the baseline to preserve. User directive: "clean up / resolve / modernize while still maintaining the breakpoints; do not break the site."

**Files:** `src/**/*.css` as needed. No `.astro`/`.ts` logic changes.

**Hard constraints:**
- Do NOT change rendered output or any of the 8 breakpoints (320/400/480/600/768/1024/1200/1500).
- Prefer safe mechanical fixes. Modernize deprecated syntax (legacy IE `*`/underscore hacks, deprecated color/number notation) only when rendering is provably unchanged.
- Gate: `npm run lint:style` reports 0 errors, `npm run build` passes, `npm test` (Playwright + axe) passes, and the Task 10 visual parity pass is re-run at all 8 breakpoints with no visible diff.

- [ ] **Step 1: Baseline** — capture the current error list and confirm the site is green before touching anything.

```bash
nvm use 24.18.0
npx stylelint "src/**/*.css" > .superpowers/sdd/stylelint-before.txt 2>&1 || true
npm run build && npm test
```

- [ ] **Step 2: Auto-fix the safe subset**

```bash
npm run lint:style        # stylelint --fix: formatting, quotes, spacing, color/number notation
npm run build
```
Confirm the build still passes, then commit. If the husky hook (Task 12) is active, the commit re-runs `stylelint --fix` on staged CSS; that is expected. Reach a clean pass before the final commit; for intermediate WIP commits mid-cleanup you may use `git commit --no-verify`, but the LAST commit must pass the hook (0 errors).

- [ ] **Step 3: Resolve remaining non-auto-fixable errors, file by file**

Preserve selectors, cascade order, and every `@media` breakpoint. For a rule that would force a rendering-risky change, disable that specific rule in `.stylelintrc` with a one-line comment explaining why (or a scoped `/* stylelint-disable-next-line <rule> */`), rather than altering the CSS in a way that could shift layout. Commit in small batches.

- [ ] **Step 4: Re-verify after each batch**

Run `npm run build`, then `npm test`, then spot-check the affected pages at the relevant breakpoints in the browser (use the `verify` skill / browser tools). If any fix changes appearance, revert it and disable the offending rule instead.

- [ ] **Step 5: Final verification + commit**

`npm run lint:style` → 0 errors; full `npm test` green; visual parity confirmed at all 8 breakpoints.
```bash
git add -A
git commit -m "style: lint cleanup and modernization of ported CSS (no visual/breakpoint change)"
```

---

## Self-Review

**1. Spec coverage:**
- Move off CRA → Astro ✅ (Tasks 1, 11). Static generation (was react-snap) ✅ (`output:'static'` + `build.format:'file'`, Task 1; deploy Task 11). TypeScript ✅ (Task 1 tsconfig strict). CSS/breakpoints as-is ✅ (Task 2 global imports + Task 4/5/6/7 keep `.css`). Nav dropdown decision (vanilla TS, a11y/keyboard) ✅ (Task 5). Image gallery decision (Option B scroll-snap + tiny TS, responsive + a11y/keyboard) ✅ (Task 7). Parallax hero ✅ (Task 6). SEO/react-helmet ✅ (Task 3). JSON-LD ✅ (Task 8). CircleCI kept + updated ✅ (Task 11). Extensionless URL preservation ✅ (Global Constraints + Tasks 1/10/11). `/tokai` redirect ✅ (Task 8). 404 ✅ (Task 8).
- Gap check: `robots.txt`/`sitemap.xml`/`manifest`/favicon/PWA icons → covered (Task 2 moves to `public/`; Task 3 links manifest/favicon).
- User additions: Node 24.18.0 pin ✅ (Global Constraints + Tasks 1/11). Isolated worktree + scoped `.claude` gitignore ✅ (Execution Environment; committed on `master`). CLAUDE.md + tracked `.claude/settings.json` ✅ (Task 12). Parallax degrades without JS — static CSS-bg image + real anchor cue ✅ (Task 6). `astro check` stays green with legacy `.tsx` in-tree via tsconfig exclude ✅ (Task 1). Husky pre-commit hook re-added since Astro ships none ✅ (Task 12; stale v4 hook neutralized in Task 1). CSS lint cleanup/modernization deferred to the end, preserving all breakpoints ✅ (Task 13).

**2. Placeholder scan:** The large page bodies (home/iaijutsu/schedule/seminars) are intentionally described as "port verbatim from lines X–Y" rather than re-transcribed, because they are mechanical 1:1 markup ports of existing files and re-typing ~600 lines invites transcription drift; the exact conversion rules + all non-obvious wiring (SEO props, image `.src`, JSON-LD `set:html`, gallery array, parallax `scrollTargetId`) are given in full. All logic-bearing files (config, layout, SeoHead, Nav, gallery, parallax, small components) contain complete runnable code.

**3. Type/name consistency:** `scrollTargetId` (Task 6) ↔ `id="below-fold-main"` (Task 8) match. `SlideGallery` `items: {src,alt}[]` (Task 7) ↔ `gallery.map(img => ({src, alt}))` (Task 8) match. `BlockImageCta` props `{to,title,content,imgSrc,imgAlt}` (Task 4) ↔ home usage (Task 8) match. `.menu-icon`/`.site-menu`/`#aria-menu-list` (Task 5 markup) ↔ nav.spec selectors (Task 5 test) match. `.sg-track/.sg-slide/.sg-bullet/.sg-next/.sg-prev/.sg-fullscreen` consistent across CSS, component, and gallery.spec.

---

## Open Questions (revisit after the migration)

- **Service worker / full PWA.** Installability (desktop Chrome "open in app", mobile add-to-home-screen) is driven by `manifest.json` + the PWA icons, which this migration preserves and links in every page head, so that capability carries over unchanged. A service worker is NOT required for install in modern Chrome; it only adds offline caching / a "full" PWA. Decision to make AFTER the migration lands: add a real service worker (e.g. `@vite-pwa/astro`) for offline support, or keep manifest-only installability. The old CRA site shipped `registerServiceWorker.ts` but it was commented out, so it never ran one. User confirmed they want desktop install + mobile add-to-home-screen (both met by the manifest alone) and asked to revisit the service worker separately at the end.

---

## Improvement candidates (revisit at the end, with the user)

The migration ports the site AS-IS first so nothing breaks. Best-practice / modernization ideas noticed during porting are collected here, NOT applied yet, to review with the user at the end. Each must preserve appearance, breakpoints, and behavior unless the user opts in. Add to this list as tasks surface ideas.

- **Nav dropdown → native Popover API.** [from Task 5] The nav is a JS island (toggle `open` class + document listeners for outside-click and Escape). The native Popover API (`<button popovertarget="…">` + `<div popover>`) provides toggle, light-dismiss (outside-click close), and Escape-close natively, and auto-manages the invoker's `aria-expanded`, cutting most of the custom JS. Broadly supported since 2024. Would need to confirm it composes with `nav.css` (`.site-menu.open > .menu-bar` reveal) and preserves focus-return to the button on close.
- **SeoHead modernization.** [from Task 3] Use `rel="icon"` instead of legacy `rel="shortcut icon"`; drop the non-standard `lang` attribute on `<title>`.
- **ResponsiveImage / ResponsiveMap.** [from Task 4] Currently narrowed to `{src, alt, class}`. Consider widening to generic native-attribute passthrough, or adopting Astro `<Image>` (`astro:assets`) for automatic responsive/optimized images.
- **CSS modernization / lint cleanup** is already scheduled as Task 13 (preserve all breakpoints).
- **SEO header — is there an Astro first-class way?** [from Task 3, user] No official `<SEO>` component exists in Astro core; the idiomatic Astro pattern IS a custom head component, which is exactly what `SeoHead.astro` is, so we are already doing it the Astro way. Options: (a) keep the custom component (lightest, zero deps); (b) adopt the community `astro-seo` `<SEO>` component for a maintained abstraction. Strongly worth adopting regardless: **`@astrojs/sitemap`** (official integration) to auto-generate `sitemap.xml` from routes instead of hand-maintaining it.
- **SEO audit (end).** [from Task 3, user] Run a Lighthouse SEO pass on the built site; validate the home JSON-LD with Google's Rich Results test; consider structured data on more than just the home page; consider per-page OG images; confirm canonical / robots.txt / sitemap consistency.
- **Scroll-snap gallery.** [from Task 7] `scroll-behavior: smooth` (CSS) and the script's `scrollIntoView({behavior: 'smooth'})` ignore `prefers-reduced-motion`; gate both on the media query so motion-sensitive users get instant jumps. Longer-term, emerging CSS Carousel primitives (`::scroll-marker`/`::scroll-marker-group`, `scroll-target-group`, `animation-timeline: scroll()`) could let the browser drive active-bullet sync (and maybe bullet rendering) natively, shrinking or removing the IntersectionObserver/bullet-click JS — not yet broadly supported, revisit when baseline improves.
