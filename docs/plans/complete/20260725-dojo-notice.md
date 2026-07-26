# Dojo Notice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a one-line, time-windowed, dismissible notice strip above the site nav, driven by a single typed data module. It must add zero cumulative layout shift in every state, keep the existing hero and nav layout untouched, and cost nothing at runtime during the months no notice is running.

**Architecture:** A `.top-stack` wrapper (`position: fixed`) holds the notice and the masthead, and is rendered only when a notice ships. The masthead becomes `position: relative` inside it, so the stack pins where the masthead used to. The notice scrolls away and the nav re-pins via a passive rAF scroll listener that translates the stack by `min(scrollY, noticeHeight)`. Visibility is decided by an `is:inline` script before first paint, so no state ever repaints or moves. Dismissal persists in `localStorage` through a new shared `src/lib/storage.ts` module.

**Tech notes:** No new dependencies. Vanilla TS, Astro conditional rendering, CSS from the existing palette and breakpoints. Vitest for logic, Playwright + axe for behavior and a11y.

---

## What actually shipped

The plan below is the design as written. Four things changed during implementation, all
deliberate, and the reasoning is worth keeping because two of them were corrections to
mistakes in this document.

### The inline pre-paint script is gone, replaced by a transform

The plan argued a synchronous `is:inline` script was the only way to hit zero CLS, because
`<script type="module">` is deferred and could run after first paint. That premise was right.
The conclusion was not.

The Layout Instability spec excludes `transform` changes from shift scoring. So the stack is
parked at `translateY(calc(-1 * var(--notice-height)))` in CSS, which **is** the dismissed
layout, and the deferred module drops the transform only after confirming the notice should
show. A dismissed visitor gets the final result on the first paint and the module is a no-op.
A first-time visitor gets a 220ms slide-down that reads as intentional.

This removed 348 gzipped bytes per page, let the client use `storage` properly instead of a
raw `localStorage` call, and gave the script minification and TypeScript back.

Cost, accepted: no-JS visitors never see the notice, since the parked state is the CSS default.

### Parking hides, it does not remove

First attempt at the above called `notice.remove()` in the parked path. That scored **0.0038**
CLS on the dismissed path, caught by a `PerformanceObserver` probe. Removing the element moved
the masthead's _layout_ position from `y=38` to `y=0` even though the transform kept it
visually still, and Chromium scores that.

Parking is now `visibility: hidden` in CSS and the dismissed path in `initDojoNotice` does
nothing at all. `visibility` also drops the notice from the a11y tree and tab order, which
removes the off-screen-focusable-link problem.

Residual CLS is **0.000229**, from the Amble webfont re-measuring `.brand-title`. Verified
identical on `master` with no notice present, so it is pre-existing and not ours.

### NavStack owns the composition

`StandardLayout` is just `<NavStack />`. `NavStack` holds the notice-or-bare-nav decision and
the `.nav-stack` CSS. `Nav/` and `DojoNotice/` are nested inside `NavStack/`, since it is
their only consumer. `CODE_STYLE.md` documents that nesting convention.

### No build-time date prune

The plan had frontmatter dropping a notice whose end date had passed. Dropped, because it was
a second implementation of the date rule running on a UTC clock while the real one runs on the
visitor's local clock, and because it pruned past-dated notices while deliberately not pruning
future-dated ones, which is arbitrary. The layout now only asks whether a notice is configured.

---

## Design decisions

Settled during brainstorming. The non-obvious ones are recorded with their reasoning so they are not relitigated or accidentally reverted.

### Naming avoids ad blocker filter lists

`banner` appears in **541 network rules** and **107 generic cosmetic rules** across EasyList + Fanboy Annoyance. Even a bundled JS chunk with `banner` in its filename risks being dropped. `announcement` is safer than expected (0 network rules, and its 5 generic cosmetic rules are all cookie-consent specific, e.g. `##.announcement-cookie`), but it sits directly adjacent to the cookie-bar category where new annoyance rules accumulate.

