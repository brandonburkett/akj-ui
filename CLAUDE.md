# CLAUDE.md

Austin Komei Jyuku dojo site — an **Astro** static site.

## Commands
- `npm run dev` — dev server (http://localhost:4321)
- `npm run build` — static build to `dist/` (extensionless `*.html`)
- `npm run preview` — serve the built site
- `npm run check` — `astro check` (types)
- `npm run test:unit` — Vitest unit tests; `npm run coverage` for V8 coverage
- `npm run test:e2e` — Playwright + axe e2e/a11y
- `npm test` — runs `test:unit` then `test:e2e`
- `npm run lint:style` — stylelint; `npm run prettier:write` — format (`prettier:check` to verify)

## Architecture
- Static MPA: `output: 'static'`, `build.format: 'file'`, `trailingSlash: 'never'` → S3-served extensionless URLs (`/iaijutsu`).
- Pages in `src/pages/*.astro` render through `src/layouts/StandardLayout.astro` (owns `<head>` via `SeoHead.astro` + the nav).
- **No UI framework** — three interactive pieces are dependency-free vanilla TS `<script>` enhancements colocated with their components: nav dropdown (`Nav/`), parallax hero (`FullScreenParallaxImage/`), image gallery (`SlideGallery/`, CSS scroll-snap). All degrade gracefully without JS. (Note: these are plain scripts, not hydrated Astro islands — the dev toolbar's "no islands" is expected.)
- Components live in per-component folders under `src/components/<Name>/` holding the `.astro`, its `.css`, `images/`, and any `.ts` logic + test.
- Global CSS in `src/styles/master.css` + `responsive.css` plus per-component `.css`. Breakpoints: 320/400/480/600/768/1024/1200/1500. Autoprefixer (PostCSS) adds vendor prefixes at build; `.stylelintrc.mjs` documents the few disabled rules.
- Images imported in frontmatter, used via `img.src`. JSON-LD via `<script type="application/ld+json" set:html={...}>`.

## Conventions
- TypeScript strict; vanilla DOM APIs only (no React).
- Imports: `@/*` → `src/*` alias for cross-folder imports; same-folder stays relative (`./`).
- Accessibility is a hard requirement: real `<button>`/`<a>`, keyboard support, correct ARIA; pages must pass axe (no serious/critical).
- Node 24.18.0 (`.nvmrc`).

## Commits
- Single-line [Conventional Commits](https://www.conventionalcommits.org/) subject, e.g. `feat: loop gallery chevrons at edges`. No body unless essential.
- Keep the `Co-Authored-By:` footer on every commit.

## Comments
- Explain why, not what. One short line, and only for non-obvious rationale.
- No narration or restating the code. No references to old/removed files or paths.

## Deploy
- CircleCI (AWS CLI v2, `npm ci`) on push to `master`: check → test → build → `.circleci/production.sh`.
- S3 sync at extensionless keys with tiered Cache-Control: `_astro` immutable 1yr; assets 30d; HTML short-browser / long-edge.
- CloudFront invalidation on every deploy.
