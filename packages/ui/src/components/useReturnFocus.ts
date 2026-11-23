'use client';

import { useRef } from 'react';

/**
 * Radix dialogs return focus only to their own `Trigger`; ours open from props (`isOpen`, `open`), so this remembers
 * the element that had focus when the dialog opened and focuses it again after closing. Spread the handlers on the
 * dialog's Content; `onOpen` replaces Radix's own first focus when given.
 */
export function useReturnFocus(onOpen?: () => void) {
  const openerRef = useRef<HTMLElement | null>(null);

  return {
    onOpenAutoFocus: (event: Event) => {
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (onOpen) {
        event.preventDefault();
        onOpen();
      }
    },
    onCloseAutoFocus: (event: Event) => {
      event.preventDefault();
      if (openerRef.current?.isConnected) openerRef.current.focus();
      openerRef.current = null;
    },
  };
}