`dojo-notice` and every child class verified at **0 matches** across both lists. Use it for the component, the CSS classes, the script, the data module, and the storage key. Do not introduce `banner`, `promo`, `ad`, or `notification` anywhere in this feature.

### The stack is `position: fixed`, not `position: sticky`

A sticky wrapper was the first choice, because it gives scroll-away with no JS. It does not work here. On hero pages nothing is in normal flow: `.cover-parallax` is `position: fixed` and `.below-fold` is `position: absolute; top: 100vh`. That leaves `<body>` with almost no in-flow height, and a sticky element can only stick within its parent's box, so it would scroll away immediately and never re-pin.

Fixed positioning plus a passive rAF scroll listener is the portable answer. Confirmed working in Safari/iOS, Chrome, and Firefox against the mock.

### Visibility is decided before first paint

The notice sits above the nav, so the nav's position necessarily depends on whether the notice is showing. Any post-paint show or hide moves the masthead, which is a recorded layout shift. The only way to hit zero is to decide before the first paint, which requires a **synchronous** storage read in an `is:inline` script.

This rules out IndexedDB. It is async, so it can never answer before paint, and it is the wrong shape anyway for storing one string.

Measured cost of the synchronous read, Chromium, against the real mock:

| Case                                         | Cost                                         |
| -------------------------------------------- | -------------------------------------------- |
| cold first read, 10 fresh profiles           | below `performance.now()` resolution (< 5µs) |
| warm read, averaged over 1000                | ~0.0001ms (~100ns)                           |
| full inline script, dates + read             | median and p95 both below resolution         |
| storage disabled (`--disable-local-storage`) | below resolution, throws immediately         |

Roughly six orders of magnitude below a typical FCP. The cold read does not register because Chromium materializes the origin's store during navigation, off the critical path.

### Dates are parsed in the visitor's local time, not at build time

**Do not precompute epoch milliseconds in frontmatter.** CI builds run on a UTC clock, so `Date.parse('2026-08-01T00:00:00')` on the build machine yields UTC midnight, not Austin midnight, and shipping that fixed epoch would silently shift every window by the UTC offset.

Pass the raw `YYYY-MM-DD` strings into the inline script and parse them in the browser. Always append a time component, because a bare `YYYY-MM-DD` is parsed as **UTC** per spec while a date-time without an offset is parsed as **local**:

```js
var startMs = Date.parse(start + 'T00:00:00'); // local midnight, inclusive
var endMs = Date.parse(end + 'T23:59:59.999'); // through the end of that day, inclusive
```

The build-time check uses the same parse on the CI box. That is fine, because the build check only ever _prunes_, so a few hours of UTC skew costs at most one extra deploy carrying dead markup.

### Build time can only remove, runtime decides what shows

`.astro` frontmatter is ordinary TypeScript executed once in Node during `npm run build`, so a conditional render simply omits markup from the emitted `.html`.

- **Build time** drops a notice that is `null` or whose `end` has already passed. Provably dead forever, so shipping it would just mean every page load paints nothing and the script deletes it.
- **Build time never prunes a future-dated notice.** If it did, `start` would be meaningless, since the site only deploys on push and you would have to redeploy on the start date to turn it on. Instead the markup ships, the inline script removes it pre-paint every load, and on the start date the same edge-cached HTML begins showing it with no redeploy and no invalidation.

### Idle cost is small but not zero

When no notice is configured, no markup and no runtime work ship. Verified against a
`NOTICE = null` build: zero occurrences of `nav-stack`, `dojo-notice`, `data-notice-id`, or
the `Site notice` label in the emitted HTML, and `.masthead` keeps its own `position: fixed`.

Two claims in the original draft were wrong, corrected here from measurement:

- **The JS is not shipped.** Astro tree-shakes the component script when the component is
  imported but never rendered. No chunk in a null build mentions `initDojoNotice` or `akj:`.
