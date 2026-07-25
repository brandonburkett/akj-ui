import { storage } from '@/lib/storage';

/** Bare name, the storage module owns the `akj:` prefix. */
const STORAGE_NAME = 'dojo-notice';

/**
 * Wires the notice's dismiss button and the scroll-away translate.
 *
 * Visibility is not decided here. An inline script in DojoNotice.astro has already
 * removed the notice before first paint if it is out of its window or dismissed, so
 * reaching this code means the notice is showing.
 *
 * `doc` defaults to the ambient document so the island calls initDojoNotice() while
 * tests inject a jsdom document.
 */
export function initDojoNotice(doc: Document = document): void {
  const notice = doc.querySelector<HTMLElement>('.dojo-notice');
  const stack = doc.querySelector<HTMLElement>('.top-stack');
  const closeBtn = notice?.querySelector<HTMLButtonElement>('.dojo-notice-close');
  const noticeId = notice?.dataset.noticeId;
  if (!notice || !stack || !closeBtn || !noticeId) {
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
    notice.remove();
    stack.style.transform = '';
    doc.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
  };

  doc.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);

  // listener first, then reveal, so the button can never exist without a handler
  if (storage.isAvailable()) {
    closeBtn.addEventListener('click', dismiss);
    closeBtn.hidden = false;
  }
}
