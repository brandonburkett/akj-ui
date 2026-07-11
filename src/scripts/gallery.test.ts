import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { clampIndex, initGallery } from './gallery';

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

  it('next/prev buttons step the active slide and clamp at the edges', () => {
    const next = document.querySelector<HTMLButtonElement>('.sg-next')!;
    const prev = document.querySelector<HTMLButtonElement>('.sg-prev')!;
    next.click();
    expect(activeIndex()).toBe('1');
    next.click();
    next.click(); // clamped at the last slide
    expect(activeIndex()).toBe('2');
    prev.click();
    expect(activeIndex()).toBe('1');
  });

  it('ArrowLeft and End keys navigate and clamp', () => {
    track().dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    expect(activeIndex()).toBe('2');
    track().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(activeIndex()).toBe('1');
  });
});
