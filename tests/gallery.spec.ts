import { test, expect } from '@playwright/test';

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

  test('fullscreen button is present and labelled', async ({ page }) => {
    await expect(page.locator('.sg-fullscreen')).toHaveAttribute('aria-label', /fullscreen/i);
  });
});
