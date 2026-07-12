import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { initParallax, parallaxOffset } from './parallax';

describe('parallaxOffset', () => {
  it('scales scroll by speed and inverts sign', () => {
    expect(parallaxOffset(1000, 5)).toBe(-200);
  });

  it('is zero at the top', () => {
    // -(0/5) is negative zero; assert via === so it compares equal to 0
    expect(parallaxOffset(0, 5) === 0).toBe(true);
  });
});

const PARALLAX_HTML = `
  <section class="cover-parallax">
    <div class="cover-image" data-parallax-speed="5">
      <div class="cover-scroll-cue" data-scroll-target="target">
        <a class="cover-scroll-btn" href="#target">v</a>
      </div>
    </div>
  </section>
  <div id="target"></div>
`;

const cover = () => document.querySelector<HTMLElement>('.cover-image')!;

describe('initParallax', () => {
  beforeAll(() => {
    // jsdom lacks scrollIntoView; the scroll cue calls it on click.
    Element.prototype.scrollIntoView = vi.fn();
  });

  beforeEach(() => {
    document.body.innerHTML = PARALLAX_HTML;
  });

  afterEach(() => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
  });

  it('sets the initial background position from scroll offset', () => {
    initParallax(document);
    expect(cover().style.backgroundPosition).toBe('50% 0px');
  });

  it('updates the background position on scroll using parallaxOffset', () => {
    initParallax(document);
    // pageYOffset stays 0 in jsdom, so `pageYOffset || scrollY` reads scrollY
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 1000 });
    document.dispatchEvent(new Event('scroll'));
    expect(cover().style.backgroundPosition).toBe('50% -200px');
  });

  it('scroll cue upgrades the anchor jump to a smooth scroll', () => {
    initParallax(document);
    const target = document.getElementById('target')!;
    const spy = vi.spyOn(target, 'scrollIntoView');
    const evt = new MouseEvent('click', { bubbles: true, cancelable: true });
    document.querySelector('.cover-scroll-cue')!.dispatchEvent(evt);
    expect(evt.defaultPrevented).toBe(true);
    expect(spy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start', inline: 'nearest' });
  });
});
