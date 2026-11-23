import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Joins class names (strings, arrays, `{ class: condition }` objects) and lets later Tailwind classes win over
 * earlier ones of the same kind, so a component's `className` prop can override its defaults:
 * `cn('bg-surface px-3', className)`.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
