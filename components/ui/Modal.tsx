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

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, size = 'md', children }) => {
 if (!isOpen) return null;

 const maxWidths = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-3xl' };

 return createPortal(
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#102C26]/60 backdrop-blur-sm animate-fade-in">
 <div className={`bg-white w-full ${maxWidths[size]} rounded-2xl shadow-2xl overflow-hidden animate-zoom-in flex flex-col max-h-[95vh]`}>
 <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
 <h3 className="text-lg font-semibold text-[#102C26]">{title}</h3>
 <button
 onClick={onClose}
 className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors active:scale-90"
 aria-label="Zamknij"
 >
 <X size={16} />
 </button>
 </div>
 <div className="px-6 py-6 overflow-y-auto flex-1">
 {children}
 </div>
 </div>
 </div>,
 document.body,
 );
};

export default Modal;
