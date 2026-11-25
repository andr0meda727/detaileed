'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemePreference } from '../theme';
import { SegmentedControl, type SegmentedControlOption, type SegmentedControlSize } from './SegmentedControl';

const options: readonly SegmentedControlOption<ThemePreference>[] = [
  { value: 'system', label: 'Systemowy', icon: Monitor },
  { value: 'light', label: 'Jasny', icon: Sun },
  { value: 'dark', label: 'Ciemny', icon: Moon },
];

export interface ThemeSwitchProps {
  size?: SegmentedControlSize;
  /** Icons only (a header); the labels stay as the segments' accessible names. */
  iconOnly?: boolean;
  fullWidth?: boolean;
  className?: string;
}

/**
 * The theme choice (Systemowy / Jasny / Ciemny), saved on this device through `useTheme()`. On the server and during
 * hydration it shows `system`, then the stored choice.
 */
export function ThemeSwitch({ size = 'sm', iconOnly = false, fullWidth = false, className }: ThemeSwitchProps) {
  const { theme, setTheme } = useTheme();
  return (
    <SegmentedControl
      aria-label="Motyw"
      options={options}
      value={theme}
      onValueChange={setTheme}
      size={size}
      iconOnly={iconOnly}
      fullWidth={fullWidth}
      className={className}
    />
  );
}
