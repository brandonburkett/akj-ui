# Componentize the Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Delete `src/styles/home.css`. Split the homepage body into three per-component folders that each own their own CSS, the way every other unit in the repo does, so `src/styles/` is left holding only genuinely global sheets (`master.css`, `responsive.css`). The goal is that `home.css` stops existing, not that it moves.

**Architecture:** Three new components under `src/components/`, each a single-use unit that owns its markup, copy, images, and CSS. `HomeHero` is slot content for `FullScreenParallaxImage`. `HomeAbout` and `HomeImageBand` are slot content for `BelowFold`. `index.astro` reduces to composition plus the JSON-LD block.

**Tech notes:** No new dependencies, no JS. Pure markup and CSS relocation, plus deletion of verified-dead rules. Existing breakpoints and palette variables unchanged.

---

## Complete

Shipped on `fix/low-hanging-fruit`. Three deltas from the plan as written:

- Verification went beyond screenshots. A Playwright probe dumped computed styles and geometry for the 7 structural boxes at all 8 breakpoints, before and after. Zero geometry differences. The only computed-style deltas were the 16 expected from deleting the dead band `font-size` and `line-height`, which proves empirically they affected no layout.
- The unreferenced images were removed after all, a follow-up user decision. 7 from `home-images/` and 2 non-underscore strays from `iaijutsu-images/`, 1.1M total. The 17 `_`-prefixed files in `iaijutsu-images/` stay, the prefix marks them as deliberately parked.
- The same branch carries an unrelated small sweep, `padding-top/bottom` and `padding-left/right` pairs collapsed to `padding-block` and `padding-inline`, verified supported by all 36 browserslist targets.

---

## Audit findings

Verified before planning. Recorded so they are not relitigated.

### Every affected class is homepage-exclusive

`.home`, `.big-brand`, `.home-ctas`, `.isshin` each appear exactly once in the codebase, all in `index.astro`. `.intro` appears twice, both on the homepage. No other page can regress.

### No JavaScript references any of them

Every `querySelector` in `src/**/*.ts` targets another component. The relevant one, `parallax.ts`, selects `.cover-parallax .cover-image` and `.cover-scroll-cue`, which belong to `FullScreenParallaxImage` itself, not to its slot content. Moving `.big-brand` and `.logo` into `HomeHero` cannot reach it.

### No global sheet overrides them

`grep` across `master.css` and `responsive.css` for all six class names returns only the two dead `.intro` rules listed below. Every structural selector in those sheets that could match this DOM (`div`, `section`, `h2`, `p`) is a bare element selector, matched by tag name and indifferent to class names.

### Dead CSS, delete rather than carry over

| Location | Rule | Why dead |
| --- | --- | --- |
| `home.css:26-37` | `.home .intro .link` across 4 states | That div contains an `h2` and a `p`, no link |
| `home.css:39` | the `h1` half of `.home .intro h1, h2` | The `h1` renders in `.big-brand`, not `.intro` |
| `home.css:89-90` | `.isshin .intro` `font-size` + `line-height` | Only child is a `ResponsiveImage`. `.fit-img` is `width: 100%; display: block`, so width has no em dependency and there is no inline baseline gap |
| `home.css:143`, `:165` | `.isshin .intro` `font-size` at 1024 and 1200 | Same reason |
| `responsive.css:182-185` | `.intro { font-size: 2em }` at 1024 | Outranked, see below |
| `responsive.css:243-246` | `.intro { font-size: 2.2em }` at 1200 | Outranked, see below |

The two `responsive.css` rules sit under an `/* Interior */ ` comment but `.intro` only ever renders on the homepage, so they are homepage CSS living in a global sheet. They are also inert: both `.intro` elements match `.home .intro` or `.isshin .intro` at `(0,2,0)`, and `home.css` sets `font-size` on both at those exact breakpoints, so the bare `(0,1,0)` selector never wins. Retiring the `.intro` class entirely (see naming below) turns this from a specificity argument into a fact.

### PanelSection overlap, considered and declined

`PanelSection` already declares what the two bands share:

```
.info-panel-details             → position: relative; z-index: 1
.info-panel-details.translate-z → transform: translateZ(1px)
.info-panel-cream               → background: var(--cream)
```

That is byte-identical to `.home` and `.isshin`'s common rules, and `.info-panel-cream` is exactly `.isshin`'s background. Reuse was rejected for two reasons. `PanelSection` forces `h1`–`li` to `var(--black)`, which fights the red band's white text and would need override rules at matching specificity. And it is rendered by `404.astro`, `schedule.astro`, and `iaijutsu.astro`, so changing it widens the blast radius of a refactor whose entire point is to be contained. The four duplicated lines are already duplicated in `Footer`, `Nav`, and `Quote`, so this refactor does not make that worse. Extracting a shared band utility is a separate backlog item if it is ever worth it.

