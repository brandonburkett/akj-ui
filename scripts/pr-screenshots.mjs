// Generate screenshots for a pull request. Not part of the app or CI.
//
// Usage:
//   1. Build and serve the real output:  npm run build && npm run preview
//      (use preview, not dev: the dev server injects the Astro toolbar into shots)
//   2. Edit TARGETS below for the pages your change touches.
//   3. Run:  npm run screenshots   (writes PNGs to .pr-screenshots/, gitignored)
//   4. Drag the PNGs into the PR's Screenshots section on GitHub, then delete them.
//
// Screenshots are never committed. GitHub hosts the images you drag into the PR.

import { chromium, devices } from 'playwright';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:4321';
const OUT_DIR = process.argv[2] ?? '.pr-screenshots';

const VIEWPORTS = {
  mobile: devices['iPhone 13'],
  desktop: { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 },
};

// Add one entry per screenshot, then reset TARGETS back to [] before committing,
// so this file does not change on every PR. Fields per entry:
//   name      output file, written as <name>.png
//   path      route to visit, e.g. '/schedule'
//   viewport  'mobile' or 'desktop' (see VIEWPORTS)
//   selector  optional. with clip:true it tight-crops that element, without clip
//             it scrolls the element into view then shoots the viewport, omit for full page.
//
// Example, mobile + desktop of the schedule contact block:
//   { name: 'contact-mobile', path: '/schedule', viewport: 'mobile', selector: 'p:has(a[href^="tel:"])' },
//   { name: 'contact-desktop', path: '/schedule', viewport: 'desktop', selector: 'p:has(a[href^="tel:"])' },
const TARGETS = [];

async function shoot(browser, target) {
  const context = await browser.newContext(VIEWPORTS[target.viewport]);
  const page = await context.newPage();
  await page.goto(`${BASE_URL}${target.path}`, { waitUntil: 'networkidle' });

  const file = path.join(OUT_DIR, `${target.name}.png`);
  if (target.selector && target.clip) {
    await page.locator(target.selector).first().screenshot({ path: file });
  } else if (target.selector) {
    await page.locator(target.selector).first().scrollIntoViewIfNeeded();
    await page.screenshot({ path: file });
  } else {
    await page.screenshot({ path: file, fullPage: true });
  }

  await context.close();
  return file;
}

async function main() {
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  try {
    for (const target of TARGETS) {
      const file = await shoot(browser, target);
      console.log(`wrote ${file}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
