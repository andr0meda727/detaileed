import { useState, useCallback } from 'react';
import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error';

export interface Toast {
 id: number;
 type: ToastType;
 message: string;
}

let _id = 0;

/** Hook returning addToast function and the ToastContainer component to place in JSX. */
export function useToast() {
 const [toasts, setToasts] = useState<Toast[]>([]);

 const addToast = useCallback((type: ToastType, message: string) => {
 const id = ++_id;
 setToasts(prev => [...prev, { id, type, message }]);
 setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
 }, []);

 const ToastContainer: React.FC = () => (
 <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
 {toasts.map(t => (
 <div
 key={t.id}
 className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-semibold animate-in slide-in-from-right duration-300 ${
 t.type === 'success' ? 'bg-[#102C26] text-white' : 'bg-red-600 text-white'
 }`}
 >
 {t.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
 {t.message}
 </div>
 ))}
 </div>
 );

 return { addToast, ToastContainer };
}
