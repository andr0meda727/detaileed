import type { ReactNode } from 'react';
import { FieldError } from './FieldError';

interface FieldShellProps {
  label?: string;
  controlId: string;
  hint?: ReactNode;
  hintId: string;
  error?: string;
  errorId: string;
  children: ReactNode;
}

/** Label above, the control, then the hint or the error below (in a slot of stable height). */
export function FieldShell({ label, controlId, hint, hintId, error, errorId, children }: FieldShellProps) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label htmlFor={controlId} className="text-[13px] font-medium text-foreground">
          {label}
        </label>
      )}
      {children}
      <div className="flex min-h-4 flex-col gap-0.5">
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
