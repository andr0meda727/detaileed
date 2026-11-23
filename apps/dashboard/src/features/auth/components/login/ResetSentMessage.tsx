import React from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';

interface ResetSentMessageProps {
  email: string;
  onBack: () => void;
}

export const ResetSentMessage: React.FC<ResetSentMessageProps> = ({ email, onBack }) => (
  <div className="text-center space-y-6 py-4">
    <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-100 rounded-3xl flex items-center justify-center mx-auto">
      <CheckCircle size={30} className="text-emerald-500" />
    </div>
    <div>
      <h2 className="font-extrabold text-green-deep text-xl tracking-tight mb-2">Sprawdź skrzynkę</h2>
      <p className="text-sm text-slate-400 leading-relaxed">
        Wysłaliśmy link resetujący na <strong className="text-green-deep">{email}</strong>.<br />
        Kliknij w link, aby ustawić nowe hasło.
      </p>
    </div>
    <button
      onClick={onBack}
      className="w-full flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest hover:text-green-deep transition-colors py-3"
    >
      <ArrowLeft size={14} /> Wróć do logowania
    </button>
  </div>
);
