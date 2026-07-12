import { test, expect } from '@playwright/test';

test('home has canonical + OG url without trailing slash', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Austin Komei Jyuku/);
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute('href', 'https://austin.komeijyuku.com/');
  const ogTitle = page.locator('meta[property="og:title"]');
  await expect(ogTitle).toHaveAttribute('content', /.+/);
});

test('iaijutsu canonical is extensionless, no trailing slash', async ({ page }) => {
  await page.goto('/iaijutsu');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://austin.komeijyuku.com/iaijutsu',
  );
});
