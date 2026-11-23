import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import boundaries from 'eslint-plugin-boundaries';
import nextPlugin from '@next/eslint-plugin-next';

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

/*
 * Colours come from the design tokens (bg-surface, text-muted-foreground, border-border, …; docs/design-system.md),
 * so both themes work. These patterns flag what bypasses them in class names. esquery regexes can't contain `/`.
 */
const PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
/** Tailwind's default palette with a shade (`text-slate-500`, `hover:bg-red-50`) and plain white or black. */
const PALETTE_CLASS = `/-(${PALETTE})-(50|[1-9]00|950)\\b|\\b(bg|text|border|ring|outline|fill|stroke|from|via|to|divide|decoration|placeholder|caret|accent)-(white|black)\\b/`;
/** The Forest & Cream tokens and utilities removed in phase 11. */
const OLD_CLASS =
  '/-(green-(deep|dark|mid|light|pale)|cream(-warm|-dark)?|amber(-light)?)\\b|\\btext-text-(dim|mid)\\b|\\b(font-serif|font-syne|floating-card|mesh-bg|premium-shadow|bg-brand-gradient)\\b/';
/** Hex and rgb() colours, e.g. in arbitrary values (`bg-[#fff]`, `shadow-[0_0_0_rgba(0,0,0,.1)]`). */
const RAW_COLOUR = '/#[0-9a-fA-F]{3,8}\\b|rgba?\\(/';
/** Class name strings: the className prop and the arguments of cn() / clsx() (one selector, so one report each). */
const CLASS_CONTEXT = ":matches(JSXAttribute[name.name='className'], CallExpression[callee.name=/^(cn|clsx)$/])";
const TOKEN_HINT = 'Use the semantic colour tokens instead (docs/design-system.md).';

const colourRules = [
  // Palette classes and old tokens are flagged in any string, so class maps (`const tones = { … }`) count too.
  ...['Literal[value=PATTERN]', 'TemplateElement[value.raw=PATTERN]'].flatMap((node) => [
    {
      selector: node.replace('PATTERN', PALETTE_CLASS),
      message: `Default Tailwind palette colour in a class name. ${TOKEN_HINT}`,
    },
    {
      selector: node.replace('PATTERN', OLD_CLASS),
      message: `Old Forest & Cream token or utility in a class name. ${TOKEN_HINT}`,
    },
  ]),
  // Hex and rgb() are fine elsewhere (map styles, chart data, API colours), so only class name strings are checked.
  ...[`Literal[value=${RAW_COLOUR}]`, `TemplateElement[value.raw=${RAW_COLOUR}]`].map((node) => ({
    selector: `${CLASS_CONTEXT} ${node}`,
    message: `Hard-coded colour in a class name. ${TOKEN_HINT}`,
  })),
];

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
      'no-restricted-syntax': ['error', ...colourRules],
    },
  },
  {
    // TanStack Router route files export `Route` and keep their components private; the router
    // plugin splits those components into their own modules, so fast refresh still works.
    files: ['**/routes/**/*.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
);

/** React rules + Next.js (App Router, Core Web Vitals) for the customer site. */
export const nextApp = tseslint.config(
  ...react,
  { ignores: ['.next', 'next-env.d.ts'] },
  { ...nextPlugin.configs['core-web-vitals'], files: ['**/*.{ts,tsx}'] },
  {
    // Route files export metadata and config next to their component; Next's own fast refresh handles them.
    files: ['src/app/**/*.{ts,tsx}'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
);

/**
 * Feature-slice architecture for an app's `src`: imports flow app → routes → features → shared, a feature
 * uses another feature only through its index.ts (or server.ts, for server-only code in the customer site), and
 * network calls go through @detaileed/api-client.
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
            allow: { to: { element: { type: 'features', fileInternalPath: ['index.ts', 'server.ts'] } } },
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
