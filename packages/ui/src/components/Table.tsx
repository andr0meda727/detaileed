import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** Classes of the scroll wrapper (the table itself takes `className`). */
  wrapperClassName?: string;
}

/**
 * A data table: row borders only, a quiet head, no zebra stripes. It scrolls sideways inside its wrapper on narrow
 * screens, never the page; give it a `min-w-*` when its columns need room. Put it in a `Card` (no padding).
 */
export function Table({ className, wrapperClassName, ...props }: TableProps) {
  return (
    <div className={cn('w-full overflow-x-auto', wrapperClassName)}>
      <table className={cn('w-full border-collapse text-sm text-foreground', className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-subtle', className)} {...props} />;
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('[&>tr:last-child]:border-b-0', className)} {...props} />;
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b border-border transition-colors duration-150', className)} {...props} />;
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

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3 align-middle', className)} {...props} />;
}
