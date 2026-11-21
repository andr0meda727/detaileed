'use client';

import { useId, type ComponentPropsWithRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<ComponentPropsWithRef<'select'>, 'children'> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

/**
 * A native select styled like `FormInput` (label above, error below with a stable height). Works with
 * react-hook-form's `register(...)`, which passes `ref`.
 */
export function Select({ label, error, options, id, className = '', ...props }: SelectProps) {
  const fallbackId = useId();
  const selectId = id ?? fallbackId;
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          className={[
            'w-full appearance-none pl-4 pr-10 py-3.5 bg-slate-50 border-2 rounded-xl outline-hidden font-semibold text-sm',
            'transition-all cursor-pointer',
            error
              ? 'border-red-400/50 focus:border-red-500 bg-red-50'
              : 'border-transparent focus:border-cream-warm/50',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
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
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
      <div className="h-4 px-1 flex items-center overflow-hidden">
        {error && <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{error}</span>}
      </div>
    </div>
  );
}
