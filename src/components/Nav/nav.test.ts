import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { initNav } from './nav';

const NAV_HTML = `
  <div id="outside">outside</div>
  <nav class="site-menu" aria-label="Site Navigation">
    <button class="menu-icon" aria-expanded="false" aria-controls="aria-menu-list">Menu</button>
    <div id="aria-menu-list">
      <ul><li><a class="nav-parent" href="#nav">Iaijutsu</a></li></ul>
    </div>
  </nav>
`;

// Uses the global (vitest jsdom) document so focus()/activeElement work and
// `e.target instanceof Node` resolves in the same realm. initNav attaches
// keydown/mousedown to the document; afterEach closes the current nav before it
// detaches so any lingering listener is inert (its nav reports closed).
const btn = () => document.querySelector<HTMLButtonElement>('.menu-icon')!;
const menu = () => document.querySelector<HTMLElement>('.site-menu')!;

beforeEach(() => {
  document.body.innerHTML = NAV_HTML;
  initNav(document);
});

afterEach(() => {
  menu().classList.remove('open');
  document.body.innerHTML = '';
});

describe('initNav', () => {
  it('toggle click opens the menu and tracks aria-expanded', () => {
    expect(menu().classList.contains('open')).toBe(false);
    btn().click();
    expect(menu().classList.contains('open')).toBe(true);
    expect(btn().getAttribute('aria-expanded')).toBe('true');
    btn().click();
    expect(menu().classList.contains('open')).toBe(false);
    expect(btn().getAttribute('aria-expanded')).toBe('false');
  });

  it('Escape closes and returns focus to the toggle', () => {
    btn().click();
    expect(menu().classList.contains('open')).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(menu().classList.contains('open')).toBe(false);
    expect(document.activeElement).toBe(btn());
  });

  it('closes after following a nav link', () => {
    btn().click();
    expect(menu().classList.contains('open')).toBe(true);
    document.querySelector<HTMLAnchorElement>('a.nav-parent')!.click();
    expect(menu().classList.contains('open')).toBe(false);
  });

  it('mousedown outside the nav closes it', () => {
    btn().click();
    expect(menu().classList.contains('open')).toBe(true);
    document
      .getElementById('outside')!
      .dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(menu().classList.contains('open')).toBe(false);
  });
});
