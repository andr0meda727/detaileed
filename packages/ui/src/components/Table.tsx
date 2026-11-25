'use client';

import { createContext, useContext } from 'react';
import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

/** Whether the table turns its rows into stacked cards below `md` (768px). */
const StackedContext = createContext(false);

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** Classes of the scroll wrapper (the table itself takes `className`). */
  wrapperClassName?: string;
  /**
   * Below `md` (phones), show each row as a stacked card instead of a table row: the head is hidden, cells flow into
   * a two-column grid and show their `label` above the value. Mark the cells with `stack` (see `TableCell`). From `md`
   * up the table looks as usual, and its `min-w-*` applies only there.
   */
  stacked?: boolean;
}

/**
 * A data table: row borders only, a quiet head, no zebra stripes. It scrolls sideways inside its wrapper on narrow
 * screens, never the page; give it a `min-w-*` when its columns need room, or `stacked` to show cards on phones. Put
 * it in a `Card` (no padding).
 */
export function Table({ className, wrapperClassName, stacked = false, ...props }: TableProps) {
  return (
    <StackedContext.Provider value={stacked}>
      {/* `relative` keeps absolutely placed content (an `sr-only` head) inside the scroll box, not the page. */}
      <div className={cn('relative w-full overflow-x-auto', wrapperClassName)}>
        <table
          className={cn(
            'w-full border-collapse text-sm text-foreground',
            className,
            stacked && 'max-md:block max-md:min-w-0',
          )}
          {...props}
        />
      </div>
    </StackedContext.Provider>
  );
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  const stacked = useContext(StackedContext);
  return <thead className={cn('bg-subtle', className, stacked && 'max-md:hidden')} {...props} />;
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  const stacked = useContext(StackedContext);
  return <tbody className={cn('[&>tr:last-child]:border-b-0', className, stacked && 'max-md:block')} {...props} />;
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  const stacked = useContext(StackedContext);
  return (
    <tr
      className={cn(
        'border-b border-border transition-colors duration-150',
        className,
        stacked &&
          'max-md:relative max-md:grid max-md:grid-cols-2 max-md:gap-x-4 max-md:gap-y-3 max-md:px-4 max-md:py-3',
      )}
      {...props}
    />
  );
}

export function TableHead({ className, scope = 'col', ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope={scope}
      className={cn('h-10 px-4 text-left align-middle text-xs font-medium whitespace-nowrap text-faint', className)}
      {...props}
    />
  );
}

/**
 * Where a cell goes in a stacked row (`Table stacked`, below `md`):
 * - `primary`: the first line across the card (name, time), without a label, moved to the top;
 * - `full`: across the card, with its label;
 * - `actions`: pinned to the card's top-right corner (menus, icon buttons);
 * - `hidden`: left out on phones (repeated elsewhere in the card);
 * - none: one cell of the two-column label/value grid.
 */
export type TableCellStack = 'primary' | 'full' | 'actions' | 'hidden';

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /** The column name shown above the value in a stacked row (usually the column's head text). */
  label?: string;
  stack?: TableCellStack;
}

const STACK_CLASSES: Record<TableCellStack | 'cell', string> = {
  primary: 'max-md:order-first max-md:col-span-2 max-md:pr-10',
  full: 'max-md:col-span-2',
  actions: 'max-md:absolute max-md:top-2 max-md:right-2 max-md:w-auto',
  hidden: 'max-md:hidden',
  cell: '',
};

const LABEL_CLASSES =
  'max-md:before:mb-0.5 max-md:before:block max-md:before:font-sans max-md:before:text-xs max-md:before:font-medium max-md:before:text-faint max-md:before:content-[attr(data-label)]';

export function TableCell({ className, label, stack, colSpan, ...props }: TableCellProps) {
  const stacked = useContext(StackedContext);
  // A cell spanning several columns (an empty state, a note) spans the whole card too.
  const place = stack ?? (colSpan && colSpan > 1 ? 'full' : 'cell');
  const showLabel = stacked && label && place !== 'primary' && place !== 'actions';
  return (
    <td
      colSpan={colSpan}
      data-label={showLabel ? label : undefined}
      className={cn(
        'px-4 py-3 align-middle',
        className,
        stacked && ['max-md:block max-md:min-w-0 max-md:p-0 max-md:text-left', STACK_CLASSES[place]],
        showLabel && LABEL_CLASSES,
      )}
      {...props}
    />
  );
}
