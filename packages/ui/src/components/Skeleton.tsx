import type { CSSProperties } from 'react';
import { cn } from '../lib/cn';

export interface SkeletonProps {
  /** Shape and size; these classes win over the defaults (`rounded-xl`, `h-4 w-32`, …). */
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

/** A placeholder block in the shape of content that is loading: `muted` fill, a pulse that stops for reduced motion. */
export function Skeleton({ className, width, height, circle = false }: SkeletonProps) {
  const style: CSSProperties = { width, height };
  return (
    <div
      aria-hidden="true"
      data-slot="skeleton"
      className={cn(
        'inline-block min-h-[1em] align-middle bg-muted motion-safe:animate-pulse',
        circle ? 'rounded-full' : 'rounded-md',
        className,
      )}
      style={style}
    />
  );
}
