// Accessible scroll-snap slide gallery island. clampIndex/wrapIndex are pure so
// bounds + loop wrap are unit-testable; initGallery wires keyboard/bullets/scroll/fullscreen.

// Debounce before a resting scroll position counts as settled. Long enough to
// outlast snap-back after a flung swipe, short enough that the status announces promptly.
const SETTLE_MS = 120;

/** Clamp a slide index into [0, len - 1]. */
export function clampIndex(i: number, len: number): number {
  return Math.max(0, Math.min(len - 1, i));
}

/** Wrap a slide index into [0, len - 1] (handles negative indexes). */
export function wrapIndex(i: number, len: number): number {
  const remainder = i % len;
  return remainder < 0 ? remainder + len : remainder;
}

// matchMedia is absent in jsdom (unit tests), so optional-chain to `false` there.
const prefersReducedMotion = (): boolean =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

// `doc` param defaults to the ambient document so the island calls initGallery()
// while tests inject a jsdom document.
export function initGallery(doc: Document = document): void {
  const root = doc.querySelector<HTMLElement>('.slide-gallery-images');
  const track = root?.querySelector<HTMLElement>('.sg-track');
  if (!root || !track) {
    return;
  }

  const slides = Array.from(track.querySelectorAll<HTMLElement>('.sg-slide'));
  const bullets = Array.from(root.querySelectorAll<HTMLButtonElement>('.sg-bullet'));
  const prev = root.querySelector<HTMLButtonElement>('.sg-prev');
  const next = root.querySelector<HTMLButtonElement>('.sg-next');
  const fs = root.querySelector<HTMLButtonElement>('.sg-fullscreen');
  const status = root.querySelector<HTMLElement>('.sg-status');
  let active = 0;
  // slide we are scrolling toward, so a second click steps from the destination
  // rather than from whatever the track happens to be passing over
  let pending: number | null = null;
  let settleTimer = 0;

  const setActive = (i: number) => {
    active = clampIndex(i, slides.length);
    bullets.forEach((bullet, i) => bullet.setAttribute('aria-current', String(i === active)));
    if (status) {
      status.textContent = `Slide ${active + 1} of ${slides.length}`;
    }
  };

  // slides are flex 0 0 100% with no gap, so a resting scrollLeft is an exact multiple
  const indexFromScroll = (): number => {
    const width = track.clientWidth;
    if (width === 0) {
      return active;
    }
    return clampIndex(Math.round(track.scrollLeft / width), slides.length);
  };

  // 'instant' (not 'auto') so an edge-wrap snaps instead of sweeping every slide;
  // 'auto' would inherit the track's CSS scroll-behavior:smooth and animate.
  const goTo = (i: number, behavior: ScrollBehavior = 'smooth') => {
    const target = wrapIndex(i, slides.length);
    const effective = prefersReducedMotion() ? 'instant' : behavior;
    pending = target;
    slides[target].scrollIntoView({ behavior: effective, block: 'nearest', inline: 'center' });
    setActive(target);
  };

  const step = (delta: number) => {
    const from = pending ?? indexFromScroll();
    const edge = delta > 0 ? slides.length - 1 : 0;
    goTo(from + delta, from === edge ? 'instant' : 'smooth');
  };

  // Only a resting position is authoritative. Mid-scroll the track sits over slides
  // it is not landing on, and a flung swipe can overshoot and snap back.
  const commit = () => {
    window.clearTimeout(settleTimer);
    pending = null;
    setActive(indexFromScroll());
  };

  track.addEventListener(
    'scroll',
    () => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(commit, SETTLE_MS);
    },
    { passive: true },
  );

  // lands the update without waiting out the debounce, Safari only shipped it in 26.2
  if ('onscrollend' in window) {
    track.addEventListener('scrollend', commit);
  }

  prev?.addEventListener('click', () => step(-1));
  next?.addEventListener('click', () => step(1));
  bullets.forEach((bullet) =>
    bullet.addEventListener('click', () => goTo(Number(bullet.dataset.index))),
  );

  // keyboard support on the focusable track
  track.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        step(1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        step(-1);
        break;
      case 'Home':
        event.preventDefault();
        goTo(0);
        break;
      case 'End':
        event.preventDefault();
        goTo(slides.length - 1);
        break;
    }
  });

  // Fullscreen API is unavailable for elements on iPhone Safari, so hide the dead control there.
  if (fs && typeof root.requestFullscreen !== 'function') {
    fs.hidden = true;
    return;
  }
  fs?.addEventListener('click', async () => {
    if (doc.fullscreenElement) {
      await doc.exitFullscreen();
      return;
    }
    await root.requestFullscreen().catch(() => {});
  });
  doc.addEventListener('fullscreenchange', () => {
    const on = doc.fullscreenElement === root;
    fs?.setAttribute('aria-label', on ? 'Exit fullscreen' : 'View gallery fullscreen');
  });
}
