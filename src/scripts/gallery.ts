// Accessible scroll-snap slide gallery island. clampIndex is pure so index
// bounds are unit-testable; initGallery wires keyboard/bullets/IO/fullscreen.

/** Clamp a slide index into [0, len - 1]. */
export function clampIndex(i: number, len: number): number {
  return Math.max(0, Math.min(len - 1, i));
}

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

  const goTo = (i: number) => {
    const clamped = clampIndex(i, slides.length);
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
  bullets.forEach((b) => b.addEventListener('click', () => goTo(Number(b.dataset.index))));

  // keyboard support on the focusable track
  track.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        goTo(active + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        goTo(active - 1);
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
