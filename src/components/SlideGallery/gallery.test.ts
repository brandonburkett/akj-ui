import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { clampIndex, initGallery, wrapIndex } from './gallery';

const GALLERY_HTML = `
  <section class="slide-gallery-group">
    <div class="slide-gallery-images">
      <div class="sg-track" tabindex="0">
        <div class="sg-slide">a</div>
        <div class="sg-slide">b</div>
        <div class="sg-slide">c</div>
      </div>
      <p class="sg-status">Slide 1 of 3</p>
      <button class="sg-nav sg-prev" type="button"></button>
      <button class="sg-nav sg-next" type="button"></button>
      <div class="sg-bullets">
        <button class="sg-bullet" data-index="0" aria-current="true"></button>
        <button class="sg-bullet" data-index="1" aria-current="false"></button>
        <button class="sg-bullet" data-index="2" aria-current="false"></button>
      </div>
      <button class="sg-fullscreen" type="button"></button>
    </div>
  </section>
`;

const activeIndex = () =>
  document.querySelector('.sg-bullet[aria-current="true"]')?.getAttribute('data-index');
const status = () => document.querySelector('.sg-status')!.textContent;
const track = () => document.querySelector<HTMLElement>('.sg-track')!;

beforeAll(() => {
  // jsdom implements neither; stub so goTo() can call scrollIntoView and init can
  // construct an IntersectionObserver (kept a no-op — IO tracking is e2e's job).
  Element.prototype.scrollIntoView = vi.fn();
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

beforeEach(() => {
  document.body.innerHTML = GALLERY_HTML;
  initGallery(document);
});

describe('clampIndex', () => {
  it('clamps below zero to zero', () => {
    expect(clampIndex(-1, 3)).toBe(0);
  });
  it('clamps above the last index', () => {
    expect(clampIndex(5, 3)).toBe(2);
  });
  it('passes an in-range index through', () => {
    expect(clampIndex(1, 3)).toBe(1);
  });
});

describe('wrapIndex', () => {
  it('wraps below zero to the last index', () => {
    expect(wrapIndex(-1, 3)).toBe(2);
  });
  it('wraps past the last index back to zero', () => {
    expect(wrapIndex(3, 3)).toBe(0);
  });
  it('passes an in-range index through', () => {
    expect(wrapIndex(1, 3)).toBe(1);
  });
});

describe('initGallery', () => {
  it('ArrowRight advances the active bullet and updates the status', () => {
    track().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(activeIndex()).toBe('1');
    expect(status()).toBe('Slide 2 of 3');
  });

  it('Home returns to the first slide', () => {
    track().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(activeIndex()).toBe('1');
    track().dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    expect(activeIndex()).toBe('0');
    expect(status()).toBe('Slide 1 of 3');
  });

  it('clicking a bullet moves aria-current', () => {
    document.querySelectorAll<HTMLButtonElement>('.sg-bullet')[2].click();
    expect(activeIndex()).toBe('2');
    expect(status()).toBe('Slide 3 of 3');
  });

  it('next/prev buttons wrap around at the edges', () => {
    const next = document.querySelector<HTMLButtonElement>('.sg-next')!;
    const prev = document.querySelector<HTMLButtonElement>('.sg-prev')!;
    next.click();
    next.click();
    expect(activeIndex()).toBe('2');
    next.click(); // wrap last -> first
    expect(activeIndex()).toBe('0');
    prev.click(); // wrap first -> last
    expect(activeIndex()).toBe('2');
  });

  it('edge-wrap hops scroll instant, adjacent hops scroll smooth', () => {
    const scrollSpy = vi.mocked(Element.prototype.scrollIntoView);
    const next = document.querySelector<HTMLButtonElement>('.sg-next')!;
    next.click(); // 0 -> 1 adjacent
    expect(scrollSpy).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: 'smooth' }));
    next.click(); // 1 -> 2 adjacent
    next.click(); // 2 -> 0 wrap
    expect(scrollSpy).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: 'instant' }));
    expect(activeIndex()).toBe('0');
  });

  it('ArrowLeft/ArrowRight wrap at the edges; End jumps to the last', () => {
    track().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' })); // 0 -> 2 wrap
    expect(activeIndex()).toBe('2');
    track().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })); // 2 -> 0 wrap
    expect(activeIndex()).toBe('0');
    track().dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    expect(activeIndex()).toBe('2');
  });

  it('forces instant scroll for reduced-motion users, even on an adjacent hop', () => {
    const originalMatchMedia = window.matchMedia;
    try {
      window.matchMedia = vi
        .fn()
        .mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
      const scrollSpy = vi.mocked(Element.prototype.scrollIntoView);
      const next = document.querySelector<HTMLButtonElement>('.sg-next')!;
      next.click(); // 0 -> 1 adjacent; would normally be 'smooth'
      expect(scrollSpy).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: 'instant' }));
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it('hides the fullscreen button when the Fullscreen API is unavailable', () => {
    // jsdom has no Element.requestFullscreen, matching iPhone Safari
    expect(document.querySelector<HTMLButtonElement>('.sg-fullscreen')!.hidden).toBe(true);
  });

  it('keeps the fullscreen button when the Fullscreen API is available', () => {
    document.body.innerHTML = GALLERY_HTML;
    const root = document.querySelector<HTMLElement>('.slide-gallery-images')!;
    root.requestFullscreen = () => Promise.resolve();
    initGallery(document);
    expect(document.querySelector<HTMLButtonElement>('.sg-fullscreen')!.hidden).toBe(false);
  });
});
