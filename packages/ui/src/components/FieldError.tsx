import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface FieldErrorProps {
  /** Point the control's `aria-describedby` at this id. */
  id?: string;
  /** The message; nothing is rendered without one. */
  children?: ReactNode;
  className?: string;
}

/**
 * A field's error message in `text-danger`, for controls that aren't a `FormInput`/`Select`/`Textarea` (those show
 * their `error` themselves). Link it from the control with `aria-describedby` and set `aria-invalid` there.
 */
export function FieldError({ id, children, className }: FieldErrorProps) {
  if (children === undefined || children === null || children === '' || children === false) return null;
  return (
    <p id={id} className={cn('text-xs text-danger', className)}>
      {children}
    </p>
  );
}