- **The CSS is shipped**, at **2028 bytes** before gzip, not the ~1KB estimated for both
  together. Styles are emitted from the static import regardless of render. Cached across all
  pages, so it is paid once per deploy. Accepted.

### The close button ships `hidden`

A × that renders without a working handler is a dead control. So the button ships with the `hidden` attribute, and `dojo-notice.ts` attaches the click listener **first**, then unhides it. Consequences:

- JS disabled: notice shows, no ×, nothing dead. Link still works, stack still pins.
- Storage disabled or blocked: notice shows, no ×. A dismissal that cannot persist would reappear on the next page and is worse than no ×.
- Bundle fails to load: no ×.

### Zero-CLS state table

Every state resolves before first paint. Page content cannot move in any of them, because the stack is `position: fixed` with nothing in flow behind it. Only the masthead moves, and only inside the stack.

| State                                   | HTML ships        | Inline script does                       | Shift                                |
| --------------------------------------- | ----------------- | ---------------------------------------- | ------------------------------------ |
| No notice, or `end` passed before build | nothing           | n/a                                      | none                                 |
| Live, first visit                       | notice + hidden × | leaves it                                | none                                 |
| Live, previously dismissed              | notice + hidden × | removes pre-paint                        | none, never painted                  |
| Built early, `start` not yet reached    | notice + hidden × | removes pre-paint                        | none, never painted                  |
| Live, storage blocked                   | notice + hidden × | `getItem` throws, caught, × stays hidden | none                                 |
| Live, JS disabled                       | notice + hidden × | never runs                               | none                                 |
| User clicks ×                           | —                 | removes notice, masthead rises           | excluded, within 500ms of user input |

---

## Global constraints

- **One line of text, always.** `white-space: nowrap` + `text-overflow: ellipsis` as a backstop, plus an optional `shortText` swapped in below the 600px breakpoint. `shortText` must be authored to fit 320px, roughly 34 characters.
- **Existing breakpoints only:** 320/400/480/600/768/1024/1200/1500. The short/long copy swap uses 600px.
- **Existing palette only.** Olive band `#435b0d` on `#eae6db` text (6.14:1). Cream band `#eae6db` on `#2d3d09` text (9.45:1). Both pass AA for normal text.
- **Accessibility is a hard requirement.** Real `<a>` and `<button>`, keyboard operable, visible focus, axe clean with zero serious/critical.
- **No new dependencies.**
- **No `banner`/`promo`/`ad`/`notification` in any identifier.** See the naming decision above.

---

## File structure

```
src/
  lib/
    storage.ts                NEW shared, prefixed localStorage wrapper
    storage.test.ts           NEW Vitest
  data/
    dojo-notice.ts            NEW the notice content, dates, colour
  components/
    DojoNotice/
      DojoNotice.astro        NEW markup + is:inline pre-paint script
      dojo-notice.css         NEW band styles, colour variants, .top-stack
      dojo-notice.ts          NEW dismiss wiring + scroll-away
      dojo-notice.test.ts     NEW Vitest
  layouts/
    StandardLayout.astro      EDIT conditional .top-stack wrapper
tests/
  dojo-notice.spec.ts         NEW Playwright e2e + axe
vitest.config.ts              EDIT coverage include must reach src/lib
docs/
  CODE_STYLE.md               EDIT structure block gains src/lib
  BACKLOG.md                  EDIT entry added now, removed in Task 7
```

---

## Task 1: Shared localStorage module

**Files:** create `src/lib/storage.ts`, `src/lib/storage.test.ts`; edit `vitest.config.ts`, `docs/CODE_STYLE.md`

**Interfaces — Produces:** a `storage` object wrapping `window.localStorage` specifically,
never `sessionStorage` and with no fallback to one. It owns the `akj:` key prefix so callers
pass bare names, and never throws: every method degrades to `null` or `false` when storage is
unavailable, which is the case in Safari private mode and with cookies blocked.

