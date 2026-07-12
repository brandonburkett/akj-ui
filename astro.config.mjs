import { defineConfig } from 'astro/config';

// https://astro.build
export default defineConfig({
  site: 'https://austin.komeijyuku.com',
  output: 'static',
  trailingSlash: 'never',
  prefetch: {
    // prefetch links as they enter view, so nav prefetches on open and CTAs on scroll, not on load
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  build: {
    // Emit `iaijutsu.html` (not `iaijutsu/index.html`) so S3 serves
    // extensionless URLs — the deploy uploads each as an extensionless key.
    format: 'file',
    inlineStylesheets: 'never',
  },
  vite: {
    // esbuild keeps autoprefixer's vendor prefixes that the lightningcss minifier strips
    build: { cssMinify: 'esbuild' },
  },
});
