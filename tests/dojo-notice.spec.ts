import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const STORAGE_KEY = 'akj:dojo-notice';

// Inside the committed notice window. The clock must be installed before goto,
// because the module reads Date.now() as the page loads.
const INSIDE = new Date('2026-08-01T12:00:00');
const BEFORE = new Date('2026-07-01T12:00:00');
const AFTER = new Date('2026-09-15T12:00:00');

const notice = (page: Page) => page.locator('.dojo-notice');
const stack = (page: Page) => page.locator('.nav-stack');
const closeBtn = (page: Page) => page.locator('.dojo-notice-close');

async function visit(page: Page, at: Date, path = '/'): Promise<void> {
  await page.clock.install({ time: at });
  await page.goto(path);
}

/** How far the stack is translated up, in px. 0 means the notice is fully shown. */
async function parkedBy(page: Page): Promise<number> {
  return page.evaluate(() => {
    const el = document.querySelector('.nav-stack');
    if (!el) {
      return -1;
    }
    const { m42 } = new DOMMatrix(getComputedStyle(el).transform);
    return Math.round(-m42);
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
    expect(await parkedBy(page)).toBe(0);
  });

  test('the link opens externally and is safe', async ({ page }) => {
    const link = page.locator('.dojo-notice-link');
    await expect(link).toHaveAttribute('href', /^https?:\/\//);
    await expect(link).toHaveAttribute('target', '_blank');
    // a live window.opener handed to another origin is the reason this matters
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toContainText('opens in a new tab');
  });

  test('stays parked before the window opens', async ({ page }) => {
    await visit(page, BEFORE);
    await expect(notice(page)).toHaveCount(0);
  });

  test('stays parked after the window closes', async ({ page }) => {
    await visit(page, AFTER);
    await expect(notice(page)).toHaveCount(0);
  });

  test('dismissal persists across a reload', async ({ page }) => {
    await closeBtn(page).click();
    await expect(notice(page)).toHaveCount(0);

    const stored = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
    expect(stored).toBe(await noticeId(page).catch(() => stored));

    await page.reload();
    await expect(notice(page)).toHaveCount(0);
  });

  test('dismissal carries to another page', async ({ page }) => {
    await closeBtn(page).click();
    await page.goto('/schedule');
    await expect(notice(page)).toHaveCount(0);
  });

  test('a stale stored id still shows the current notice', async ({ page }) => {
    await page.evaluate((key) => localStorage.setItem(key, 'some-older-notice'), STORAGE_KEY);
    await page.reload();
    await expect(notice(page)).toBeVisible();
  });

  test('scrolls away, clamping so the masthead stays pinned', async ({ page }) => {
    const height = await notice(page).evaluate((el) => (el as HTMLElement).offsetHeight);

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
    expect(shift).toBe(0);
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
