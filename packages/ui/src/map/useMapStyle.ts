'use client';

import { useTheme } from '../theme/useTheme';
import { MAP_STYLES } from './geo';

/** The map style to use: the app's own (env) style when given, else OpenFreeMap's style for the theme shown. */
export function useMapStyle(styleUrl: string | undefined): string {
  const { resolved } = useTheme();
  return styleUrl || MAP_STYLES[resolved];
}
