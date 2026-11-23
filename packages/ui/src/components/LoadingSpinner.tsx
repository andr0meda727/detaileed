import { Loader2 } from 'lucide-react';
import { cn } from '../lib/cn';

export interface LoadingSpinnerProps {
  /** Spinner size in px (default 20). */
  size?: number;
  /** Classes of the wrapper. */
  className?: string;
  /** Centre it in a full-height page (route loading) instead of a padded block. */
  fullPage?: boolean;
  /** What screen readers hear (default "Ładowanie…"). */
  label?: string;
}

/**
 * A spinner for actions and whole-page loads; for content, prefer `Skeleton`s in its shape. Announced politely as
 * a status.
 */
export function LoadingSpinner({ size = 20, className, fullPage = false, label = 'Ładowanie…' }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex items-center justify-center text-muted-foreground',
        fullPage ? 'min-h-screen bg-background' : 'py-16',
        className,
      )}
    >
      <Loader2 size={size} strokeWidth={1.75} className="animate-spin" aria-hidden />
      <span className="sr-only">{label}</span>
    </div>
  );
}
