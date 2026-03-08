import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

/** Single shared Modal component — renders via portal, consistent styling. */
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, size = 'md', children }) => {
  if (!isOpen) return null;

  const maxWidths = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-3xl' };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#102C26]/70 backdrop-blur-md animate-fade-in">
      <div className={`bg-white w-full ${maxWidths[size]} rounded-[3rem] shadow-2xl overflow-hidden animate-zoom-in flex flex-col max-h-[95vh]`}>
        <div className="px-8 sm:px-10 py-7 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#102C26] tracking-tight leading-none">{title}</h3>
          <button
            onClick={onClose}
            className="p-2.5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
            aria-label="Zamknij"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-8 sm:px-10 py-8 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
