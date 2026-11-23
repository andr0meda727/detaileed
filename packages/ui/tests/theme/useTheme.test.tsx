import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { THEME_STORAGE_KEY } from '../../src/theme/themeScript';
import { useTheme } from '../../src/theme/useTheme';
import { mockSystemTheme, resetDocumentTheme } from './matchMediaMock';

const root = document.documentElement;

beforeEach(resetDocumentTheme);

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('useTheme', () => {
  it('follows the OS when nothing is stored', () => {
    mockSystemTheme(true);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('system');
    expect(result.current.resolved).toBe('dark');
  });

  it('reads the stored choice and ignores invalid values', () => {
    mockSystemTheme(true);
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
    const { result, rerender } = renderHook(() => useTheme());
    expect(result.current).toMatchObject({ theme: 'light', resolved: 'light' });

    act(() => window.localStorage.setItem(THEME_STORAGE_KEY, 'purple'));
    rerender();
    expect(result.current).toMatchObject({ theme: 'system', resolved: 'dark' });
  });

  it('saves a new choice and applies it to the page', () => {
    mockSystemTheme(false);
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme('dark'));
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(result.current).toMatchObject({ theme: 'dark', resolved: 'dark' });
    expect(root.dataset.theme).toBe('dark');
    expect(root.style.colorScheme).toBe('dark');

    act(() => result.current.setTheme('system'));
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('system');
    expect(result.current).toMatchObject({ theme: 'system', resolved: 'light' });
    expect(root.dataset.theme).toBe('light');
  });

  it('updates when the OS setting changes', () => {
    const media = mockSystemTheme(false);
    const { result } = renderHook(() => useTheme());
    expect(result.current.resolved).toBe('light');
    act(() => media.setDark(true));
    expect(result.current.resolved).toBe('dark');
  });

  it('updates when another tab saves a choice', () => {
    mockSystemTheme(false);
    const { result } = renderHook(() => useTheme());
    act(() => {
      window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: 'dark' }));
    });
    expect(result.current.theme).toBe('dark');
  });

  it('keeps the choice in memory when storage is blocked', () => {
    mockSystemTheme(false);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme('dark'));
    expect(result.current.theme).toBe('dark');
    expect(root.dataset.theme).toBe('dark');

    act(() => result.current.setTheme('system'));
    expect(result.current.theme).toBe('system');
    expect(root.dataset.theme).toBeUndefined();
  });

  it('renders system / light on the server', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    function Probe() {
      const { theme, resolved } = useTheme();
      return <span>{`${theme}/${resolved}`}</span>;
    }
    expect(renderToString(<Probe />)).toContain('system/light');
  });
});
