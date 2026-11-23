import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { FieldError } from './FieldError';

interface FieldShellProps {
  label?: string;
  controlId: string;
  hint?: ReactNode;
  hintId: string;
  error?: string;
  errorId: string;
  /**
   * Keep a line for the hint or error under the control even while there is none, so a form doesn't jump when an
   * error appears. Without it the line collapses until there is something to show (inline controls in a row).
   */
  reserveMessage: boolean;
  children: ReactNode;
}

/** Label above, the control, then the hint or the error below (in a slot of stable height when `reserveMessage`). */
export function FieldShell({
  label,
  controlId,
  hint,
  hintId,
  error,
  errorId,
  reserveMessage,
  children,
}: FieldShellProps) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label htmlFor={controlId} className="text-[13px] font-medium text-foreground">
          {label}
        </label>
      )}
      {children}
      <div
        data-slot="field-message"
        className={cn('flex flex-col gap-0.5', reserveMessage ? 'min-h-4' : !hint && !error && 'hidden')}
      >
        {hint && (
          <p id={hintId} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}
        <FieldError id={errorId}>{error}</FieldError>
      </div>
    </div>
  );
}
