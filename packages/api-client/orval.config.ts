import { defineConfig } from 'orval';

/**
 * Generates typed React Query hooks and models from `openapi.json` (the backend spec,
 * copied from detailflow-api/docs/openapi.json). Run `pnpm generate` after updating the spec;
 * the output is committed and CI checks that it is up to date.
 */
export default defineConfig({
  detaileed: {
    input: './openapi.json',
    hooks: { afterAllFilesWrite: 'prettier --write' },
    output: {
      mode: 'tags-split',
      target: './src/generated/endpoints',
      schemas: './src/generated/model',
      client: 'react-query',
      httpClient: 'fetch',
      clean: true,
      override: {
        mutator: { path: './src/fetcher.ts', name: 'apiFetch' },
        // apiFetch resolves with the body itself, not a { data, status, headers } wrapper.
        fetch: { includeHttpResponseReturnType: false },
      },
    },
  },
});
