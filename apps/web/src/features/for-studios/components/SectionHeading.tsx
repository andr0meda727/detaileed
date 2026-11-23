import type { ReactNode } from 'react';
import { cn } from '@detaileed/ui';

interface SectionHeadingProps {
  /** A short line above the title, naming the section. */
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'start' | 'center';
  className?: string;
}

/** A section's heading: a quiet eyebrow, a large title and an optional line of text below. */
export function SectionHeading({ eyebrow, title, subtitle, align = 'start', className }: SectionHeadingProps) {
  return (
    <div className={cn('reveal flex flex-col gap-4', align === 'center' && 'items-center text-center', className)}>
      <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
      <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
      {subtitle && <p className="max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">{subtitle}</p>}
    </div>
  );
}

/** The quieter second half of a title. */
export function Quiet({ children }: { children: ReactNode }) {
  return <span className="text-muted-foreground">{children}</span>;
}
