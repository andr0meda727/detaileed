'use client';

import { useId, type ComponentProps, type ReactNode } from 'react';
import { RadioGroup } from 'radix-ui';
import { cn } from '../lib/cn';
import { focusRingClass } from './interactiveStyles';

export interface RadioCardOption<T extends string> {
  value: T;
  /** The radio's accessible name. */
  label: string;
  /** A second line under the label (also the radio's description). */
  description?: ReactNode;
  /** Shown at the end of the card: a price, a time, a badge. */
  trailing?: ReactNode;
  disabled?: boolean;
}

export interface RadioCardGroupProps<T extends string> extends Omit<
  ComponentProps<typeof RadioGroup.Root>,
  'value' | 'defaultValue' | 'onValueChange' | 'children'
> {
  options: readonly RadioCardOption<T>[];
  /** The selected value; `''` or `undefined` while nothing is chosen. */
  value: T | '' | undefined;
  onValueChange: (value: T) => void;
  /** Grid columns from `sm` up (always one column on phones). */
  columns?: 1 | 2 | 3;
}

const grid = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' } as const;

/**
 * One choice among options shown as cards (a time slot, a vehicle, a plan), on Radix RadioGroup: a `radiogroup`
 * with one tab stop and arrow keys between the cards. Each card is a `radio` named by its label alone, so the
 * description and trailing content never change its name. Name the group with `aria-label` or `aria-labelledby`.
 */
export function RadioCardGroup<T extends string>({
  options,
  value,
  onValueChange,
  columns = 1,
  className,
  ...props
}: RadioCardGroupProps<T>) {
  const baseId = useId();

  return (
    <RadioGroup.Root
      value={value ?? ''}
      onValueChange={(next) => onValueChange(next as T)}
      className={cn('grid gap-2', grid[columns], className)}
      {...props}
    >
      {options.map((option, index) => {
        const labelId = `${baseId}-${index}-label`;
        const descriptionId = `${baseId}-${index}-description`;
        return (
          <RadioGroup.Item
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            aria-labelledby={labelId}
            aria-describedby={option.description ? descriptionId : undefined}
            className={cn(
              'group flex w-full items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-left',
              'transition-colors duration-150 hover:bg-muted',
              'data-[state=checked]:border-primary data-[state=checked]:bg-muted',
              'disabled:cursor-not-allowed disabled:opacity-50',
              focusRingClass,
            )}
          >
            <span
              aria-hidden
              className={cn(
                'flex size-4 shrink-0 items-center justify-center rounded-full border border-border-strong',
                'transition-colors duration-150 group-data-[state=checked]:border-primary',
              )}
            >
              <RadioGroup.Indicator className="size-2 rounded-full bg-primary" />
            </span>
            <span className="grid min-w-0 flex-1 gap-0.5">
              <span id={labelId} className="text-sm font-medium text-foreground">
                {option.label}
              </span>
              {option.description && (
                <span id={descriptionId} className="text-xs text-muted-foreground">
                  {option.description}
                </span>
              )}
            </span>
            {option.trailing && <span className="shrink-0 text-sm text-muted-foreground">{option.trailing}</span>}
          </RadioGroup.Item>
        );
      })}
    </RadioGroup.Root>
  );
}
