// Accessible disclosure nav. `open` class on `.site-menu` is the single source
// of visual truth (see nav.css `.site-menu.open > .menu-bar`); `aria-expanded`
// on the toggle button is the a11y state indicator. No `hidden`/`aria-hidden`
// on the region — display:none (from CSS when closed) already removes it from
// the accessibility tree, and on open it is genuinely visible.
//
// `doc` param defaults to the ambient document so islands call initNav() while
// tests inject a jsdom document.
export function initNav(doc: Document = document): void {
  const nav = doc.querySelector<HTMLElement>('.site-menu');
  const btn = nav?.querySelector<HTMLButtonElement>('.menu-icon');
  const region = doc.getElementById('aria-menu-list');
  if (!nav || !btn || !region) {
    return;
  }

  const isOpen = () => nav.classList.contains('open');

  const setOpen = (open: boolean) => {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  };

  btn.addEventListener('click', () => setOpen(!isOpen()));

  // close after following a nav link
  region
    .querySelectorAll('a.nav-parent')
    .forEach((link) => link.addEventListener('click', () => setOpen(false)));

  // Escape closes and returns focus to the toggle button
  doc.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      btn.focus();
    }
  });

  // click/tap outside the nav closes it
  doc.addEventListener('mousedown', (event) => {
    if (isOpen() && event.target instanceof Node && !nav.contains(event.target)) {
      setOpen(false);
    }
  });
}
