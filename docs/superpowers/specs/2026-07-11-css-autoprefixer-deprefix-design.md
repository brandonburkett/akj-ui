# Autoprefixer + de-prefix source CSS + re-enable vendor-prefix lint rules — Design

**Date:** 2026-07-11
**Scope:** whole CSS tree + `postcss.config.cjs` + `.stylelintrc.mjs` + `package.json`

## Problem

Task 13 disabled three stylelint rules — `property-no-vendor-prefix`, `value-no-vendor-prefix`, `selector-no-vendor-prefix` — because the ported legacy CSS carries 126 hand-written vendor prefixes and the Astro build has no autoprefixer, so removing them would drop real coverage. This change turns autoprefixer on, standardizes the source, keeps the genuinely-needed non-standard webkit idioms, drops dead-browser hacks, and re-enables all three rules.

## Approach

1. **Enable autoprefixer.** PostCSS ships with Astro (via Vite). Add `autoprefixer` as the only plugin. It reads the `browserslist` in `package.json` (the `production` env section, which `astro build` resolves to since `NODE_ENV=production`) and adds back exactly the prefixes the targets need — at build time, not in source.
2. **Standardize the source**, handling prefixes by category (below).
3. **Re-enable the three lint rules** with narrow escape-hatches for the kept idioms.
4. **Verify** by diffing the built CSS before/after + full gate + cross-browser.

## Prefix categorization (audited from the actual CSS)

| Group | Action | Why |
|---|---|---|
| `border-radius`, `box-shadow`, `transition`, `transform`, `box-sizing`, `column-count`/`column-gap`, `text-size-adjust` (webkit/moz/o/ms forms), and the manual gradient stack (`-webkit-gradient`, `-webkit-/-moz-/-o-linear-gradient`) | **Remove** from source; keep only the standard property/value | Obsolete for the browserslist; autoprefixer regenerates any the targets still need (in 2026, nearly none). For the gradient, collapse to a single standard `linear-gradient(to bottom, #ddd, #fff)` (add it if the stack lacks a standard line). |
| `::-webkit-scrollbar` (gallery scrollbar hiding, `slide-gallery.css`) | **Keep** | Actively used by current Chrome/Safari; not obsolete |
| `-webkit-overflow-scrolling: touch` (`slide-gallery.css`) | **Keep** | iOS momentum scroll; autoprefixer cannot generate it |
| `-webkit-appearance: none/button/textfield` (reset, `master.css`) | **Keep** | webkit-specific reset values; standard `appearance` does not define `button`/`textfield` |
| `-ms-interpolation-mode: bicubic`, `-ms-filter: none`, and the ancient `-webkit-gradient(linear, …)` form | **Drop entirely** | IE-only / Safari-4-only; excluded by `not dead`, so no target browser uses them. (User-approved.) |

**Completeness rule:** the table lists what the audit found, but the implementer must independently grep every vendor-prefixed property, value, AND selector across `src/**/*.css` and categorize each. If any prefix does not clearly fit one of the groups above (remove / keep-with-escape-hatch / drop), STOP and ask rather than guessing — a wrong call here is a silent rendering regression.

## End-state config

`postcss.config.cjs` (repo root):
```js
module.exports = { plugins: [require('autoprefixer')] };
```

`.stylelintrc.mjs` — replace the three `*-no-vendor-prefix: null` lines with:
```js
    // keep the few non-standard webkit idioms autoprefixer can't generate:
    // appearance reset (button/textfield), iOS momentum scroll
    'property-no-vendor-prefix': [true, { ignoreProperties: ['appearance', 'overflow-scrolling'] }],
    'value-no-vendor-prefix': true,
    'selector-no-vendor-prefix': true,
```
And a scoped `/* stylelint-disable-next-line selector-no-vendor-prefix */` on the `.sg-track::-webkit-scrollbar` line (the one remaining prefixed selector, needed by current browsers).

Add `autoprefixer` to `devDependencies` (`npm i -D autoprefixer`).

## Verification (this is what makes it safe)

1. **Before:** on the current committed tree, `npm run build`, then snapshot the emitted prefixes: `grep -rhoE '\-(webkit|moz|ms|o)-[a-z-]+' dist/_astro/*.css | sort | uniq -c` → save.
2. Apply the change.
3. **After:** `npm run build`, same snapshot.
4. **Compare.** Fewer prefixes after is expected (the removed ones served dead browsers). The required assertions:
   - The built CSS still contains the 3 kept idioms: `-webkit-overflow-scrolling`, `::-webkit-scrollbar` (as `-webkit-scrollbar`), `-webkit-appearance`.
   - Autoprefixer ran (spot-check: any prefix the browserslist needs is present; the dead-browser hacks `-ms-interpolation-mode`/`-ms-filter`/`-webkit-gradient(` are gone).
5. `npx stylelint "src/**/*.css"` exits 0 with the three rules active.
6. Full gate: `npm run check` (0), `npm run build` (6 pages), `npm test` (28 unit + 15 e2e).
7. **Cross-browser visual pass** (Safari, Firefox, Chrome) on the pages whose look leans on the affected properties (gradients/shadows/radius/columns/transitions) — primarily the home page and the gallery.

## Non-goals
- No Lightning CSS (separate future option).
- No `cssnano` (Astro already minifies).
- No change to breakpoints, layout, or the visual result — only the prefix *mechanism* (source → build-time) changes.

## Commits (each with the `Co-Authored-By` footer)
1. `build: add autoprefixer (postcss)` — dep + `postcss.config.cjs`.
2. `refactor: de-prefix source css; drop dead-browser hacks` — the CSS edits.
3. `build: re-enable vendor-prefix stylelint rules` — `.stylelintrc.mjs` changes + the one scoped-disable.

(Or fold 2+3 if cleaner; keep 1 separate so the autoprefixer enablement is isolated.)
