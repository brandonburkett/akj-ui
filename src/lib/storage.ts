/** Namespaced so nothing collides with other keys on the origin. */
const PREFIX = 'akj:';

/** Written and removed immediately by the availability probe. */
const PROBE_KEY = `${PREFIX}probe`;

/** Tolerates an already-prefixed name so callers can pass either form. */
function prefixed(name: string): string {
  return name.startsWith(PREFIX) ? name : `${PREFIX}${name}`;
}

/**
 * The access and the call fail independently, so one try covers both. Blocked storage
 * throws on `window.localStorage` itself, and a store that resolves can still reject
 * the call, which is Safari private mode and QuotaExceededError.
 */
function attempt<T>(operation: (store: Storage) => T, fallback: T): T {
  try {
    return operation(window.localStorage);
  } catch {
    return fallback;
  }
}

/** Wraps localStorage, never sessionStorage. Never throws, so callers need no guards. */
export const storage = {
  /** For callers that need the stored key itself, like the pre-paint inline script. */
  key(name: string): string {
    return prefixed(name);
  },

  /** Probes with a write: Safari private mode answers reads but rejects every write. */
  isAvailable(): boolean {
    return attempt((store) => {
      store.setItem(PROBE_KEY, PROBE_KEY);
      store.removeItem(PROBE_KEY);
      return true;
    }, false);
  },

  /** Null when unset and when storage is unavailable, callers cannot tell them apart. */
  read(name: string): string | null {
    return attempt((store) => store.getItem(prefixed(name)), null);
  },

  /** False when the value could not be persisted. */
  write(name: string, value: string): boolean {
    return attempt((store) => {
      store.setItem(prefixed(name), value);
      return true;
    }, false);
  },

  /** False when the value could not be removed. */
  remove(name: string): boolean {
    return attempt((store) => {
      store.removeItem(prefixed(name));
      return true;
    }, false);
  },
};
