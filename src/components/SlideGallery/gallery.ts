// Accessible scroll-snap slide gallery island. clampIndex/wrapIndex are pure so
// bounds + loop wrap are unit-testable; initGallery wires keyboard/bullets/IO/fullscreen.

/** Clamp a slide index into [0, len - 1]. */
export function clampIndex(i: number, len: number): number {
  return Math.max(0, Math.min(len - 1, i));
}

/** Wrap a slide index into [0, len - 1] (modulo, handles negatives). */
export function wrapIndex(i: number, len: number): number {
  return ((i % len) + len) % len;
}

// matchMedia is absent in jsdom (unit tests), so optional-chain to `false` there.
const prefersReducedMotion = (): boolean =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

// `doc` param defaults to the ambient document so the island calls initGallery()
// while tests inject a jsdom document (with IntersectionObserver stubbed).
export function initGallery(doc: Document = document): void {
  const root = doc.querySelector<HTMLElement>('.slide-gallery-images');
  const track = root?.querySelector<HTMLElement>('.sg-track');
  if (!root || !track) return;

  const slides = Array.from(track.querySelectorAll<HTMLElement>('.sg-slide'));
  const bullets = Array.from(root.querySelectorAll<HTMLButtonElement>('.sg-bullet'));
  const prev = root.querySelector<HTMLButtonElement>('.sg-prev');
  const next = root.querySelector<HTMLButtonElement>('.sg-next');
  const fs = root.querySelector<HTMLButtonElement>('.sg-fullscreen');
  const status = root.querySelector<HTMLElement>('.sg-status');
  let active = 0;

  const setActive = (i: number) => {
    active = clampIndex(i, slides.length);
    bullets.forEach((b, bi) => b.setAttribute('aria-current', String(bi === active)));
    if (status) status.textContent = `Slide ${active + 1} of ${slides.length}`;
  };

  // 'instant' (not 'auto') so an edge-wrap snaps instead of sweeping every slide;
  // 'auto' would inherit the track's CSS scroll-behavior:smooth and animate.
  const goTo = (i: number, behavior: ScrollBehavior = 'smooth') => {
    const target = wrapIndex(i, slides.length);
    const effective = prefersReducedMotion() ? 'instant' : behavior;
    slides[target].scrollIntoView({ behavior: effective, block: 'nearest', inline: 'center' });
    setActive(target);
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

  prev?.addEventListener('click', () => goTo(active - 1, active === 0 ? 'instant' : 'smooth'));
  next?.addEventListener('click', () =>
    goTo(active + 1, active === slides.length - 1 ? 'instant' : 'smooth'),
  );
  bullets.forEach((b) => b.addEventListener('click', () => goTo(Number(b.dataset.index))));

  // keyboard support on the focusable track
  track.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        goTo(active + 1, active === slides.length - 1 ? 'instant' : 'smooth');
        break;
      case 'ArrowLeft':
        e.preventDefault();
        goTo(active - 1, active === 0 ? 'instant' : 'smooth');
        break;
      case 'Home':
        e.preventDefault();
        goTo(0);
        break;
      case 'End':
        e.preventDefault();
        goTo(slides.length - 1);
        break;
    }
  });

  // native fullscreen (Escape exits automatically); no translateZ hack needed
  fs?.addEventListener('click', async () => {
    if (doc.fullscreenElement) await doc.exitFullscreen();
    else await root.requestFullscreen().catch(() => {});
  });
  doc.addEventListener('fullscreenchange', () => {
    const on = doc.fullscreenElement === root;
    fs?.setAttribute('aria-label', on ? 'Exit fullscreen' : 'View gallery fullscreen');
  });
}
