import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';
import { cn } from '../lib/cn';
import { focusRing } from '../lib/focusRing';

/** `success` is an alias of `primary`, kept for screens written before Grafit. */
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  /** sm = 32px, md = 36px (default), lg = 40px. */
  size?: ButtonSize;
  /** Stretch to the container's width (form submit buttons). */
  fullWidth?: boolean;
  /** Icon shown before the label (or alone, for an icon-only button). */
  icon?: LucideIcon;
  /** Shows a spinner in place of the icon and disables the button (e.g. while saving). */
  loading?: boolean;
}

/** A button has a visible label, or (icon only) an `aria-label` that names it. */
export type ButtonProps = ButtonBaseProps & ({ children: ReactNode } | { children?: never; 'aria-label': string });

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/85',
  success: 'bg-primary text-primary-foreground hover:bg-primary/85',
  secondary: 'border border-border-strong bg-transparent text-foreground hover:bg-muted',
  ghost: 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
  danger: 'bg-danger text-danger-foreground hover:bg-danger/85',
};

const sizes: Record<ButtonSize, { box: string; square: string }> = {
  sm: { box: 'h-8 px-3 gap-1.5', square: 'size-8' },
  md: { box: 'h-9 px-3.5 gap-2', square: 'size-9' },
  lg: { box: 'h-10 px-4 gap-2', square: 'size-10' },
};

/**
 * The app's button. `type` defaults to "button" (pass `type="submit"` for form submits), so a button inside a
 * form never submits it by accident. Use `className` for layout only (margins, width); colours and sizes come
 * from `variant` and `size`. Without children it is a square icon button and needs an `aria-label`.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon: Icon,
  loading = false,
  disabled,
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) {
  const iconOnly = children === undefined || children === null;
  return (
    <button
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium',
        'transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50',
        focusRing,
        variants[variant],
        iconOnly ? sizes[size].square : sizes[size].box,
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" aria-hidden />
      ) : (
        Icon && <Icon size={16} strokeWidth={1.75} aria-hidden />
      )}
      {children}
    </button>
  );
}
