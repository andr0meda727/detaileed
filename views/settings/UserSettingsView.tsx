import React, { useState } from 'react';
import { KeyRound, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, Shield } from 'lucide-react';
import supabase from '../../utils/supabase';
import GlobalHeader from '../../components/GlobalHeader';

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallbackMessage;
}

const UserSettingsView: React.FC<{ onOpenMenu?: () => void }> = ({ onOpenMenu }) => {
  // ── Change password state ──
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (newPassword.length < 8) {
      setResult({ type: 'error', message: 'Hasło musi mieć co najmniej 8 znaków.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setResult({ type: 'error', message: 'Hasła nie są identyczne.' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setResult({ type: 'success', message: 'Hasło zostało zmienione.' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setResult({ type: 'error', message: getErrorMessage(error, 'Nie udało się zmienić hasła.') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      <GlobalHeader title="Ustawienia Konta" subtitle="Zarządzaj swoim profilem i bezpieczeństwem" onOpenMenu={onOpenMenu} />

      <div className="max-w-lg space-y-6">
        {/* Change password card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-deep rounded-xl flex items-center justify-center">
              <KeyRound size={18} className="text-cream-warm" />
            </div>
            <div>
              <h3 className="font-extrabold text-green-deep tracking-tight">Zmień hasło</h3>
              <p className="text-xs text-slate-400 mt-0.5">Ustaw nowe hasło do swojego konta</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="p-8 space-y-5">
            {/* New password */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-green-light uppercase tracking-widest ml-1">Nowe hasło</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Minimum 8 znaków"
                  className="w-full px-5 py-4 pr-12 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-cream-warm/30 transition-all"
                />
                <button type="button" onClick={() => setShowNew(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-green-light uppercase tracking-widest ml-1">Potwierdź nowe hasło</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Powtórz nowe hasło"
                  className="w-full px-5 py-4 pr-12 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-cream-warm/30 transition-all"
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Strength hint */}
            {newPassword.length > 0 && (
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${newPassword.length >= i * 3
                      ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-blue-400' : 'bg-emerald-400'
                      : 'bg-slate-100'
                    }`} />
                ))}
              </div>
            )}

            {/* Result */}
            {result && (
              <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold ${result.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                }`}>
                {result.type === 'success' ? <CheckCircle size={17} /> : <AlertCircle size={17} />}
                {result.message}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-green-deep text-cream-warm rounded-2xl font-semibold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
              Zmień hasło
            </button>
          </form>
        </div>

        {/* Info notice */}
        <div className="px-5 py-4 bg-cream-warm/30 border border-cream-warm rounded-2xl">
          <p className="text-xs text-green-deep/60 font-semibold leading-relaxed">
            Po zmianie hasła Twoja aktualna sesja pozostanie aktywna. Inne urządzenia zostaną poproszone o ponowne logowanie.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsView;

