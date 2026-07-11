import { defineConfig } from 'astro/config';

// https://astro.build
export default defineConfig({
  site: 'https://austin.komeijyuku.com',
  output: 'static',
  trailingSlash: 'never',
  build: {
    // Emit `iaijutsu.html` (not `iaijutsu/index.html`) so S3 can serve
    // extensionless URLs exactly like the old react-snap + production.sh flow.
    format: 'file',
    inlineStylesheets: 'never',
  },
});