| Method               | Returns          | Notes                                       |
| -------------------- | ---------------- | ------------------------------------------- |
| `key(name)`          | `string`         | `'dojo-notice'` becomes `'akj:dojo-notice'` |
| `isAvailable()`      | `boolean`        | probes with a write, see below              |
| `read(name)`         | `string \| null` | `null` when unset and when unavailable      |
| `write(name, value)` | `boolean`        | `false` if it threw                         |
| `remove(name)`       | `boolean`        | `false` if it threw                         |

The module exports a plain object literal and lets TypeScript infer the shape, so there is no
named type to keep in sync. The plan originally gave each method an injected `store?: Storage`
parameter for testability; dropped, since `vi.stubGlobal` covers it with no production surface.

- [ ] **Step 1: Write `src/lib/storage.test.ts` (failing).** Cover: `key()` applies the `akj:` prefix once; read/write/remove round trip against jsdom's `localStorage`; `isAvailable()` true under jsdom; an injected `Storage` whose methods throw makes `read` return `null`, `write` return `false`, `remove` return `false`, and `isAvailable` return `false`; and the property-access case, where `window.localStorage` itself throws (simulate with `Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); }, configurable: true })` and restore afterwards).

- [ ] **Step 2: Run it, verify it fails.** `npm run test:unit`

- [ ] **Step 3: Implement `src/lib/storage.ts`.**

  Exported as a `const` object so the call shape is identical at every import, per the named-export rule in CODE_STYLE. The file is `storage.ts` rather than `local-storage.ts`, so the export can be plainly named `storage` without shadowing `window.localStorage`. **Carry the docblock from the interface above onto the export**, since the filename alone does not say which web storage this wraps.

  **The critical detail:** `window.localStorage` throws on **property access** when storage is disabled, not only when a method is called. So the access itself must sit inside the `try`. It cannot be a default parameter value, which would throw before the function body is entered.

  ```ts
  const PREFIX = 'akj:';

  function resolve(store?: Storage): Storage | null {
    if (store) {
      return store;
    }
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }
  ```

  `isAvailable()` uses the MDN-style probe, a `setItem` of a throwaway key followed by `removeItem`, because Safari private mode has historically allowed reads while rejecting writes. A read-only probe would report a false positive there.

- [ ] **Step 4: Point Vitest coverage at `src/lib`.** `vitest.config.ts` currently has `coverage.include: ['src/components/**/*.ts']`, which would silently skip this module. Widen it to `['src/components/**/*.ts', 'src/lib/**/*.ts']`.

- [ ] **Step 5: Document `src/lib/` in `docs/CODE_STYLE.md`.** The Astro migration deliberately emptied `src/lib` because everything in it was single-use. It comes back now for a genuinely shared module. Add a line to the project structure block: `├─ lib/  shared modules used by more than one component`.

- [ ] **Step 6: Verify.** `npm run test:unit && npm run check` green.

- [ ] **Step 7: Commit.** `feat: add shared prefixed localStorage module`

---

## Task 2: Notice data module

**Files:** create `src/data/dojo-notice.ts`

**Interfaces — Produces:** `DojoNoticeData` type and the `DOJO_NOTICE` const.

- [ ] **Step 1: Create the module.**

  ```ts
  export interface DojoNoticeData {
    /** stable id, also the dismissal value in storage. change it to re-show a notice */
    id: string;
    text: string;
    /** used below 600px, falls back to `text`. keep to ~34 chars so it fits 320px */
    shortText?: string;
    href: string;
    /** YYYY-MM-DD, inclusive, visitor local time */
    start: string;
    /** YYYY-MM-DD, inclusive through end of day, visitor local time */
    end: string;
    /** defaults to 'olive' */
    color?: 'olive' | 'cream';
  }

  /** set to null when there is nothing to announce */
  export const DOJO_NOTICE: DojoNoticeData | null = {
    id: 'oita-fest-2026',
    text: 'Experience Iaijutsu at the 2026 Austin-Oita Festival',
    shortText: 'Iaijutsu at the Austin-Oita Festival',
    href: 'https://www.austinoita.org/2026-oita-japan-festival',
    start: '2026-08-01',
    end: '2026-10-18',
  };
  ```

  `color` mirrors `PanelSection`'s existing `color?: 'olive' | 'cream'` prop so the two read the same way. Note the olive here is the deeper `#435b0d` used by the nav's social bar, not `.info-panel-olive`'s `#aaa88f`.

  **Confirm the real festival dates with Brandon before committing.** The values above are placeholders taken from the design conversation.

