import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export type StatTone = 'neutral' | 'success' | 'info' | 'warning' | 'danger';

export interface StatProps {
  label: ReactNode;
  /** The number, already formatted (`formatPln(2340)`, "218"). */
  value: ReactNode;
  /** A short line under the value: a comparison, a source. */
  hint?: ReactNode;
  /** Colours the hint (e.g. success for growth); neutral by default. */
  tone?: StatTone;
  className?: string;
}

const hintTones: Record<StatTone, string> = {
  neutral: 'text-faint',
  success: 'text-success',
  info: 'text-info',
  warning: 'text-warning',
  danger: 'text-danger',
};

/** One key figure: a label, the value in mono with tabular digits, and an optional hint. Put it in a `Card`. */
export function Stat({ label, value, hint, tone = 'neutral', className }: StatProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="text-xs text-faint">{label}</div>
      <div className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground">{value}</div>
      {hint && <div className={cn('text-xs', hintTones[tone])}>{hint}</div>}
    </div>
  );
}
