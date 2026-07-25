import { afterEach, describe, expect, it, vi } from 'vitest';
import { storage } from './storage';

// A Storage whose every member throws, standing in for a browser that hands one
// back but rejects the calls (Safari private mode has historically done this).
const throwingStore: Storage = {
  get length(): number {
    throw new Error('blocked');
  },
  clear(): void {
    throw new Error('blocked');
  },
  getItem(): string | null {
    throw new Error('blocked');
  },
  key(): string | null {
    throw new Error('blocked');
  },
  removeItem(): void {
    throw new Error('blocked');
  },
  setItem(): void {
    throw new Error('blocked');
  },
};

// stubGlobal assigns a value, so the throws-on-property-access case needs a real
// accessor instead. jsdom lets us redefine it, as long as we put it back.
function withBlockedAccess(assertions: () => void): void {
  const original = Object.getOwnPropertyDescriptor(window, 'localStorage');
  Object.defineProperty(window, 'localStorage', {
    get(): Storage {
      throw new Error('blocked');
    },
    configurable: true,
  });
  try {
    assertions();
  } finally {
    if (original) {
      Object.defineProperty(window, 'localStorage', original);
    }
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe('key', () => {
  it('prefixes a bare name', () => {
    expect(storage.key('dojo-notice')).toBe('akj:dojo-notice');
  });

  it('does not double-prefix a name that already looks prefixed', () => {
    expect(storage.key('akj:dojo-notice')).toBe('akj:dojo-notice');
  });
});

describe('read, write, remove', () => {
  it('round trips a value under the prefixed key', () => {
    expect(storage.write('dojo-notice', 'oita-fest-2026')).toBe(true);
    expect(storage.read('dojo-notice')).toBe('oita-fest-2026');
    // stored prefixed, so callers never have to know the namespace
    expect(window.localStorage.getItem('akj:dojo-notice')).toBe('oita-fest-2026');
  });

  it('reads null for a name that was never written', () => {
    expect(storage.read('never-set')).toBeNull();
  });

  it('removes a value', () => {
    storage.write('dojo-notice', 'oita-fest-2026');
    expect(storage.remove('dojo-notice')).toBe(true);
    expect(storage.read('dojo-notice')).toBeNull();
  });
});

describe('isAvailable', () => {
  it('is true when the store accepts a write', () => {
    expect(storage.isAvailable()).toBe(true);
  });

  it('leaves no probe key behind', () => {
    storage.isAvailable();
    expect(window.localStorage.length).toBe(0);
  });
});

describe('when the store throws on every call', () => {
  it('reads null rather than throwing', () => {
    vi.stubGlobal('localStorage', throwingStore);
    expect(storage.read('dojo-notice')).toBeNull();
  });

  it('reports a failed write', () => {
    vi.stubGlobal('localStorage', throwingStore);
    expect(storage.write('dojo-notice', 'x')).toBe(false);
  });

  it('reports a failed remove', () => {
    vi.stubGlobal('localStorage', throwingStore);
    expect(storage.remove('dojo-notice')).toBe(false);
  });

  it('is not available', () => {
    vi.stubGlobal('localStorage', throwingStore);
    expect(storage.isAvailable()).toBe(false);
  });
});

// The case that motivates resolving inside a try: with cookies blocked, touching
// window.localStorage throws before any method runs.
describe('when window.localStorage throws on property access', () => {
  it('reads null rather than throwing', () => {
    withBlockedAccess(() => {
      expect(storage.read('dojo-notice')).toBeNull();
    });
  });

  it('reports a failed write', () => {
    withBlockedAccess(() => {
      expect(storage.write('dojo-notice', 'x')).toBe(false);
    });
  });

  it('is not available', () => {
    withBlockedAccess(() => {
      expect(storage.isAvailable()).toBe(false);
    });
  });
});
