import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

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
export const react = tseslint.config(...base, {
  files: ['**/*.{ts,tsx}'],
  languageOptions: { globals: globals.browser },
  plugins: {
    'react-hooks': reactHooks,
    'react-refresh': reactRefresh,
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    // Existing effects get rewritten in the router/feature migration; make this an error afterwards.
    'react-hooks/set-state-in-effect': 'warn',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
});