## Constraints

Three things that will silently break if ignored.

1. **The float pair.** `.home .intro` and `.home-ctas` are float siblings from 600px to 1199px, 40% left and 45% right, returning to full width at 1200px. They must stay under one parent that owns the layout. This is why the About panel is one component and not two.
2. **The margin-collapse guard.** `.isshin`'s `padding: 1px 0 10px`. The `1px` top prevents the child's `margin: 125px auto` from collapsing through the band. Drop it and the band collapses to 10px tall.
3. **Preserve tag names.** `.home` is a `<section>`, `.isshin` and both `.intro`s are `<div>`s. Global sheets style by tag, so switching a `div` to a `section` newly applies `master.css:169` and `:193`.

## Naming

Classes are renamed to match their component, following the repo convention.

| Now | After |
| --- | --- |
| `.big-brand` | `.home-hero` |
| `.logo` | `.home-hero-logo` |
| `.home` | `.home-about` |
| `.home .intro` | `.home-about-intro` |
| `.home-ctas` | `.home-about-ctas` |
| `.isshin` | `.home-image-band` |
| `.isshin .intro` | `.home-image-band-inner` |

`.logo` is a generic global one word away from Nav's `.brand-logo`. The band is named for what it is, a bottom image band, not for the particular image inside it. Retiring `.intro` means no element on the site carries that class.

## Layout after

```
src/components/HomeHero/       HomeHero.astro, home-hero.css, images/mjer-kanji.png
src/components/HomeAbout/      HomeAbout.astro, home-about.css,
                               images/{800-oita-fest.webp, 800-map-itk.webp, 800-seminar-2025.webp}
src/components/HomeImageBand/  HomeImageBand.astro, home-image-band.css, images/isshin-800.png
```

`src/pages/home-images/` keeps only `1920-mjer-enbu-2025.webp`, which is a prop the page passes to `FullScreenParallaxImage`.

Each component is single-use and owns its own copy, following `Footer`. No slots, they would be indirection with no second caller to justify them.

---

## Tasks

- [x] **Task 1: `HomeHero`.** New folder, move `mjer-kanji.png` into `images/`. Component renders the `.home-hero` div, the `.home-hero-logo` div with the kanji `ResponsiveImage`, and the visually-hidden `h1`. `home-hero.css` takes `.big-brand` and `.logo` plus the five `.logo` width breakpoints, renamed. Keep the `invisible` and `aria-hidden="false"` attributes on the `h1` exactly as they are.

- [x] **Task 2: `HomeAbout`.** New folder, move the three CTA images into `images/`. Component renders the `<section class="home-about group translate-z">` wrapper, the intro div with its `h2` and paragraph, and the `.home-about-ctas` div with the three `BlockImageCta` calls and their copy, all moved verbatim from `index.astro`. `home-about.css` takes `.home`, `.home.translate-z`, `.home .intro`, the `h2` half of the heading rule, `.home-ctas`, and all five breakpoint blocks, renamed. Do not carry the four `.link` rules or the `h1` selector.

- [x] **Task 3: `HomeImageBand`.** New folder, move `isshin-800.png` into `images/`. Component renders the `<div class="home-image-band translate-z">` wrapper and the inner div with the `ResponsiveImage`. `home-image-band.css` takes `.isshin`, `.isshin.translate-z`, and `.isshin .intro` reduced to `width`, `max-width`, and `margin`, renamed. Keep `padding: 1px 0 10px` and note why in a comment, per constraint 2. Do not carry the `font-size` or `line-height` declarations or their two breakpoint overrides.

- [x] **Task 4: Rewire `index.astro` and delete `home.css`.** Import the three components, drop the `@/styles/home.css` import, drop the five now-unused image imports, and reduce the body to the composition shown above. Delete `src/styles/home.css`. Verify `src/styles/` holds only `master.css` and `responsive.css`.

- [x] **Task 5: Delete the `responsive.css` strays.** Remove the two `/* Interior */ .intro` blocks at `:182-185` and `:243-246`.

- [x] **Task 6: Verify.** `npm run check` and `npm run lint:style` both clean, per CLAUDE.md. `npm test` for unit and Playwright/axe. Then `npm run build && npm run preview` and compare homepage screenshots against `master` at 320, 600, 768, 1024, and 1200, the five widths the CSS actually branches on. Confirm the two constraints specifically: the intro and CTA columns still sit side by side between 600 and 1199 and go full width at 1200, and the image band still has its full height rather than collapsing to 10px.

- [x] **Task 7: Update the backlog.** Remove the "Componentize the homepage" row and section from `docs/BACKLOG.md`.
