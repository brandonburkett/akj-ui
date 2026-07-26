import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initDojoNotice, isWithinWindow } from './dojo-notice';
import { storage } from '@/lib/storage';

const NOTICE_ID = '2026-oita-fest';
const NOTICE_HEIGHT = 34;
const START = '2026-07-25';
const END = '2026-08-30';
const INSIDE = Date.parse('2026-08-01T12:00:00');

const html = (start = START, end = END) => `
  <div class="nav-stack">
    <div class="dojo-notice" data-notice-id="${NOTICE_ID}" data-start="${start}" data-end="${end}">
      <a class="dojo-notice-link" href="https://example.test">Notice</a>
      <button class="dojo-notice-close" type="button" aria-label="Dismiss notice" hidden></button>
    </div>
    <header class="masthead"></header>
  </div>
`;

const notice = () => document.querySelector<HTMLElement>('.dojo-notice');
const stack = () => document.querySelector<HTMLElement>('.nav-stack')!;
const closeBtn = () => document.querySelector<HTMLButtonElement>('.dojo-notice-close')!;

// jsdom reports 0 for every offset, so the height the scroll handler clamps to has
// to be faked before init measures it.
function stubNoticeHeight(px: number): void {
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get(): number {
      return this.classList.contains('dojo-notice') ? px : 0;
    },
  });
}

function scrollTo(y: number): void {
  window.scrollY = y;
  document.dispatchEvent(new Event('scroll'));
}

/** Freezes the clock inside the notice window unless a test says otherwise. */
function atTime(ms: number): void {
  vi.spyOn(Date, 'now').mockReturnValue(ms);
}

beforeEach(() => {
  document.body.innerHTML = html();
  stubNoticeHeight(NOTICE_HEIGHT);
  atTime(INSIDE);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 0;
  });
});

// Top level, so it runs after every it in the file, including inside each describe.
// restoreAllMocks matters: spies survive unstubAllGlobals and would leak between blocks.
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  window.localStorage.clear();
  document.body.innerHTML = '';
});

describe('isWithinWindow', () => {
  it('includes the whole start day, from local midnight', () => {
    expect(isWithinWindow(START, END, Date.parse('2026-07-25T00:00:00'))).toBe(true);
  });

  it('includes the whole end day, through local end of day', () => {
    expect(isWithinWindow(START, END, Date.parse('2026-08-30T23:59:59'))).toBe(true);
  });

  it('excludes the moment before the start day', () => {
    expect(isWithinWindow(START, END, Date.parse('2026-07-24T23:59:59'))).toBe(false);
  });

  it('excludes the day after the end day', () => {
    expect(isWithinWindow(START, END, Date.parse('2026-08-31T00:00:00'))).toBe(false);
  });
});

describe('when the notice is absent', () => {
  it('returns without throwing', () => {
    document.body.innerHTML = '';
    expect(() => initDojoNotice(document)).not.toThrow();
  });
});

describe('parking, the state CSS already renders', () => {
  // A no-op is the whole point: touching layout here would score a shift even though
  // the transform keeps the masthead visually still.
  const expectParked = () => {
    expect(notice()).not.toBeNull();
    expect(stack().classList.contains('nav-stack-shown')).toBe(false);
    expect(stack().style.transform).toBe('');
  };

  it('parks before the window opens', () => {
    atTime(Date.parse('2026-07-01T12:00:00'));
    initDojoNotice(document);
    expectParked();
  });

  it('parks after the window closes', () => {
    atTime(Date.parse('2026-09-15T12:00:00'));
    initDojoNotice(document);
    expectParked();
  });

  it('parks when this notice was already dismissed', () => {
    storage.write('dojo-notice', NOTICE_ID);
    initDojoNotice(document);
    expectParked();
  });

  it('still shows when a different notice was dismissed', () => {
    storage.write('dojo-notice', 'some-older-notice');
    initDojoNotice(document);
    expect(stack().classList.contains('nav-stack-shown')).toBe(true);
  });
});

describe('revealing', () => {
  it('drops the parked offset so the notice slides in', () => {
    initDojoNotice(document);
    expect(stack().style.transform).toBe('translateY(0px)');
  });

  it('makes the notice visible and focusable', () => {
    initDojoNotice(document);
    expect(stack().classList.contains('nav-stack-shown')).toBe(true);
  });

  it('adds the one-shot transition class', () => {
    initDojoNotice(document);
    expect(stack().classList.contains('nav-stack-reveal')).toBe(true);
  });

  it('removes the transition class so scrolling stays instant', () => {
    vi.useFakeTimers();
    initDojoNotice(document);
    vi.runAllTimers();
    expect(stack().classList.contains('nav-stack-reveal')).toBe(false);
    vi.useRealTimers();
  });
});

describe('the close button', () => {
  it('is revealed once storage is available', () => {
    initDojoNotice(document);
    expect(closeBtn().hidden).toBe(false);
  });

  it('stays hidden when storage is unavailable, rather than becoming a dead control', () => {
    vi.spyOn(storage, 'isAvailable').mockReturnValue(false);
    initDojoNotice(document);
    expect(closeBtn().hidden).toBe(true);
  });

  it('does nothing on click when storage is unavailable', () => {
    vi.spyOn(storage, 'isAvailable').mockReturnValue(false);
    initDojoNotice(document);
    closeBtn().click();
    expect(stack().classList.contains('nav-stack-shown')).toBe(true);
  });
});

describe('dismissing', () => {
  it('hides the notice and persists the id', () => {
    initDojoNotice(document);
    closeBtn().click();
    expect(stack().classList.contains('nav-stack-shown')).toBe(false);
    expect(storage.read('dojo-notice')).toBe(NOTICE_ID);
  });

  it('still hides the notice when the write fails', () => {
    initDojoNotice(document);
    vi.spyOn(storage, 'write').mockReturnValue(false);
    closeBtn().click();
    expect(stack().classList.contains('nav-stack-shown')).toBe(false);
  });

  it('leaves the notice in the DOM, so no layout moves', () => {
    initDojoNotice(document);
    closeBtn().click();
    expect(notice()).not.toBeNull();
  });

  it('clears the inline transform back to the CSS parked offset', () => {
    initDojoNotice(document);
    scrollTo(20);
    closeBtn().click();
    expect(stack().style.transform).toBe('');
  });

  it('stops translating the stack after dismissal', () => {
    initDojoNotice(document);
    closeBtn().click();
    scrollTo(20);
    expect(stack().style.transform).toBe('');
  });
});

describe('scroll-away', () => {
  beforeEach(() => {
    initDojoNotice(document);
  });

  it('translates the stack by the scroll offset', () => {
    scrollTo(12);
    expect(stack().style.transform).toBe('translateY(-12px)');
  });

  it('clamps at the notice height so the masthead stays pinned', () => {
    scrollTo(500);
    expect(stack().style.transform).toBe(`translateY(-${NOTICE_HEIGHT}px)`);
  });

  it('returns to zero at the top of the page', () => {
    scrollTo(500);
    scrollTo(0);
    expect(stack().style.transform).toBe('translateY(0px)');
  });
});
