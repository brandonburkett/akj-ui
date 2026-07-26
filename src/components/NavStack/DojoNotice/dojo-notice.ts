import { storage } from '@/lib/storage';

/** Bare name, the storage module owns the `akj:` prefix. */
const STORAGE_NAME = 'dojo-notice';

/** Long enough to cover the reveal transition in nav-stack.css. */
const REVEAL_MS = 300;

/**
 * Both bounds inclusive, in the visitor's local time. The time component is load
 * bearing: a bare YYYY-MM-DD parses as UTC, a date-time without an offset parses local.
 */
export function isWithinWindow(start: string, end: string, now: number): boolean {
  return now >= Date.parse(`${start}T00:00:00`) && now <= Date.parse(`${end}T23:59:59.999`);
}

/**
 * Decides whether the notice shows, then wires dismissal and scroll-away.
 *
 * CSS parks the stack one notice-height up, which is the dismissed layout, so a
 * dismissed visitor gets the final result on the first paint and this runs to a no-op.
 * Revealing is a transform, which layout shift scoring ignores, so it costs no CLS even
 * though this script is deferred.
 *
 * Translating `.nav-stack` reaches into markup NavStack owns, but the distance is
 * measured from the notice's height, so splitting it out would duplicate that.
 *
 * `doc` defaults to the ambient document so the island calls initDojoNotice() while
 * tests inject a jsdom document.
 */
export function initDojoNotice(doc: Document = document): void {
  const notice = doc.querySelector<HTMLElement>('.dojo-notice');
  const stack = doc.querySelector<HTMLElement>('.nav-stack');
  const closeBtn = notice?.querySelector<HTMLButtonElement>('.dojo-notice-close');
  const { noticeId, start, end } = notice?.dataset ?? {};
  if (!notice || !stack || !closeBtn || !noticeId || !start || !end) {
    return;
  }

  // Nothing to undo: CSS already parks and hides it, so this path touches no layout
  // and no styles, which is what keeps the dismissed case at exactly zero shift.
  if (!isWithinWindow(start, end, Date.now()) || storage.read(STORAGE_NAME) === noticeId) {
    return;
  }

  // measured once, reading offsetHeight per frame would force a layout on every scroll
  let noticeHeight = notice.offsetHeight;
  let ticking = false;

  const translate = () => {
    const shift = Math.min(window.scrollY, noticeHeight);
    stack.style.transform = `translateY(${-shift}px)`;
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) {
      return;
    }
    ticking = true;
    requestAnimationFrame(translate);
  };

  const onResize = () => {
    noticeHeight = notice.offsetHeight;
    translate();
  };

  const dismiss = () => {
    // a failed write must not block the dismissal the visitor asked for
    storage.write(STORAGE_NAME, noticeId);
    // back to the CSS parked offset, so it slides out the way it slid in
    stack.classList.add('nav-stack-reveal');
    stack.classList.remove('nav-stack-shown');
    stack.style.transform = '';
    doc.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
  };

  doc.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);

  stack.classList.add('nav-stack-reveal', 'nav-stack-shown');
  translate();
  window.setTimeout(() => stack.classList.remove('nav-stack-reveal'), REVEAL_MS);

  // listener first, then reveal, so the button can never exist without a handler
  if (storage.isAvailable()) {
    closeBtn.addEventListener('click', dismiss);
    closeBtn.hidden = false;
  }
}
