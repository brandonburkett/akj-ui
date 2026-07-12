// Parallax hero island. Pure offset math is split out so it is unit-testable
// without a scroll environment; initParallax wires it to the real DOM.

/** Vertical background offset (px) for a given scroll position and speed. */
export function parallaxOffset(scrollY: number, speed: number): number {
  return -(scrollY / speed);
}

// `doc` param defaults to the ambient document so the island calls initParallax()
// while allowing injection. window/navigator stay global (browser-only island).
export function initParallax(doc: Document = document): void {
  const cover = doc.querySelector<HTMLElement>('.cover-parallax .cover-image');
  if (!cover) {
    return;
  }

  const speed = Number(cover.dataset.parallaxSpeed) || 5;

  // disable fixed attachment on touch devices (matches original UA sniff intent)
  if (/Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    cover.style.backgroundAttachment = 'scroll';
  }

  const onScroll = () => {
    const scrollY = window.pageYOffset || window.scrollY;
    cover.style.backgroundPosition = `50% ${parallaxOffset(scrollY, speed)}px`;
  };
  doc.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const cue = doc.querySelector<HTMLElement>('.cover-scroll-cue');
  const targetId = cue?.dataset.scrollTarget;
  if (cue && targetId) {
    cue.addEventListener('click', (event) => {
      // upgrade the native anchor jump to a smooth scroll (no-JS still gets the jump)
      event.preventDefault();
      doc
        .getElementById(targetId)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    });
  }
}