- [ ] **Step 2: Verify.** `npm run check` green.

- [ ] **Step 3: Commit.** `feat: add dojo notice data module`

---

## Task 3: DojoNotice component, markup and styles

**Files:** create `src/components/DojoNotice/DojoNotice.astro`, `src/components/DojoNotice/dojo-notice.css`

**Interfaces — Consumes:** `{ notice: DojoNoticeData }`, always non-null. The layout owns the decision to render.

- [ ] **Step 1: Write `dojo-notice.css`.**

  Port the verified mock. Band height 34px, font-size `0.8125rem`; at 600px up, 38px and `0.875rem`. The link is centred with `justify-content: center`, the × is `position: absolute; right: 0` so it never shifts the text, and symmetric `padding: 0 40px` keeps the text centred whether or not the × is showing.

  ```css
  .top-stack {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 99;
  }

  /* the stack pins now, so the masthead stops pinning itself */
  .top-stack .masthead {
    position: relative;
  }
  ```

  Colour variants as `.dojo-notice-olive` / `.dojo-notice-cream`. Long copy hidden below 600px, short copy hidden at 600px and up. Link gets `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` as the one-line backstop.

  **Check the skip link against the band.** `.skip-link` is `position: fixed; top: 8px; z-index: 101`, so while focused it sits on top of the 34px notice. The z-index is correct and it stays reachable, but eyeball it, and if it reads badly, offset it to clear the band only when `.top-stack` is present.

- [ ] **Step 2: Write `DojoNotice.astro`.**

  ```astro
  ---
  import './dojo-notice.css';
  import { storage } from '@/lib/storage';
  import type { DojoNoticeData } from '@/data/dojo-notice';

  interface Props {
    notice: DojoNoticeData;
  }

  const { notice } = Astro.props;
  const color = notice.color ?? 'olive';
  const shortText = notice.shortText ?? notice.text;
  const storageKey = storage.key('dojo-notice');
  ---
  ```

  Markup: a `<div class="dojo-notice dojo-notice-{color}" data-notice-id={notice.id}>` holding an `<a class="dojo-notice-link">` with two spans (`-long`, `-short`) and a `<button class="dojo-notice-close" type="button" aria-label="Dismiss notice" hidden>` wrapping an inline SVG × with `aria-hidden="true"` and `focusable="false"`.

  The × ships `hidden`. Task 4 unhides it.

- [ ] **Step 3: Add the pre-paint `is:inline` script,** immediately after the markup so it executes during parse, before the browser paints.

  Pass `start`/`end` as **strings**, not epochs, per the local-time decision above. `storageKey` comes from `storage.key()` evaluated in frontmatter, so the `akj:` prefix has exactly one definition.

  ```astro
  <script
    is:inline
    define:vars={{ noticeId: notice.id, start: notice.start, end: notice.end, storageKey }}
  >
    (function () {
      var el = document.querySelector('.dojo-notice');
      if (!el) {
        return;
      }
      var now = Date.now();
      // date-only strings parse as UTC, date-time without offset parses as local
      var live = now >= Date.parse(start + 'T00:00:00') && now <= Date.parse(end + 'T23:59:59.999');
      if (live) {
        try {
          live = window.localStorage.getItem(storageKey) !== noticeId;
        } catch (e) {
          // storage blocked, keep showing, the close button stays hidden
        }
      }
      if (!live) {
        el.remove();
      }
    })();
  </script>
  ```

  The date check runs first and touches no I/O, so storage is only read during the weeks a notice is actually running.

