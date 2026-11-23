'use client';

import type { ComponentPropsWithRef, KeyboardEvent } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../lib/cn';
import { focusRing } from '../lib/focusRing';
import { controlClasses } from './fieldParts';

type SearchInputBaseProps = Omit<ComponentPropsWithRef<'input'>, 'type'> & {
  /** Shows a clear button while the (controlled) value isn't empty; Escape clears too. */
  onClear?: () => void;
  /** Classes of the wrapper (the input itself takes `className`). */
  wrapperClassName?: string;
};

/** A search field needs a name: an `aria-label` (it has no visible label) or `aria-labelledby`. */
export type SearchInputProps = SearchInputBaseProps & ({ 'aria-label': string } | { 'aria-labelledby': string });

/** A 36px search field with a search icon and an optional clear button. Forwards `ref` to the `<input>`. */
export function SearchInput({ onClear, wrapperClassName, className, value, onKeyDown, ...props }: SearchInputProps) {
  const canClear = Boolean(onClear) && value !== undefined && value !== null && String(value) !== '';

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.key === 'Escape' && canClear && !event.defaultPrevented) {
      event.preventDefault();
      onClear?.();
    }
  };

  return (
    <div className={cn('relative w-full', wrapperClassName)}>
      <Search
        size={16}
        strokeWidth={1.75}
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
      />
      <input
        type="search"
        value={value}
        onKeyDown={handleKeyDown}
        className={cn(
          controlClasses(false),
          'h-9 pl-9 [&::-webkit-search-cancel-button]:appearance-none',
          canClear ? 'pr-9' : 'pr-3',
          className,
        )}
        {...props}
      />
      {canClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Wyczyść wyszukiwanie"
          className={cn(
            'absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-faint',
            'transition-colors duration-150 hover:bg-muted hover:text-foreground',
            focusRing,
          )}
        >
          <X size={14} strokeWidth={1.75} aria-hidden />
        </button>
      )}
    </div>
  );
}
