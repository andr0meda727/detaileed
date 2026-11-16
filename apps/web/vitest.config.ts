import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // tsconfig keeps JSX for Next ("preserve"); tests need it compiled.
  esbuild: { jsx: 'automatic' },
  resolve: { alias: { '@': path.join(import.meta.dirname, 'src') } },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setupTests.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
