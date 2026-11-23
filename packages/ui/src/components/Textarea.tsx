'use client';

import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { FieldShell } from './FieldShell';
import { controlClasses, useFieldIds } from './fieldParts';

export interface TextareaProps extends ComponentPropsWithRef<'textarea'> {
  label?: string;
  /** Shown below in `text-danger`, linked with `aria-describedby`; also sets `aria-invalid`. */
  error?: string;
  /** Help text below the field, linked with `aria-describedby`. */
  hint?: ReactNode;
}

/**
 * A multi-line text field styled like `FormInput` (label above, hint or error below), resizable vertically.
 * `className` goes on the `<textarea>`. Works with react-hook-form's `register(...)`, which passes `ref`.
 */
export function Textarea({
  label,
  error,
  hint,
  id,
  rows = 3,
  className,
  'aria-describedby': describedBy,
  ...props
}: TextareaProps) {
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
      <textarea
        id={ids.controlId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids.describedBy}
        className={cn(controlClasses(Boolean(error)), 'min-h-20 resize-y px-3 py-2 leading-relaxed', className)}
        {...props}
      />
    </FieldShell>
  );
}
