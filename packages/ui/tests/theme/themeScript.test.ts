import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { THEME_STORAGE_KEY, themeInitScript } from '../../src/theme/themeScript';
import { mockSystemTheme, resetDocumentTheme } from './matchMediaMock';

const root = document.documentElement;
let storageListeners: EventListenerOrEventListenerObject[] = [];

/** Runs the script as the page would, keeping its window listeners so the next test starts clean. */
function runScript() {
  const addEventListener = window.addEventListener.bind(window);
  const spy = vi.spyOn(window, 'addEventListener').mockImplementation((type, listener, options) => {
    if (type === 'storage') storageListeners.push(listener);
    addEventListener(type, listener, options);
  });
  new Function(themeInitScript)();
  spy.mockRestore();
}

function otherTabSaves(value: string) {
  window.localStorage.setItem(THEME_STORAGE_KEY, value);
  window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: value }));
}

beforeEach(resetDocumentTheme);

afterEach(() => {
  storageListeners.forEach((listener) => window.removeEventListener('storage', listener));
  storageListeners = [];
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('themeInitScript', () => {
  it('applies a stored dark theme', () => {
    mockSystemTheme(false);
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    runScript();
    expect(root.dataset.theme).toBe('dark');
    expect(root.style.colorScheme).toBe('dark');
  });

  it('applies a stored light theme even when the OS is dark', () => {
    mockSystemTheme(true);
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
    runScript();
    expect(root.dataset.theme).toBe('light');
    expect(root.style.colorScheme).toBe('light');
  });

  it.each([['system'], [null], ['purple']])('follows the OS when the stored value is %s', (stored) => {
    mockSystemTheme(true);
    if (stored) window.localStorage.setItem(THEME_STORAGE_KEY, stored);
    runScript();
    expect(root.dataset.theme).toBe('dark');
  });

  it('switches live when the OS setting changes and the choice is system', () => {
    const media = mockSystemTheme(false);
    window.localStorage.setItem(THEME_STORAGE_KEY, 'system');
    runScript();
    expect(root.dataset.theme).toBe('light');
    media.setDark(true);
    expect(root.dataset.theme).toBe('dark');
    expect(root.style.colorScheme).toBe('dark');
  });

  it('ignores OS changes when a fixed theme is chosen', () => {
    const media = mockSystemTheme(false);
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
    runScript();
    media.setDark(true);
    expect(root.dataset.theme).toBe('light');
  });

  it('applies a choice saved in another tab', () => {
    mockSystemTheme(false);
    runScript();
    otherTabSaves('dark');
    expect(root.dataset.theme).toBe('dark');
  });

  it('leaves the page to the CSS media query when storage is blocked', () => {
    mockSystemTheme(true);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    runScript();
    expect(root.dataset.theme).toBeUndefined();
  });

  it('works without matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined);
    runScript();
    expect(root.dataset.theme).toBe('light');
  });

  it('is plain ES5, so it runs inline without a build step', () => {
    expect(themeInitScript).not.toMatch(/=>|\bconst\b|\blet\b|`/);
  });
});
