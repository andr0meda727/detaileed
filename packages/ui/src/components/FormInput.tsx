'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { FieldShell } from './FieldShell';
import { controlClasses, useFieldIds } from './fieldParts';

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Shown below in `text-danger`, linked with `aria-describedby`; also sets `aria-invalid`. */
  error?: string;
  /** Help text below the field, linked with `aria-describedby`. */
  hint?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/**
 * A text input with its label above and the hint or error below. `className` goes on the `<input>`. Works with
 * react-hook-form's `register(...)`, which passes `ref`.
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, 'aria-describedby': describedBy, ...props }, ref) => {
    const ids = useFieldIds({ id, error, hint, describedBy });
    return (
      <FieldShell
        label={label}
        hint={hint}
        error={error}
        controlId={ids.controlId}
        hintId={ids.hintId}
        errorId={ids.errorId}
      >
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-faint">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={ids.controlId}
            aria-invalid={error ? true : undefined}
            aria-describedby={ids.describedBy}
            className={cn(
              controlClasses(Boolean(error)),
              'h-9 px-3',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              className,
            )}
            {...props}
          />
          {rightIcon && <div className="absolute right-3 top-1/2 flex -translate-y-1/2 text-faint">{rightIcon}</div>}
        </div>
      </FieldShell>
    );
  },
);

FormInput.displayName = 'FormInput';
