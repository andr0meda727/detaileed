import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle, type LucideIcon } from 'lucide-react';
import { cn } from '../lib/cn';

export type AlertTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  /** Replaces the tone's icon. */
  icon?: LucideIcon;
  /** A button or link on the right, e.g. "Spróbuj ponownie". */
  action?: ReactNode;
  className?: string;
}

const tones: Record<AlertTone, { box: string; accent: string; icon: LucideIcon }> = {
  neutral: { box: 'bg-subtle border-border', accent: 'text-foreground', icon: Info },
  info: { box: 'bg-info-soft border-transparent', accent: 'text-info', icon: Info },
  success: { box: 'bg-success-soft border-transparent', accent: 'text-success', icon: CheckCircle2 },
  warning: { box: 'bg-warning-soft border-transparent', accent: 'text-warning', icon: AlertTriangle },
  danger: { box: 'bg-danger-soft border-transparent', accent: 'text-danger', icon: XCircle },
};

/**
 * A message inside the page: an error with a retry, a notice, a confirmation. The danger tone is announced at once
 * (`role="alert"`); the others politely (`role="status"`).
 */
export function Alert({ tone = 'neutral', title, children, icon, action, className }: AlertProps) {
  const { box, accent, icon: ToneIcon } = tones[tone];
  const Icon = icon ?? ToneIcon;
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex flex-wrap items-start gap-3 rounded-lg border px-4 py-3 text-sm', box, className)}
    >
      <Icon size={16} strokeWidth={1.75} aria-hidden className={cn('mt-0.5 shrink-0', accent)} />
      <div className="flex min-w-48 flex-1 basis-0 flex-col gap-0.5">
        {title && <p className={cn('font-medium', accent)}>{title}</p>}
        {children && <div className="text-foreground">{children}</div>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2 max-sm:w-full max-sm:pl-7">{action}</div>}
    </div>
  );
}
