import { cn } from '../lib/cn';
import { initials } from '../lib/initials';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  /** The person's or studio's name; the initials come from it. */
  name: string | null | undefined;
  /** 24, 32 (default) or 40 px. */
  size?: AvatarSize;
  /** Hide it from screen readers when the name is written next to it anyway. */
  decorative?: boolean;
  className?: string;
}

const sizes: Record<AvatarSize, string> = {
  sm: 'size-6 text-xs',
  md: 'size-8 text-xs',
  lg: 'size-10 text-sm',
};

/** A round tile with a name's initials. */
export function Avatar({ name, size = 'md', decorative = false, className }: AvatarProps) {
  const a11y = decorative
    ? ({ 'aria-hidden': true } as const)
    : ({ role: 'img', 'aria-label': name?.trim() || 'Brak nazwy' } as const);
  return (
    <span
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full border border-border bg-muted font-medium text-muted-foreground',
        sizes[size],
        className,
      )}
      {...a11y}
    >
      {initials(name)}
    </span>
  );
}
