import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    // scope to unit tests only; Playwright owns ./tests (avoid double-running e2e)
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/scripts/**'],
      reporter: ['text', 'html'],
    },
  },
});
