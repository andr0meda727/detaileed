'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useIsClient } from '../hooks/useIsClient';
import { cn } from '../lib/cn';
import { focusRing } from '../lib/focusRing';
import type { ToastMessage, ToastType } from './useToast';

/** How long a toast stays; hovering or focusing it holds it, and the timer starts again on leaving. */
export const TOAST_DURATION_MS = 5000;
/** The fade-out before a toast leaves the DOM. */
const EXIT_MS = 150;

const icons: Record<ToastType, { icon: typeof Info; className: string }> = {
  success: { icon: CheckCircle2, className: 'text-success' },
  error: { icon: XCircle, className: 'text-danger' },
  info: { icon: Info, className: 'text-info' },
};

interface ToastItemProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [closing, setClosing] = useState(false);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (closing) {
      const timer = setTimeout(() => onRemove(toast.id), EXIT_MS);
      return () => clearTimeout(timer);
    }
    if (held) return;
    const timer = setTimeout(() => setClosing(true), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [closing, held, toast.id, onRemove]);

  const { icon: Icon, className: iconClass } = icons[toast.type];
  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-lg',
        'transition-opacity duration-150 motion-safe:animate-fade-in',
        closing && 'opacity-0',
      )}
    >
      <Icon size={16} strokeWidth={1.75} aria-hidden className={cn('mt-0.5 shrink-0', iconClass)} />
      <p className="min-w-0 flex-1">{toast.message}</p>
      <button
        type="button"
        onClick={() => setClosing(true)}
        aria-label="Zamknij"
        className={cn(
          '-mr-1 flex size-6 shrink-0 items-center justify-center rounded text-faint transition-colors duration-150 hover:bg-muted hover:text-foreground',
          focusRing,
        )}
      >
        <X size={14} strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

/** The stack in the bottom-right corner (full width at the bottom on phones). */
export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  const isClient = useIsClient();
  if (!isClient) return null;
  return createPortal(
    <section
      aria-label="Powiadomienia"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-200 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-90"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </section>,
    document.body,
  );
}
