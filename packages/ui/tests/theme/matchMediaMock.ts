import { vi } from 'vitest';

export interface MediaMock {
  /** Changes the OS setting and notifies the listeners, like a real MediaQueryList. */
  setDark: (dark: boolean) => void;
}

/** Replaces window.matchMedia with one whose `(prefers-color-scheme: dark)` answer the test controls. */
export function mockSystemTheme(initialDark: boolean): MediaMock {
  let dark = initialDark;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const list = {
    get matches() {
      return dark;
    },
    media: '(prefers-color-scheme: dark)',
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
  };
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => list),
  );
  return {
    setDark: (next) => {
      dark = next;
      listeners.forEach((listener) => listener({ matches: next } as MediaQueryListEvent));
    },
  };
}

/** Resets what the theme code touches on the document. */
export function resetDocumentTheme(): void {
  delete document.documentElement.dataset.theme;
  document.documentElement.style.colorScheme = '';
  window.localStorage.clear();
}
