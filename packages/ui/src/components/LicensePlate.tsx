import { cn } from '../lib/cn';
import { formatPlate } from '../lib/plate';

export interface LicensePlateProps {
  /** The registration number, e.g. "WX 4821K"; shown upper case. */
  plate: string;
  className?: string;
}

/** A car's registration number in a bordered mono chip. */
export function LicensePlate({ plate, className }: LicensePlateProps) {
  return (
    <span
      className={cn(
        'inline-flex h-5.5 items-center whitespace-nowrap rounded border border-border-strong bg-surface px-1.5 font-mono text-xs font-medium text-foreground tabular-nums',
        className,
      )}
    >
      {formatPlate(plate)}
    </span>
  );
}
