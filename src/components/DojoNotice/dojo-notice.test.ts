import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initDojoNotice } from './dojo-notice';
import { storage } from '@/lib/storage';

const NOTICE_ID = 'oita-fest-2026';
const NOTICE_HEIGHT = 34;

const NOTICE_HTML = `
  <div class="top-stack">
    <div class="dojo-notice" data-notice-id="${NOTICE_ID}">
      <a class="dojo-notice-link" href="https://example.test">Notice</a>
      <button class="dojo-notice-close" type="button" aria-label="Dismiss notice" hidden></button>
    </div>
    <header class="masthead"></header>
  </div>
`;

const notice = () => document.querySelector<HTMLElement>('.dojo-notice');
const stack = () => document.querySelector<HTMLElement>('.top-stack')!;
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

beforeEach(() => {
  document.body.innerHTML = NOTICE_HTML;
  stubNoticeHeight(NOTICE_HEIGHT);
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

describe('when the notice is absent', () => {
  it('returns without throwing', () => {
    document.body.innerHTML = '';
    expect(() => initDojoNotice(document)).not.toThrow();
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
    expect(notice()).not.toBeNull();
  });
});

describe('dismissing', () => {
  it('removes the notice and persists the id', () => {
    initDojoNotice(document);
    closeBtn().click();
    expect(notice()).toBeNull();
    expect(storage.read('dojo-notice')).toBe(NOTICE_ID);
  });

  it('still removes the notice when the write fails', () => {
    initDojoNotice(document);
    vi.spyOn(storage, 'write').mockReturnValue(false);
    closeBtn().click();
    expect(notice()).toBeNull();
  });

  it('clears the stack transform so the masthead returns to the top', () => {
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
