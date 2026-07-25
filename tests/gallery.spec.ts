import { test, expect, type Page } from '@playwright/test';

const activeBullet = (page: Page) => page.locator('.sg-bullet[aria-current="true"]');

/** Slide the track is actually resting on, independent of what the script believes. */
const restingIndex = (page: Page) =>
  page.evaluate(() => {
    const track = document.querySelector<HTMLElement>('.sg-track')!;
    return Math.round(track.scrollLeft / track.clientWidth);
  });

/** Scroll the track as a swipe would, letting CSS scroll-snap settle it. */
const scrollTrackTo = (page: Page, slidePosition: number) =>
  page.evaluate((position) => {
    const track = document.querySelector<HTMLElement>('.sg-track')!;
    track.scrollLeft = position * track.clientWidth;
  }, slidePosition);

test.describe('image gallery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iaijutsu');
  });

  test('renders slides with alt text and bullet controls', async ({ page }) => {
    const slides = page.locator('.sg-slide');
    await expect(slides.first()).toBeVisible();
    expect(await slides.count()).toBeGreaterThan(1);
    await expect(page.locator('.sg-bullet').first()).toHaveAttribute('aria-label', /slide 1/i);
  });

  test('next button advances active slide and updates aria-current', async ({ page }) => {
    await expect(page.locator('.sg-bullet[aria-current="true"]')).toHaveAttribute(
      'data-index',
      '0',
    );
    await page.locator('.sg-next').click();
    await expect(page.locator('.sg-bullet[aria-current="true"]')).toHaveAttribute(
      'data-index',
      '1',
    );
  });

  test('keyboard arrows move slides when track focused', async ({ page }) => {
    await page.locator('.sg-track').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.sg-bullet[aria-current="true"]')).toHaveAttribute(
      'data-index',
      '1',
    );
    await page.keyboard.press('Home');
    await expect(page.locator('.sg-bullet[aria-current="true"]')).toHaveAttribute(
      'data-index',
      '0',
    );
  });

  test('prev from the first slide wraps to the last', async ({ page }) => {
    await expect(page.locator('.sg-bullet[aria-current="true"]')).toHaveAttribute(
      'data-index',
      '0',
    );
    const lastIndex = String((await page.locator('.sg-bullet').count()) - 1);
    await page.locator('.sg-prev').click();
    await expect(page.locator('.sg-bullet[aria-current="true"]')).toHaveAttribute(
      'data-index',
      lastIndex,
    );
  });

  test('fullscreen button is present and labelled', async ({ page }) => {
    await expect(page.locator('.sg-fullscreen')).toHaveAttribute('aria-label', /fullscreen/i);
  });
});

// Regression: the active slide used to come from an IntersectionObserver, whose
// `isIntersecting` is true for any overlap. Scrolling backward let the outgoing
// slide claim the active index, so the next arrow click skipped a slide.
test.describe('image gallery slide tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iaijutsu');
  });

  // Before the slide images load they have no height, which made slide 1 a
  // zero-area box edge-adjacent to the track's right edge. The observer reported
  // that as intersecting at ratio 1, so the gallery believed it was already on
  // slide 1 and the first ArrowRight jumped to slide 2.
  test('the first ArrowRight advances one slide while images are still loading', async ({
    page,
  }) => {
    await page.route(/\.(jpe?g|png|webp|avif)$/, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });
    await page.goto('/iaijutsu');

    await expect(activeBullet(page)).toHaveAttribute('data-index', '0');

    await page.locator('.sg-track').focus();
    await page.keyboard.press('ArrowRight');

    await expect(activeBullet(page)).toHaveAttribute('data-index', '1');
    await expect.poll(() => restingIndex(page)).toBe(1);
  });

  test('next after scrolling backward advances exactly one slide', async ({ page }) => {
    await scrollTrackTo(page, 3);
    await expect(activeBullet(page)).toHaveAttribute('data-index', '3');

    await scrollTrackTo(page, 2); // backward, the direction that used to break
    await expect(activeBullet(page)).toHaveAttribute('data-index', '2');

    await page.locator('.sg-next').click();

    await expect(activeBullet(page)).toHaveAttribute('data-index', '3');
    await expect.poll(() => restingIndex(page)).toBe(3);
  });

  test('aria-current always matches the resting scroll position', async ({ page }) => {
    for (const position of [4, 2, 5.4, 1, 0]) {
      await scrollTrackTo(page, position);
      await expect
        .poll(async () => {
          const resting = await restingIndex(page);
          const current = await activeBullet(page).getAttribute('data-index');
          return Number(current) === resting;
        })
        .toBe(true);
    }
  });

  test('two quick next clicks advance exactly two slides', async ({ page }) => {
    const next = page.locator('.sg-next');
    await next.click();
    await next.click();

    await expect(activeBullet(page)).toHaveAttribute('data-index', '2');
    await expect.poll(() => restingIndex(page)).toBe(2);
  });
});
