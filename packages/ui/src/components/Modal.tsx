'use client';

import { useRef, type ReactNode } from 'react';
import { Dialog } from 'radix-ui';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';
import { dialogPanelClass, focusRingClass, overlayClass } from './interactiveStyles';
import { useReturnFocus } from './useReturnFocus';

export type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** One line under the title; also the dialog's accessible description. */
  description?: ReactNode;
  size?: ModalSize;
  /** Extra classes for the panel (layout only). */
  className?: string;
  children: ReactNode;
}

const widths: Record<ModalSize, string> = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-3xl' };

/**
 * The app's dialog, on Radix Dialog: rendered in a portal, with a focus trap, scroll lock and an `overlay` backdrop.
 * Escape, the close button ("Zamknij") and a click on the backdrop call `onClose`; with nested dialogs Escape closes
 * only the top one. Focus moves to the panel on open (so a details view never lands on a destructive button) and
 * returns to the trigger on close.
 */
export function Modal({ isOpen, onClose, title, description, size = 'md', className, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useReturnFocus(() => panelRef.current?.focus());

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={overlayClass} />
        <Dialog.Content
          ref={panelRef}
          className={cn(dialogPanelClass, widths[size], className)}
          // Without a description Radix wants an explicit "none", or it warns.
          {...(description ? {} : { 'aria-describedby': undefined })}
          {...returnFocus}
        >
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div className="min-w-0">
              <Dialog.Title className="text-lg font-semibold tracking-tight">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-sm text-muted-foreground">{description}</Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label="Zamknij"
              className={cn(
                '-mr-1.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground',
                'transition-colors duration-150 hover:bg-muted hover:text-foreground',
                focusRingClass,
                'focus-visible:ring-offset-surface',
              )}
            >
              <X className="size-4" strokeWidth={1.75} aria-hidden />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
