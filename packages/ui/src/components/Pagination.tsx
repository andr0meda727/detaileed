import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/cn';
import { Button } from './Button';

export interface PaginationProps {
  /** The current page, from 1. */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Accessible name of the navigation (default "Stronicowanie"). */
  label?: string;
  className?: string;
}

/** Previous / next buttons with "Strona X z Y" between them. Renders nothing when everything fits on one page. */
export function Pagination({ page, totalPages, onPageChange, label = 'Stronicowanie', className }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label={label} className={cn('flex items-center justify-between gap-3', className)}>
      <Button
        variant="secondary"
        size="sm"
        icon={ChevronLeft}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Poprzednia
      </Button>
      <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
        Strona {page} z {totalPages}
      </p>
      <Button
        variant="secondary"
        size="sm"
        icon={ChevronRight}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="flex-row-reverse"
      >
        Następna
      </Button>
    </nav>
  );
}
