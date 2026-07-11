// SEO URL helpers shared by SeoHead.astro. Extracted so the canonical/OG
// normalization is unit-testable independent of Astro rendering.

/**
 * Canonical URL for a page path.
 * build.format:'file' makes Astro.url.pathname include '.html' at build time
 * (e.g. '/iaijutsu.html', '/index.html'); dev gives '/iaijutsu'. Normalize both:
 * strip '/index.html' and '.html', keep the root's single slash, and strip any
 * other trailing slash.
 */
export function buildCanonical(path: string, siteUrl: string): string {
  const cleanPath = path.replace(/\/index\.html$/, '/').replace(/\.html$/, '') || '/';
  const url = new URL(cleanPath, siteUrl);
  return url.pathname === '/' ? url.href : url.href.replace(/\/$/, '');
}

/** Absolute OG image URL, falling back to the default when none is provided. */
export function buildOgImage(
  image: string | undefined,
  defaultSrc: string,
  siteUrl: string,
): string {
  return new URL(image ?? defaultSrc, siteUrl).href;
}
