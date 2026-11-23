'use client';

import { useId, type ComponentProps, type ReactNode } from 'react';
import { Switch as SwitchPrimitive } from 'radix-ui';
import { cn } from '../lib/cn';
import { focusRingClass } from './interactiveStyles';

export interface SwitchProps extends ComponentProps<typeof SwitchPrimitive.Root> {
  /** A visible label before the switch; without one, give it `aria-label` or a `<label htmlFor>`. */
  label?: ReactNode;
  /** Helper text under the label, linked as the description. */
  description?: ReactNode;
}

/**
 * An on/off switch for settings that apply at once, on Radix Switch (`role="switch"`, Space toggles). For choices
 * saved with a form, prefer `Checkbox`.
 */
export function Switch({ label, description, className, id, ...props }: SwitchProps) {
  const autoId = useId();
  const switchId = id ?? autoId;
  const descriptionId = `${switchId}-description`;

  const control = (
    <SwitchPrimitive.Root
      id={switchId}
      aria-describedby={description ? descriptionId : undefined}
      className={cn(
        'inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5',
        'bg-border-strong transition-colors duration-150 data-[state=checked]:bg-primary',
        'disabled:cursor-not-allowed disabled:opacity-50',
        focusRingClass,
        !label && className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'pointer-events-none block size-4 rounded-full bg-surface shadow-sm',
          'motion-safe:transition-transform motion-safe:duration-150',
          'data-[state=checked]:translate-x-4 data-[state=checked]:bg-primary-foreground',
        )}
      />
    </SwitchPrimitive.Root>
  );

  if (!label) return control;

  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="grid gap-0.5">
        <label
          htmlFor={switchId}
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
      {control}
    </div>
  );
}
