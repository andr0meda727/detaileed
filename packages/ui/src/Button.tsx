import type { ButtonHTMLAttributes } from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
export type ButtonSize = 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretch to the container's width (form submit buttons). */
  fullWidth?: boolean;
  /** Icon shown before the label. */
  icon?: LucideIcon;
  /** Shows a spinner in place of the icon and disables the button (e.g. while saving). */
  loading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-green-deep text-cream-warm shadow-lg hover:shadow-xl',
  secondary: 'bg-white text-slate-500 border border-slate-200 hover:text-green-deep hover:border-slate-300',
  success: 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100',
  danger: 'bg-red-50 text-red-500 border border-red-100 hover:bg-red-100',
  ghost: 'text-slate-400 hover:text-green-deep hover:bg-slate-50',
};

const sizes: Record<ButtonSize, { box: string; icon: number }> = {
  md: { box: 'px-5 py-3.5 text-[10px]', icon: 15 },
  lg: { box: 'px-6 py-5 text-[11px]', icon: 16 },
};

/**
 * The app's button. `type` defaults to "button" (pass `type="submit"` for form submits), so a button inside a
 * form never submits it by accident. Use `className` for layout only (margins, width); colours and sizes come
 * from `variant` and `size`.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon: Icon,
  loading = false,
  disabled,
  type = 'button',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const { box, icon } = sizes[size];
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold uppercase tracking-widest',
        'transition-all active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none',
        variants[variant],
        box,
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 size={icon} className="animate-spin" aria-hidden />
      ) : (
        Icon && <Icon size={icon} strokeWidth={2.5} aria-hidden />
      )}
      {children}
    </button>
  );
}
