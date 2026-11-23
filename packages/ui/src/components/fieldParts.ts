import { useId, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { focusRing } from '../lib/focusRing';

/** Classes of a text-like control (input, select, textarea): surface fill, strong border, focus ring. */
export function controlClasses(invalid: boolean): string {
  return cn(
    'w-full rounded-md border bg-surface text-sm text-foreground transition-colors duration-150',
    'placeholder:text-faint disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground',
    focusRing,
    invalid ? 'border-danger' : 'border-border-strong',
  );
}

interface FieldIdsInput {
  id?: string;
  error?: string;
  hint?: ReactNode;
  describedBy?: string;
}

/** Ids that tie a control to its label, hint and error (`aria-describedby`). */
export function useFieldIds({ id, error, hint, describedBy }: FieldIdsInput) {
  const fallbackId = useId();
  const controlId = id ?? fallbackId;
  const hintId = `${controlId}-hint`;
  const errorId = `${controlId}-error`;
  const ids = [describedBy, hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');
  return { controlId, hintId, errorId, describedBy: ids || undefined };
}
