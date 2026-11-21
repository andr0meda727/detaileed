import type { ReactNode } from 'react';

export type BadgeTone = 'brand' | 'amber' | 'success' | 'neutral' | 'danger';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  /** Any CSS colour (e.g. a status colour from the API); overrides `tone`. */
  color?: string | null;
  size?: BadgeSize;
  className?: string;
}

const tones: Record<BadgeTone, string> = {
  brand: 'text-green-deep bg-green-deep/5 border-green-deep/15',
  amber: 'text-amber bg-amber/10 border-amber/30',
  success: 'text-green-light bg-green-pale/30 border-green-pale',
  neutral: 'text-slate-500 bg-slate-50 border-slate-200',
  danger: 'text-red-500 bg-red-50 border-red-200',
};

const sizes: Record<BadgeSize, string> = {
  sm: 'px-2.5 py-1 rounded-lg border text-[9px]',
  md: 'px-4 py-2 rounded-full border text-[10px]',
  lg: 'px-5 py-2.5 rounded-2xl border-2 text-[11px]',
};

/** A small uppercase label: a status, a role, a count. Tinted by `tone`, or by any `color`. */
export function Badge({ children, tone = 'brand', color, size = 'md', className = '' }: BadgeProps) {
  const style = color
    ? {
        color,
        borderColor: `color-mix(in srgb, ${color} 25%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)`,
      }
    : undefined;
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 font-bold uppercase tracking-widest',
        sizes[size],
        color ? '' : tones[tone],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {children}
    </span>
  );
}
