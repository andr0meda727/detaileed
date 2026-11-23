'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
  DARK_QUERY,
  THEME_PREFERENCES,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemePreference,
} from './themeScript';

/** Fired on window when this tab saves a choice (the storage event only reaches other tabs). */
const CHANGE_EVENT = 'detaileed-theme-change';

function isPreference(value: unknown): value is ThemePreference {
  return THEME_PREFERENCES.includes(value as ThemePreference);
}

/** The choice made in this page when storage is blocked (privacy settings, sandboxed frame). */
let unsavedPreference: ThemePreference | null = null;

function readPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isPreference(stored) ? stored : 'system';
  } catch {
    return unsavedPreference ?? 'system';
  }
}

function darkMedia(): MediaQueryList | null {
  return typeof window.matchMedia === 'function' ? window.matchMedia(DARK_QUERY) : null;
}

function readSystemDark(): boolean {
  return darkMedia()?.matches ?? false;
}

function subscribe(onChange: () => void): () => void {
  const media = darkMedia();
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY || event.key === null) onChange();
  };
  media?.addEventListener('change', onChange);
  window.addEventListener('storage', onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    media?.removeEventListener('change', onChange);
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function resolveTheme(theme: ThemePreference, systemDark: boolean): ResolvedTheme {
  if (theme === 'system') return systemDark ? 'dark' : 'light';
  return theme;
}

/** Sets the theme on `<html>` the way the init script does. */
function applyTheme(theme: ResolvedTheme): void {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

function clearTheme(): void {
  const root = document.documentElement;
  delete root.dataset.theme;
  root.style.colorScheme = '';
}

export interface UseTheme {
  /** The stored choice; `system` when nothing (or something invalid) is stored. */
  theme: ThemePreference;
  /** The theme shown: the choice, or the OS setting for `system`. */
  resolved: ResolvedTheme;
  /** Saves the choice on this device and applies it at once. */
  setTheme: (theme: ThemePreference) => void;
}

/**
 * The theme choice and the theme shown, kept in sync with localStorage (also across tabs) and the OS setting.
 * On the server and during hydration it reports `system` / `light`; the real values follow right after.
 * `<html>` itself is kept up to date by `themeInitScript`, which must be on the page.
 */
export function useTheme(): UseTheme {
  const theme = useSyncExternalStore(subscribe, readPreference, () => 'system' as const);
  const systemDark = useSyncExternalStore(subscribe, readSystemDark, () => false);

  const setTheme = useCallback((next: ThemePreference) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
      unsavedPreference = null;
    } catch {
      // Storage blocked: the choice lasts until the page reloads.
      unsavedPreference = next;
    }
    if (unsavedPreference === 'system') {
      // The init script can't follow the OS without storage; the CSS media query can, without data-theme.
      clearTheme();
    } else {
      applyTheme(resolveTheme(next, readSystemDark()));
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { theme, resolved: resolveTheme(theme, systemDark), setTheme };
}
