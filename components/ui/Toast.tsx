import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../../contexts/ToastContext';

interface ToastProps {
 toast: ToastMessage;
 onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastProps> = ({ toast, onRemove }) => {
 const [isClosing, setIsClosing] = useState(false);

 useEffect(() => {
 const timer = setTimeout(() => {
 setIsClosing(true);
 setTimeout(() => onRemove(toast.id), 300); // Wait for fade out animation
 }, 2700);
 return () => clearTimeout(timer);
 }, [toast.id, onRemove]);

 const handleClose = () => {
 setIsClosing(true);
 setTimeout(() => onRemove(toast.id), 300);
 };

 const getStyles = () => {
 switch (toast.type) {
 case 'success':
 return 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-2xl';
 case 'error':
 return 'bg-red-50 border-red-200 text-red-800 shadow-2xl';
 case 'info':
 return 'bg-blue-50 border-blue-200 text-blue-800 shadow-2xl';
 default:
 return 'bg-white border-slate-200 text-slate-800 shadow-2xl';
 }
 };

 const getIcon = () => {
 switch (toast.type) {
 case 'success':
 return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
 case 'error':
 return <XCircle className="w-6 h-6 text-red-500" />;
 case 'info':
 return <Info className="w-6 h-6 text-blue-500" />;
 default:
 return null;
 }
 };

 return (
 <div
 className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border transition-all duration-300 ease-in-out ${getStyles()} ${isClosing ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'
 } animate-in slide-in-from-right-8`}
 >
 <div className="shrink-0">{getIcon()}</div>
 <p className="text-sm font-medium flex-1 pr-3">{toast.message}</p>
 <button
 onClick={handleClose}
 className="shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
 >
 <X size={20} />
 </button>
 </div>
 );
};

interface ToastContainerProps {
 toasts: ToastMessage[];
 removeToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
 return createPortal(
 <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
 <div className="flex flex-col gap-2 pointer-events-auto items-end">
 {toasts.map((toast) => (
 <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
 ))}
 </div>
 </div>,
 document.body
 );
};

export default ToastContainer;