- [ ] **Step 4: Verify.** `npm run check && npm run lint:style` green.

- [ ] **Step 5: Commit.** `feat: add dojo notice markup and styles`

---

## Task 4: Dismiss wiring and scroll-away

**Files:** create `src/components/DojoNotice/dojo-notice.ts`, `src/components/DojoNotice/dojo-notice.test.ts`; edit `DojoNotice.astro` to add the bundled `<script>`

**Interfaces — Produces:** `initDojoNotice(doc?: Document): void`, following the `initNav(doc = document)` pattern so tests can inject a jsdom document.

- [ ] **Step 1: Write `dojo-notice.test.ts` (failing).** Cover: returns without throwing when `.dojo-notice` is absent; clicking × writes the notice id under `dojo-notice` and removes the element; when `storage.isAvailable()` is false the × stays hidden and no listener is attached; scroll translates `.top-stack` by `-scrollY` and clamps at the notice height; and a failed write still removes the notice.

- [ ] **Step 2: Run it, verify it fails.** `npm run test:unit`

- [ ] **Step 3: Implement `dojo-notice.ts`.**

  **Order matters.** Attach the click listener before unhiding the ×, so the button can never exist without a working handler:

  ```ts
  if (storage.isAvailable()) {
    closeBtn.addEventListener('click', onDismiss);
    closeBtn.hidden = false;
  }
  ```

  Scroll-away, passive and rAF-throttled:

  ```ts
  const shift = Math.min(window.scrollY, noticeHeight);
  stack.style.transform = `translateY(${-shift}px)`;
  ```

  **Cache `noticeHeight`.** Reading `offsetHeight` inside the scroll handler forces a layout on every frame. Measure once at init and re-measure on `resize`, since the band is 34px below 600px and 38px above.

  `onDismiss` writes through `storage.write()`, ignores the boolean, removes the notice, clears the stack transform, and detaches the scroll listener. Failing to persist must not mean failing to dismiss.

- [ ] **Step 4: Add the bundled script to `DojoNotice.astro`,** below the inline one:

  ```astro
  <script>
    import { initDojoNotice } from './dojo-notice';
    initDojoNotice();
  </script>
  ```

- [ ] **Step 5: Verify.** `npm run test:unit && npm run check` green.

- [ ] **Step 6: Commit.** `feat: wire dojo notice dismissal and scroll-away`

---

## Task 5: Wire into StandardLayout

**Files:** edit `src/layouts/StandardLayout.astro`

- [ ] **Step 1: Add the build-time gate.**

  Assign to a narrowed local rather than a boolean, so TypeScript knows `notice` is non-null inside the branch:

  ```astro
  ---
  import { DOJO_NOTICE } from '@/data/dojo-notice';
  import DojoNotice from '@/components/DojoNotice/DojoNotice.astro';

  // frontmatter runs in Node at build time. this only ever prunes a notice whose
  // end date has already passed, it never decides that one should be visible.
  const includeNotice =
    DOJO_NOTICE !== null && Date.parse(`${DOJO_NOTICE.end}T23:59:59.999`) >= Date.now();
  const notice = includeNotice ? DOJO_NOTICE : null;
  ---
  ```

- [ ] **Step 2: Render the stack conditionally.** The skip link stays first in `<body>`. When there is no notice, render a bare `<Nav />` exactly as today, so the masthead keeps its own `position: fixed` and the current layout is untouched:

  ```astro
  {
    notice ? (
      <div class="top-stack">
        <DojoNotice notice={notice} />
        <Nav />
      </div>
    ) : (
      <Nav />
    )
  }
  ```

- [ ] **Step 3: Verify both branches.** Build once with `DOJO_NOTICE` set and confirm `dist/index.html` contains `class="top-stack"` and `data-notice-id`. Then temporarily set it to `null`, rebuild, and confirm neither string appears and the emitted `<body>` matches the current site. Restore the data afterwards.

- [ ] **Step 4: Verify.** `npm run check && npm run build` green.

