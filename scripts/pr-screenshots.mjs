// Generate screenshots for a pull request. Not part of the app or CI.
//
// Usage:
//   1. Build and serve the real output:  npm run build && npm run preview
//      (use preview, not dev: the dev server injects the Astro toolbar into shots)
//   2. Edit TARGETS below for the pages your change touches.
//   3. Run:  npm run screenshots   (writes PNGs to .pr-screenshots/, gitignored)
//   4. Upload to the site bucket under a <PR#>- prefix, see the Pull requests
//      section of CLAUDE.md, then link them in the PR's Screenshots table.
//
// Screenshots are never committed. CloudFront serves them from the site bucket.

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
//   focus     optional selector to tab to first, for capturing :focus-visible states.
//             Tabbing rather than calling focus() is what makes the ring appear.
//
// Example, mobile + desktop of the schedule contact block:
//   { name: 'contact-mobile', path: '/schedule', viewport: 'mobile', selector: 'p:has(a[href^="tel:"])' },
//   { name: 'contact-desktop', path: '/schedule', viewport: 'desktop', selector: 'p:has(a[href^="tel:"])' },
const TARGETS = [];

// :focus-visible only matches for keyboard interaction, so walk Tab to the target
async function tabTo(page, selector, maxPresses = 40) {
  for (let i = 0; i < maxPresses; i++) {
    await page.keyboard.press('Tab');
    const onTarget = await page.evaluate(
      (sel) => document.activeElement?.matches(sel) ?? false,
      selector,
    );
    if (onTarget) {
      return;
    }
  }
  throw new Error(`never reached ${selector} after ${maxPresses} tabs`);
}

async function shoot(browser, target) {
  const context = await browser.newContext(VIEWPORTS[target.viewport]);
  const page = await context.newPage();
  await page.goto(`${BASE_URL}${target.path}`, { waitUntil: 'networkidle' });

  if (target.focus) {
    await tabTo(page, target.focus);
    await page.waitForTimeout(400); // let focus transitions settle before shooting
  }

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
