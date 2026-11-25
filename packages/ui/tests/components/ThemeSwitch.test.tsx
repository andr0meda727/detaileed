import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeSwitch } from '../../src/components/ThemeSwitch';
import { THEME_STORAGE_KEY } from '../../src/theme/themeScript';
import { mockSystemTheme, resetDocumentTheme } from '../theme/matchMediaMock';

beforeEach(resetDocumentTheme);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ThemeSwitch', () => {
  it('shows the three choices with the stored one checked', () => {
    mockSystemTheme(false);
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    render(<ThemeSwitch />);
    expect(screen.getByRole('radiogroup', { name: 'Motyw' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio').map((radio) => radio.textContent)).toEqual(['Systemowy', 'Jasny', 'Ciemny']);
    expect(screen.getByRole('radio', { name: 'Ciemny' })).toHaveAttribute('aria-checked', 'true');
  });

  it('saves and applies a new choice', () => {
    mockSystemTheme(true);
    render(<ThemeSwitch />);
    expect(screen.getByRole('radio', { name: 'Systemowy' })).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(screen.getByRole('radio', { name: 'Jasny' }));
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(screen.getByRole('radio', { name: 'Jasny' })).toHaveAttribute('aria-checked', 'true');
  });

  it('keeps the names when only icons are shown', () => {
    mockSystemTheme(false);
    render(<ThemeSwitch iconOnly />);
    expect(screen.getByRole('radio', { name: 'Ciemny' })).toBeInTheDocument();
    expect(screen.queryByText('Ciemny')).not.toBeInTheDocument();
  });
});
