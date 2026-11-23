'use client';

import { useId } from 'react';
import { cn } from '../lib/cn';
import { MARK_SHAPES } from './logoMark';

export interface LogoMarkProps {
  /** Width and height in px (default 24). */
  size?: number;
  /** Accessible name; without it the mark is decorative. */
  title?: string;
  className?: string;
}

/** The mark alone: a rounded square in `currentColor` with the "d" cut out. */
export function LogoMark({ size = 24, title, className }: LogoMarkProps) {
  const maskId = `${useId()}-d`;
  const { ring, stem } = MARK_SHAPES;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}
    >
      <mask id={maskId}>
        <rect width="24" height="24" fill="white" />
        <circle cx={ring.cx} cy={ring.cy} r={ring.r} fill="none" stroke="black" strokeWidth={ring.strokeWidth} />
        <rect x={stem.x} y={stem.y} width={stem.width} height={stem.height} rx={stem.rx} fill="black" />
      </mask>
      <rect width="24" height="24" rx="6" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
}

export interface LogoProps {
  /** `full` = mark + "detaileed" wordmark (default), `mark` = the mark only. */
  variant?: 'full' | 'mark';
  /** Height of the mark in px (default 24); the wordmark scales with it. */
  size?: number;
  className?: string;
}

/**
 * The Detaileed logo in `currentColor`, so it takes the text colour of wherever it sits (`text-foreground` on the
 * page, `text-primary-foreground` on a primary fill). Named "Detaileed" for screen readers.
 */
export function Logo({ variant = 'full', size = 24, className }: LogoProps) {
  if (variant === 'mark') return <LogoMark size={size} title="Detaileed" className={className} />;
  return (
    <span
      role="img"
      aria-label="Detaileed"
      className={cn('inline-flex items-center gap-2 font-semibold tracking-tight', className)}
      style={{ fontSize: Math.round(size * 0.65) }}
    >
      <LogoMark size={size} />
      <span aria-hidden>detaileed</span>
    </span>
  );
}
