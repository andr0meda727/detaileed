'use client';

import { useId, type ComponentProps, type ReactNode } from 'react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { Check, Minus } from 'lucide-react';
import { cn } from '../lib/cn';
import { focusRingClass } from './interactiveStyles';

export interface CheckboxProps extends ComponentProps<typeof CheckboxPrimitive.Root> {
  /** A visible label next to the box; without one, wrap the box in a `<label>` or give it `aria-label`. */
  label?: ReactNode;
  /** Helper text under the label, linked as the description. */
  description?: ReactNode;
}

/**
 * A checkbox on Radix Checkbox (`role="checkbox"`, Space toggles, `checked="indeterminate"` shows a dash). Use it
 * controlled (`checked` + `onCheckedChange`) or with `defaultChecked`; inside a form it submits `name`/`value`.
 * It also works inside a surrounding `<label>`, so `getByLabelText` finds it either way.
 */
export function Checkbox({ label, description, className, id, ...props }: CheckboxProps) {
  const autoId = useId();
  const boxId = id ?? autoId;
  const descriptionId = `${boxId}-description`;

  const box = (
    <CheckboxPrimitive.Root
      id={boxId}
      aria-describedby={description ? descriptionId : undefined}
      className={cn(
        'peer inline-flex size-4 shrink-0 items-center justify-center rounded-sm border border-border-strong',
        'bg-surface text-primary-foreground transition-colors duration-150',
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
        'data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary',
        'disabled:cursor-not-allowed disabled:opacity-50',
        focusRingClass,
        !label && className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        {props.checked === 'indeterminate' ? (
          <Minus className="size-3" strokeWidth={3} aria-hidden />
        ) : (
          <Check className="size-3" strokeWidth={3} aria-hidden />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );

  if (!label) return box;

  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <span className="flex h-5 items-center">{box}</span>
      <div className="grid gap-0.5">
        <label
          htmlFor={boxId}
          className={cn(
            'text-sm font-medium leading-5 text-foreground',
            props.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
          )}
        >
          {label}
        </label>
        {description && (
          <p id={descriptionId} className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
