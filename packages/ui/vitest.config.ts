import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // Until the first component test lands.
    passWithNoTests: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setupTests.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
