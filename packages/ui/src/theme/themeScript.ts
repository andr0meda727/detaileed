/** localStorage key of the theme choice, saved per device. */
export const THEME_STORAGE_KEY = 'detaileed-theme';

/** The choice people make: follow the OS (`system`, the default) or a fixed theme. */
export type ThemePreference = 'system' | 'light' | 'dark';

/** The theme actually shown. */
export type ResolvedTheme = 'light' | 'dark';

export const THEME_PREFERENCES: readonly ThemePreference[] = ['system', 'light', 'dark'];

export const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Inline script for the document `<head>`, run before the first paint: reads the stored choice, resolves `system`
 * with the OS setting, and sets `data-theme` and `color-scheme` on `<html>`. It keeps them in sync afterwards too:
 * when the OS setting changes (with `system` stored) and when another tab saves a new choice. Dependency-free and
 * ES5, so it runs as is; if storage is blocked it leaves `<html>` alone and the CSS media query decides.
 *
 * The dashboard keeps a copy in `index.html` (a test checks it matches); the site renders it in the root layout.
 */
export const themeInitScript = `(function () {
  var key = '${THEME_STORAGE_KEY}';
  var media = window.matchMedia ? window.matchMedia('${DARK_QUERY}') : null;
  function apply() {
    var choice = null;
    try {
      choice = window.localStorage.getItem(key);
    } catch (e) {
      return;
    }
    var theme = choice === 'light' || choice === 'dark' ? choice : media && media.matches ? 'dark' : 'light';
    var root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  }
  apply();
  if (media && media.addEventListener) media.addEventListener('change', apply);
  window.addEventListener('storage', function (event) {
    if (event.key === key || event.key === null) apply();
  });
})();`;
