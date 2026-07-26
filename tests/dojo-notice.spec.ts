import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const STORAGE_KEY = 'akj:dojo-notice';

// Inside the committed notice window. Must be set before goto, because the module reads
// Date.now() as the page loads. setFixedTime, not install: install also fakes setTimeout,
// which would stall the timer that ends the reveal transition.
const INSIDE = new Date('2026-08-01T12:00:00');
const BEFORE = new Date('2026-07-01T12:00:00');
const AFTER = new Date('2026-09-15T12:00:00');

const notice = (page: Page) => page.locator('.dojo-notice');
const stack = (page: Page) => page.locator('.nav-stack');
const closeBtn = (page: Page) => page.locator('.dojo-notice-close');

async function visit(page: Page, at: Date, path = '/'): Promise<void> {
  await page.clock.setFixedTime(at);
  await page.goto(path);
}

/**
 * How far the stack is translated up, in px. 0 means the notice is fully shown.
 * Absolute, because Math.round(-0) is -0 and Object.is(-0, 0) is false.
 */
async function parkedBy(page: Page): Promise<number> {
  return page.evaluate(() => {
    const el = document.querySelector('.nav-stack');
    if (!el) {
      return -1;
    }
    const { m42 } = new DOMMatrix(getComputedStyle(el).transform);
    return Math.abs(Math.round(m42));
  });
}

const noticeId = (page: Page) =>
  page.evaluate(() => document.querySelector('.dojo-notice')?.getAttribute('data-notice-id') ?? '');

// The committed notice will expire one day, and these specs would start failing for a
// reason that is not a regression. Skip them then, and assert the inverse instead.
test.describe('when a notice is configured', () => {
  test.beforeEach(async ({ page }) => {
    await visit(page, INSIDE);
    const shipped = await page.locator('.dojo-notice, .nav-stack').count();
    test.skip(shipped === 0, 'no notice configured in src/data/dojo-notice.ts');
  });

  test('shows inside its window, with the close button live', async ({ page }) => {
    await expect(notice(page)).toBeVisible();
    await expect(closeBtn(page)).toBeVisible();
    // poll, the reveal is a transition and lands a few frames after load
    await expect.poll(() => parkedBy(page)).toBe(0);
  });

  test('the link opens externally and is safe', async ({ page }) => {
    const link = page.locator('.dojo-notice-link');
    await expect(link).toHaveAttribute('href', /^https?:\/\//);
    await expect(link).toHaveAttribute('target', '_blank');
    // a live window.opener handed to another origin is the reason this matters
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toContainText('opens in a new tab');
  });

  // Parked means hidden in place. Removing it would move the masthead's layout position
  // and score a shift, so the element stays and visibility carries the state.
  test('stays parked before the window opens', async ({ page }) => {
    await visit(page, BEFORE);
    await expect(notice(page)).toBeHidden();
    expect(await parkedBy(page)).toBeGreaterThan(0);
  });

  test('stays parked after the window closes', async ({ page }) => {
    await visit(page, AFTER);
    await expect(notice(page)).toBeHidden();
    expect(await parkedBy(page)).toBeGreaterThan(0);
  });

  test('dismissal persists across a reload', async ({ page }) => {
    const id = await noticeId(page);
    await closeBtn(page).click();
    await expect(notice(page)).toBeHidden();

    const stored = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
    expect(stored).toBe(id);

    await page.reload();
    await expect(notice(page)).toBeHidden();
  });

  test('a dismissed notice leaves nothing focusable behind', async ({ page }) => {
    await closeBtn(page).click();
    await expect(notice(page)).toBeHidden();

    // it is still in the DOM, parked. visibility:hidden must keep it out of tab order.
    await expect(notice(page)).toHaveCount(1);
    const reached: string[] = [];
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      reached.push(await page.evaluate(() => document.activeElement?.className?.toString() ?? ''));
    }
    expect(reached.join(' ')).not.toContain('dojo-notice');
  });

  test('dismissal carries to another page', async ({ page }) => {
    await closeBtn(page).click();
    await page.goto('/schedule');
    await expect(notice(page)).toBeHidden();
  });

  test('a stale stored id still shows the current notice', async ({ page }) => {
    await page.evaluate((key) => localStorage.setItem(key, 'some-older-notice'), STORAGE_KEY);
    await page.reload();
    await expect(notice(page)).toBeVisible();
  });

  test('scrolls away, clamping so the masthead stays pinned', async ({ page }) => {
    const height = await notice(page).evaluate((el) => (el as HTMLElement).offsetHeight);

    await expect.poll(() => parkedBy(page)).toBe(0);
    await page.mouse.wheel(0, 10);
    await expect.poll(() => parkedBy(page)).toBe(10);

    await page.mouse.wheel(0, 800);
    await expect.poll(() => parkedBy(page)).toBe(height);

    // masthead pinned at the very top once the notice has scrolled off
    const top = await page.locator('.masthead').evaluate((el) => el.getBoundingClientRect().top);
    expect(Math.round(top)).toBe(0);
  });

  test('page content does not move when the notice is dismissed', async ({ page }) => {
    const before = await page.locator('#main').evaluate((el) => el.getBoundingClientRect().top);
    await closeBtn(page).click();
    const after = await page.locator('#main').evaluate((el) => el.getBoundingClientRect().top);
    expect(after).toBe(before);
  });

  test('records no layout shift while the notice reveals', async ({ page }) => {
    const shift = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let total = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as (PerformanceEntry & {
              value: number;
              hadRecentInput: boolean;
            })[]) {
              if (!entry.hadRecentInput) {
                total += entry.value;
              }
            }
          }).observe({ type: 'layout-shift', buffered: true });
          setTimeout(() => resolve(total), 1000);
        }),
    );
    // Not zero: master shows the same 0.000229 from the Amble webfont re-measuring
    // .brand-title. Assert we stay well under it rather than pretend it is ours.
    expect(shift).toBeLessThan(0.001);
  });

  test('keeps both controls keyboard reachable with a visible ring', async ({ page }) => {
    for (const selector of ['.dojo-notice-link', '.dojo-notice-close']) {
      await page.goto('/');
      let reached = false;
      for (let i = 0; i < 6 && !reached; i++) {
        await page.keyboard.press('Tab');
        reached = await page.evaluate(
          (sel) => document.activeElement?.matches(sel) ?? false,
          selector,
        );
      }
      expect(reached, `never tabbed to ${selector}`).toBe(true);

      const ring = await page.evaluate(() => {
        const style = getComputedStyle(document.activeElement as Element);
        return { width: parseFloat(style.outlineWidth), style: style.outlineStyle };
      });
      expect(ring.style).not.toBe('none');
      expect(ring.width).toBeGreaterThanOrEqual(2);
    }
  });

  test('has no serious or critical a11y violations', async ({ page }) => {
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const serious = results.violations.filter((v) =>
      ['serious', 'critical'].includes(v.impact ?? ''),
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
});

test('with no notice configured the nav pins on its own', async ({ page }) => {
  await page.goto('/');
  if ((await stack(page).count()) > 0) {
    test.skip(true, 'a notice is configured, covered by the suite above');
  }
  await expect(page.locator('.masthead')).toHaveCSS('position', 'fixed');
});
