'use client';

import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

/** Single shared Modal component — renders via portal, consistent premium styling. */
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, size = 'md', children }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const activeBeforeOpen = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = originalOverflow;
      activeBeforeOpen?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidths = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-3xl' };

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1a2e1e]/80 backdrop-blur-md" onClick={onClose} />
      {/* Modal card */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative w-full ${maxWidths[size]} animate-zoom-in flex flex-col max-h-[95vh]`}
        style={{
          background: 'white',
          borderRadius: '1rem',
          border: '1px solid rgba(0,0,0,0.04)',
          boxShadow: '0 30px 80px -15px rgba(26,46,30,0.35), 0 8px 24px -6px rgba(26,46,30,0.12)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          className="px-7 sm:px-10 py-6 flex items-center justify-between shrink-0"
          style={{ borderBottom: '1px solid rgba(26,46,30,0.06)' }}
        >
          <h3 id={titleId} className="text-xl sm:text-3xl font-serif text-green-deep tracking-tight leading-none">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-green-deep/5 text-green-deep/40 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-90 flex items-center justify-center"
            aria-label="Zamknij"
          >
            <X size={17} strokeWidth={2.5} />
          </button>
        </div>
        {/* Content */}
        <div className="px-7 sm:px-10 py-8 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
