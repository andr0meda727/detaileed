'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ToastContainer } from './Toast';
import { ToastContext, type ToastMessage, type ToastType } from './useToast';

let nextId = 0;

/** Holds the toasts; each one removes itself after about 5 s (see `Toast.tsx`) or when closed. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    nextId += 1;
    const id = `toast-${nextId}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}
