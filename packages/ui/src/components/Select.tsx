'use client';

import type { ComponentPropsWithRef, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/cn';
import { FieldShell } from './FieldShell';
import { controlClasses, useFieldIds } from './fieldParts';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<ComponentPropsWithRef<'select'>, 'children'> {
  label?: string;
  /** Shown below in `text-danger`, linked with `aria-describedby`; also sets `aria-invalid`. */
  error?: string;
  /** Help text below the field, linked with `aria-describedby`. */
  hint?: ReactNode;
  options: SelectOption[];
}

/**
 * A native select styled like `FormInput` (label above, hint or error below). `className` goes on the `<select>`.
 * Works with react-hook-form's `register(...)`, which passes `ref`.
 */
export function Select({
  label,
  error,
  hint,
  options,
  id,
  className,
  'aria-describedby': describedBy,
  ...props
}: SelectProps) {
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
        <select
          id={ids.controlId}
          aria-invalid={error ? true : undefined}
          aria-describedby={ids.describedBy}
          className={cn(controlClasses(Boolean(error)), 'h-9 cursor-pointer appearance-none pl-3 pr-9', className)}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint"
        />
      </div>
    </FieldShell>
  );
}
