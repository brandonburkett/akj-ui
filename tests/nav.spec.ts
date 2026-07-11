import { test, expect } from '@playwright/test';

test.describe('nav dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('toggles open/closed via button, aria-expanded tracks', async ({ page }) => {
    const btn = page.locator('.menu-icon');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.site-menu')).toHaveClass(/open/);
    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  test('opens via keyboard (Enter) and closes on Escape returning focus', async ({ page }) => {
    const btn = page.locator('.menu-icon');
    await btn.focus();
    await page.keyboard.press('Enter');
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(btn).toBeFocused();
  });

  test('closes when clicking outside', async ({ page }) => {
    await page.locator('.menu-icon').click();
    await expect(page.locator('.site-menu')).toHaveClass(/open/);
    await page.locator('body').click({ position: { x: 5, y: 400 } });
    await expect(page.locator('.site-menu')).not.toHaveClass(/open/);
  });
});
