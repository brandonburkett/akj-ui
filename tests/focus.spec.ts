import { test, expect, type Page } from '@playwright/test';

const PAGES = ['/', '/iaijutsu', '/schedule', '/seminars'];

// WCAG 2.2 SC 2.4.11 wants a focus perimeter of at least 2px. axe cannot detect
// a missing indicator, so assert it directly.
const MIN_RING_PX = 2;

type Stop = {
  label: string;
  tag: string;
  outlineStyle: string;
  outlineWidth: number;
  focusVisible: boolean;
};

const activeStop = (page: Page) =>
  page.evaluate<Stop | null>(() => {
    const el = document.activeElement;
    if (!el || el === document.body) {
      return null;
    }
    const styles = getComputedStyle(el);
    const classes = String(el.className ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    return {
      label: el.tagName.toLowerCase() + (classes.length ? `.${classes.join('.')}` : ''),
      tag: el.tagName.toLowerCase(),
      outlineStyle: styles.outlineStyle,
      outlineWidth: parseFloat(styles.outlineWidth) || 0,
      focusVisible: el.matches(':focus-visible'),
    };
  });

/** Tab through a page, returning the first visit to each distinct control. */
async function collectTabStops(page: Page, presses = 30): Promise<Stop[]> {
  const seen = new Set<string>();
  const stops: Stop[] = [];
  for (let i = 0; i < presses; i++) {
    await page.keyboard.press('Tab');
    const stop = await activeStop(page);
    if (!stop || seen.has(stop.label)) {
      continue;
    }
    seen.add(stop.label);
    stops.push(stop);
  }
  return stops;
}

// the dev toolbar is not part of the site, and map embeds hand focus to
// third-party content that carries its own indicator
const isOurs = (stop: Stop) => !stop.tag.startsWith('astro-') && stop.tag !== 'iframe';

test.describe('keyboard focus is always visible', () => {
  for (const path of PAGES) {
    test(`every tab stop on ${path} has a visible ring`, async ({ page }) => {
      await page.goto(path);
      const stops = (await collectTabStops(page)).filter(isOurs);

      expect(stops.length).toBeGreaterThan(2);
      const unringed = stops
        .filter((s) => !(s.outlineStyle !== 'none' && s.outlineWidth >= MIN_RING_PX))
        .map((s) => `${s.label} (outline ${s.outlineStyle} ${s.outlineWidth}px)`);
      expect(unringed).toEqual([]);
    });
  }
});

test.describe('skip link', () => {
  test('is the first tab stop and moves focus to main', async ({ page }) => {
    await page.goto('/iaijutsu');
    await page.keyboard.press('Tab');

    const skip = page.locator('.skip-link');
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();

    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
  });

  test('stays offscreen until focused', async ({ page }) => {
    await page.goto('/iaijutsu');
    await expect(page.locator('.skip-link')).not.toBeInViewport();
  });

  test('targets a real main landmark on every page', async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      await expect(page.locator('.skip-link')).toHaveAttribute('href', '#main');
      await expect(page.locator('#main')).toHaveAttribute('role', 'main');
    }
  });
});

test.describe('mouse interaction stays ring free', () => {
  test('clicking a button does not draw the keyboard ring', async ({ page }) => {
    await page.goto('/iaijutsu');
    await page.locator('.menu-icon').click();

    const stop = await activeStop(page);
    expect(stop?.label).toContain('menu-icon');
    expect(stop?.focusVisible).toBe(false);
    expect(stop?.outlineStyle === 'none' || stop?.outlineWidth === 0).toBe(true);
  });
});

test.describe('link text carries no padding whitespace', () => {
  // padding spaces inside an anchor extend the underline and the focus ring
  for (const path of ['/schedule', '/seminars']) {
    test(`links on ${path} have trimmed text`, async ({ page }) => {
      await page.goto(path);
      const padded = await page.$$eval('a', (links) =>
        links
          .map((a) => a.textContent ?? '')
          .filter((t) => t.length > 0 && t !== t.trim())
          .map((t) => JSON.stringify(t)),
      );
      expect(padded).toEqual([]);
    });
  }
});
