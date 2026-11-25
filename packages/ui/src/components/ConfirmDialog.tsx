'use client';

import type { ReactNode } from 'react';
import { AlertDialog } from 'radix-ui';
import { cn } from '../lib/cn';
import { Button } from './Button';
import { dialogPanelClass, overlayClass } from './interactiveStyles';
import { useReturnFocus } from './useReturnFocus';

export type ConfirmDialogTone = 'danger' | 'default';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  /** Defaults to "Anuluj". */
  cancelLabel?: string;
  /** `danger` for destructive actions (delete, cancel a booking): the confirm button turns red. */
  tone?: ConfirmDialogTone;
  /** Runs on confirm. The dialog stays open: close it with `onOpenChange(false)` when the action has succeeded. */
  onConfirm: () => void;
  /** Shows a spinner on the confirm button and blocks closing while the action runs. */
  loading?: boolean;
  className?: string;
}

/**
 * A yes/no question before an action, on Radix AlertDialog (`role="alertdialog"`); it replaces `window.confirm`.
 * Focus starts on the cancel button and returns to the opener on close; Escape cancels, a click on the backdrop does
 * nothing.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Anuluj',
  tone = 'default',
  onConfirm,
  loading = false,
  className,
}: ConfirmDialogProps) {
  const returnFocus = useReturnFocus();

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!loading) onOpenChange(next);
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className={overlayClass} />
        <AlertDialog.Content className={cn(dialogPanelClass, 'max-w-md gap-5 p-5', className)} {...returnFocus}>
          <div className="flex flex-col gap-1.5">
            <AlertDialog.Title className="text-lg font-semibold tracking-tight">{title}</AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-muted-foreground">{description}</AlertDialog.Description>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel asChild>
              <Button variant="secondary" disabled={loading}>
                {cancelLabel}
              </Button>
            </AlertDialog.Cancel>
            <Button variant={tone === 'danger' ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
