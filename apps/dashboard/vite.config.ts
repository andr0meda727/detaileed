import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '^/api/.*': {
          target: 'https://api.detaileed.com',
          changeOrigin: true,
        },
      },
    },
    plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./tests/setupTests.ts'],
      include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
      },
    },
  };
});
