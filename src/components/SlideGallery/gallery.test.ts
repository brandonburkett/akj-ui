import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clampIndex, initGallery, wrapIndex } from './gallery';

const SLIDE_W = 300;

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
const slides = () => Array.from(document.querySelectorAll<HTMLElement>('.sg-slide'));
const next = () => document.querySelector<HTMLButtonElement>('.sg-next')!;
const prev = () => document.querySelector<HTMLButtonElement>('.sg-prev')!;

// jsdom does no layout, so give the track a real width and a settable scrollLeft.
function stubTrackGeometry(el: HTMLElement) {
  let scrollLeft = 0;
  Object.defineProperty(el, 'clientWidth', { configurable: true, value: SLIDE_W });
  Object.defineProperty(el, 'scrollLeft', {
    configurable: true,
    get: () => scrollLeft,
    set: (v: number) => {
      scrollLeft = v;
    },
  });
}

/** Move the track and fire the scroll event the browser would, without settling. */
function scrollToOffset(offset: number) {
  track().scrollLeft = offset;
  track().dispatchEvent(new Event('scroll'));
}

const scrollToSlide = (i: number) => scrollToOffset(i * SLIDE_W);

/** Let the settle debounce elapse, committing the resting position. */
const settle = () => vi.advanceTimersByTime(200);

function setup({ scrollend = false } = {}) {
  document.body.innerHTML = GALLERY_HTML;
  const el = document.querySelector<HTMLElement>('.sg-track')!;
  stubTrackGeometry(el);
  if (scrollend) {
    // opt the feature-detect in; jsdom has no scrollend
    Object.defineProperty(window, 'onscrollend', {
      configurable: true,
      value: null,
      writable: true,
    });
  }
  initGallery(document);
}

beforeEach(() => {
  vi.useFakeTimers();
  // a real scroll moves the track, so mirror that or nothing would ever settle
  Element.prototype.scrollIntoView = vi.fn(function (this: Element) {
    const i = slides().indexOf(this as HTMLElement);
    if (i >= 0) {
      scrollToSlide(i);
    }
  });
  setup();
});

afterEach(() => {
  vi.useRealTimers();
  delete (window as { onscrollend?: unknown }).onscrollend;
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
    next().click();
    next().click();
    expect(activeIndex()).toBe('2');
    next().click(); // wrap last -> first
    expect(activeIndex()).toBe('0');
    prev().click(); // wrap first -> last
    expect(activeIndex()).toBe('2');
  });

  it('edge-wrap hops scroll instant, adjacent hops scroll smooth', () => {
    const scrollSpy = vi.mocked(Element.prototype.scrollIntoView);
    next().click(); // 0 -> 1 adjacent
    expect(scrollSpy).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: 'smooth' }));
    next().click(); // 1 -> 2 adjacent
    next().click(); // 2 -> 0 wrap
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
      next().click(); // 0 -> 1 adjacent; would normally be 'smooth'
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

// Regression: `active` used to be written by an IntersectionObserver whose
// `isIntersecting` is true for ANY overlap, so a slide leaving the viewport could
// claim the active index and the next arrow click would skip a slide.
describe('slide tracking follows the resting scroll position', () => {
  it('a swipe commits the slide it lands on', () => {
    scrollToSlide(1);
    settle();
    expect(activeIndex()).toBe('1');
    expect(status()).toBe('Slide 2 of 3');
  });

  it('ignores positions the scroll only passes over', () => {
    scrollToSlide(2);
    scrollToOffset(SLIDE_W * 1.4); // mid-flight, never at rest here
    scrollToSlide(1);
    settle();
    expect(activeIndex()).toBe('1');
  });

  it('a backward swipe leaves active on the slide it lands on', () => {
    scrollToSlide(2);
    settle();
    scrollToSlide(1);
    settle();
    expect(activeIndex()).toBe('1');
  });

  it('next after a backward swipe advances exactly one slide', () => {
    scrollToSlide(2);
    settle();
    scrollToSlide(1);
    settle();
    next().click();
    expect(activeIndex()).toBe('2');
  });

  it('momentum overshoot that snaps back commits the resting slide', () => {
    scrollToOffset(SLIDE_W * 1.8); // flung past slide 1 toward 2
    scrollToSlide(1); // snapped back
    settle();
    expect(activeIndex()).toBe('1');
  });

  it('rapid next clicks advance one slide each', () => {
    const scrollSpy = vi.mocked(Element.prototype.scrollIntoView);
    scrollSpy.mockImplementation(() => {}); // freeze the track mid-flight
    next().click();
    next().click();
    expect(activeIndex()).toBe('2');
  });

  it('a click during an unsettled swipe steps from the swiped-to slide', () => {
    scrollToSlide(1); // snapped, but the settle debounce has not fired yet
    next().click();
    expect(activeIndex()).toBe('2');
  });

  it('rubber-banding past the last slide does not wrap the next step', () => {
    scrollToOffset(SLIDE_W * 2.4); // iOS overscroll past the end
    settle();
    expect(activeIndex()).toBe('2');
  });

  it('commits immediately on scrollend where it is supported', () => {
    setup({ scrollend: true });
    scrollToSlide(1);
    track().dispatchEvent(new Event('scrollend'));
    expect(activeIndex()).toBe('1'); // no timer advance
  });
});

// Regression: swipes updated the nav only on the settle debounce, so on iOS,
// which lacks scrollend, the bullets lagged the slide until the fling stopped.
describe('a swipe moves the nav live, before settling', () => {
  it('updates the bullet as the swipe crosses into the next slide', () => {
    scrollToSlide(1);
    expect(activeIndex()).toBe('1'); // no settle()
    expect(status()).toBe('Slide 2 of 3');
  });

  it('follows each swipe of a rapid multi-swipe', () => {
    scrollToSlide(1);
    expect(activeIndex()).toBe('1');
    scrollToSlide(2);
    expect(activeIndex()).toBe('2');
  });

  it('does not flip before the halfway point', () => {
    scrollToOffset(SLIDE_W * 0.4);
    expect(activeIndex()).toBe('0');
  });

  it('a click animation keeps the nav on its target while passing over slides', () => {
    const scrollSpy = vi.mocked(Element.prototype.scrollIntoView);
    scrollSpy.mockImplementation(() => {}); // freeze the track, replay the animation by hand
    next().click();
    next().click();
    scrollToOffset(SLIDE_W);
    expect(activeIndex()).toBe('2');
    scrollToSlide(2);
    settle();
    expect(activeIndex()).toBe('2');
  });
});
