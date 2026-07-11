# Gallery loop (wrap-around chevrons) — Design

**Date:** 2026-07-11
**Component:** `src/components/SlideGallery/` (Astro static site, vanilla-TS gallery)

## Problem

The gallery's prev/next chevrons are always visible, but `goTo()` clamps the index to `[0, last]`. So at the first slide the left chevron dead-ends, and at the last slide the right chevron dead-ends — they still show and accept clicks, they just do nothing. That reads as broken.

## Goal

Make the chevrons loop:

- On the **first** slide, **prev** goes to the **last** slide.
- On the **last** slide, **next** goes to the **first** slide.

"Nothing fancy" — no cloned slides, no infinite-scroll illusion. A plain index wrap.

## Behavior decision (approved)

The track is a horizontal scroll container with smooth scrolling. The **edge-wrap hop** (last→first or first→last) scrolls **instant** (`behavior: 'instant'`) so it snaps cleanly to the far edge instead of animating a long sweep across every slide. Every **other** hop stays **smooth**, exactly as today.

> Use `'instant'`, not `'auto'`. `.sg-track` has `scroll-behavior: smooth` in CSS, and `scrollIntoView({behavior: 'auto'})` defers to that CSS value — so `'auto'` would animate the sweep. `'instant'` forces a non-animated jump regardless of CSS. (`ScrollBehavior` in TS 5.6 lib.dom includes `'instant'`; if `npm run check` rejects it, that's a signal to re-check, not to cast it away.)

## Scope

- Chevron clicks loop.
- Left/right **arrow keys** loop identically (they share the same step logic — keeping them consistent).
- **Unchanged:** bullets, Home, End (all pass in-range indices, so they never wrap), all ARIA, the live-region announcement, markup, and CSS.

## Design

All changes are in `src/components/SlideGallery/gallery.ts`. No `.astro`/CSS change.

1. **Add a pure `wrapIndex` helper** next to `clampIndex` (export it for unit testing):
   ```ts
   /** Wrap a slide index into [0, len - 1] (modulo, handles negatives). */
   export function wrapIndex(i: number, len: number): number {
     return ((i % len) + len) % len;
   }
   ```
   `clampIndex` stays — `setActive()` still uses it to defensively guard the IntersectionObserver's `indexOf` result (which can be `-1`). The two helpers have distinct roles: `clampIndex` guards observed state, `wrapIndex` drives navigation.

2. **`goTo` takes an explicit scroll behavior and wraps the target:**
   ```ts
   const goTo = (i: number, behavior: ScrollBehavior = 'smooth') => {
     const target = wrapIndex(i, slides.length);
     slides[target].scrollIntoView({ behavior, block: 'nearest', inline: 'center' });
     setActive(target);
   };
   ```

3. **prev/next choose instant on the edge-wrap, smooth otherwise:**
   ```ts
   prev?.addEventListener('click', () =>
     goTo(active - 1, active === 0 ? 'instant' : 'smooth'));
   next?.addEventListener('click', () =>
     goTo(active + 1, active === slides.length - 1 ? 'instant' : 'smooth'));
   ```

4. **Arrow keys mirror prev/next** (same instant-on-edge rule). `Home`/`End` keep calling `goTo(0)` / `goTo(slides.length - 1)` with the default smooth behavior. Bullets keep calling `goTo(Number(index))` with default smooth.

## Testing

**Unit — `src/components/SlideGallery/gallery.test.ts`** (jsdom, 3 slides, `scrollIntoView` stubbed with a spy):
- Keep the existing `clampIndex` tests.
- Add `wrapIndex` tests: `wrapIndex(-1, 3) === 2`, `wrapIndex(3, 3) === 0`, `wrapIndex(1, 3) === 1`, `wrapIndex(0, 3) === 0`.
- Replace the "next/prev … clamp at the edges" test with a **wrap** test: from the last slide, `next` → index 0; from the first slide, `prev` → index 2. Update the ArrowLeft/End test so ArrowLeft from index 0 wraps to 2 (and ArrowRight from the last wraps to 0).
- Add a **behavior** assertion: inspect the stubbed `scrollIntoView` mock's call args — an edge-wrap hop passes `behavior: 'instant'`, an adjacent hop passes `behavior: 'smooth'`.

**e2e — `tests/gallery.spec.ts`** (real browser, /iaijutsu, 14 slides):
- Add a wrap test: with `aria-current` at `data-index="0"`, click `.sg-prev` → active bullet's `data-index` becomes the last index (`13`). Optionally also next-from-last → `0`.

## Non-goals / out of scope

- No preloading of neighbor images. Lazy loading stays as-is; the instant-snapped far slide may pop in a beat after the wrap (acceptable for this gallery).
- No `slides.length === 0` guard (a pre-existing Task 7 nit, unrelated to looping; every call site supplies images).
- No cloned-slide "seamless infinite" carousel.

## Verification gate

`npm run check` (0 errors), `npm run build` (6 pages), `npm test` (unit + e2e green, including the new wrap tests). Manual: on /iaijutsu, prev from slide 1 snaps to slide 14, next from slide 14 snaps to slide 1, and adjacent moves still animate smoothly.
