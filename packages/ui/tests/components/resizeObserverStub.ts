import { vi } from 'vitest';

/** jsdom has no ResizeObserver; Radix popovers (menus, tooltips) measure their trigger with one. */
export function stubResizeObserver(): void {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
}
