import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import boundaries from 'eslint-plugin-boundaries';

/** Shared rules for TypeScript code in every package. */
export const base = tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules', '.turbo'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2022 },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Existing code uses `any` in places; tighten once features are migrated.
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    files: ['tests/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
);

/** Base rules + React (hooks, fast refresh) for browser apps and UI packages. */
export const react = tseslint.config(
  ...base,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Derive state, remount with a key, or use an event handler instead.
      'react-hooks/set-state-in-effect': 'error',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    // TanStack Router route files export `Route` and keep their components private; the router
    // plugin splits those components into their own modules, so fast refresh still works.
    files: ['**/routes/**/*.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
);

/**
 * Feature-slice architecture for an app's `src`: imports flow app → routes → features → shared, a feature
 * uses another feature only through its index.ts, and network calls go through @detaileed/api-client.
 */
export const featureSlices = tseslint.config({
  files: ['src/**/*.{ts,tsx}'],
  plugins: { boundaries },
  settings: {
    'import/resolver': { typescript: { alwaysTryTypes: true } },
    'boundaries/elements': [
      { type: 'app', pattern: 'src/app' },
      { type: 'routes', pattern: 'src/routes' },
      { type: 'features', pattern: 'src/features/*', capture: ['feature'] },
      { type: 'shared', pattern: 'src/shared' },
    ],
  },
  rules: {
    'boundaries/dependencies': [
      'error',
      {
        default: 'disallow',
        policies: [
          // Anything inside the same element (one feature, shared, routes, app).
          { allow: { dependency: { relationship: { to: 'internal' } } } },
          // npm packages and workspace packages.
          { allow: { to: { module: { origin: ['external', 'core'] } } } },
          {
            from: { element: { types: ['app', 'routes'] } },
            allow: { to: { element: { types: ['app', 'routes', 'shared'] } } },
          },
          {
            from: { element: { types: ['app', 'routes', 'features'] } },
            allow: { to: { element: { type: 'features', fileInternalPath: 'index.ts' } } },
          },
          { from: { element: { type: 'features' } }, allow: { to: { element: { type: 'shared' } } } },
        ],
      },
    ],
    'no-restricted-globals': [
      'error',
      { name: 'fetch', message: 'Call the API through @detaileed/api-client (generated hooks or apiFetch).' },
    ],
  },
});