- [ ] **Step 5: Commit.** `feat: render the dojo notice above the nav`

---

## Task 6: End-to-end and accessibility coverage

**Files:** create `tests/dojo-notice.spec.ts`

- [ ] **Step 1: Handle the "no notice configured" case first.** These specs need a notice in the build to assert against, and `DOJO_NOTICE` will be `null` for most of the year. Read the built page in `beforeAll` and `test.skip()` the whole file when `.dojo-notice` is absent, so the suite does not start failing the day the Oita notice expires. Add one spec that always runs and asserts the inverse: when no notice ships, `.top-stack` and `.dojo-notice` are both absent and `.masthead` is still `position: fixed`.

- [ ] **Step 2: Write the behavior specs.** Control the window with `await page.clock.install({ time: new Date('2026-09-01T12:00:00') })` (Playwright 1.62, installed). It **must** be called before `page.goto`, because the inline script reads `Date.now()` during parse and a clock installed afterwards is too late.

  - Inside the window, first visit: notice visible, × visible, link points at `href`.
  - Before `start`: notice absent from the DOM.
  - After `end`: notice absent from the DOM.
  - Dismissal persists: click ×, reload, notice absent. Assert `localStorage` holds `akj:dojo-notice`.
  - Changing the `id` re-shows a dismissed notice.
  - Scroll-away: scroll past the band height, assert the `.top-stack` transform clamps at `-noticeHeight` and the masthead sits at viewport top.
  - Storage blocked: assert the notice shows and the × stays hidden. Do **not** try to disable storage with a browser launch flag, which would need a separate project in `playwright.config.ts`. Use `page.addInitScript` to redefine the accessor so it throws, which runs before any page script and reproduces the real failure precisely:

    ```ts
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new Error('blocked');
        },
      });
    });
    ```

- [ ] **Step 3: Add a11y coverage.** Run axe on a page with the notice present, expecting zero serious/critical. Tab to the link and then the ×, asserting both take a visible `:focus-visible` ring.

  The existing global ring is two-tone by design and both variants are already covered: on the olive band the cream `box-shadow` band gives 6.14:1 against `#435b0d`, and on the cream band the `#2d3d09` outline gives 9.45:1 against `#eae6db`. WCAG 1.4.11 wants 3:1, so both pass, but assert it rather than assume it.

- [ ] **Step 4: Verify.** `npm test` green (unit then e2e).

- [ ] **Step 5: Commit.** `test: cover the dojo notice window, dismissal, and a11y`

---

## Task 7: Docs and screenshots

- [ ] **Step 1: Update `docs/BACKLOG.md`.** Remove the notice entry once this ships.

- [ ] **Step 2: Note the authoring workflow in `README.md`.** How to publish a notice: edit `src/data/dojo-notice.ts`, set `id`/`text`/`shortText`/`href`/`start`/`end`, commit, push. It appears and expires on its own dates with no redeploy. Set `DOJO_NOTICE` to `null` to remove it entirely. Change the `id` to re-show it to people who dismissed the previous one.

- [ ] **Step 3: PR screenshots.** Per CLAUDE.md, `npm run build && npm run preview`, then set `TARGETS` in `scripts/pr-screenshots.mjs` to home and schedule at mobile and desktop, plus a `focus` shot of the × to capture the ring. Reset `TARGETS` to `[]` afterwards.

- [ ] **Step 4: Move this plan** to `docs/plans/complete/`.

---

## Verification gate

Everything below must be green before the PR:

- `npm run check` — 0 type errors
- `npm run lint:style` — 0 stylelint errors
- `npm test` — unit then e2e, including the new specs
- `npm run build` — 6 pages, and a `DOJO_NOTICE = null` build emits no notice markup
- Lighthouse on the built preview with a notice live: **CLS still 0**, performance unchanged
- Manual cross-browser check of scroll-away in Safari/iOS, Chrome, Firefox (already verified against the mock, re-confirm on the real implementation)
