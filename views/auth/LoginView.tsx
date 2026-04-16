
import React, { useState } from 'react';
import { Zap, ArrowRight, ShieldCheck, KeyRound, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import supabase from '../../utils/supabase';
import logo from '../../images/logo.svg';

interface LoginViewProps {
  onLogin: (email: string) => void;
}

type Mode = 'login' | 'reset' | 'reset-sent';

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallbackMessage;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw new Error(authError.message);
      if (data.session) { onLogin(email); }
      else throw new Error('Nie otrzymano sesji autoryzacji');
    } catch (error) {
      setError(getErrorMessage(error, 'Wystąpił błąd podczas logowania'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/?type=recovery`,
      });
      if (resetError) throw new Error(resetError.message);
      setMode('reset-sent');
    } catch (error) {
      setError(getErrorMessage(error, 'Wystąpił błąd podczas resetowania hasła'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-10 mesh-bg">
      <div className="max-w-[480px] w-full space-y-12 animate-zoom-in">
        <div className="text-center">
          <div className="inline-flex items-center justify-center bg-green-deep w-24 h-24 rounded-2xl mb-10 shadow-[0_30px_60px_rgba(16,44,38,0.25)] border border-[#1A3D33]">
            <img src={logo} alt="Detaileed logo" className="h-14 w-auto shrink-0 transition-transform duration-300 group-hover:scale-105" />
          </div>
          <h1 className="text-5xl font-bold text-green-deep tracking-tighter">Detaileed</h1>
          <p className="text-green-light font-bold mt-3 uppercase tracking-[0.4em] text-[10px]">Twój panel do zarządzania firmą</p>
        </div>

        <div className="bg-white p-12 rounded-2xl premium-shadow border border-[#EDD9B7]">

          {/* ── LOGIN MODE ── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-semibold text-green-light uppercase tracking-[0.3em] ml-6">Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full px-8 py-6 bg-cream border-none rounded-xl focus:ring-4 focus:ring-cream-warm/40 outline-none transition-all font-bold text-sm text-green-deep"
                  placeholder="email@detaileed.com"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-semibold text-green-light uppercase tracking-[0.3em] ml-6">Hasło</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full px-8 py-6 bg-cream border-none rounded-xl focus:ring-4 focus:ring-cream-warm/40 outline-none transition-all font-bold text-sm text-green-deep"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-500 text-xs font-bold rounded-2xl border border-red-100 text-center">{error}</div>
              )}

              <button type="submit" disabled={isLoading}
                className="w-full flex items-center justify-center gap-4 bg-green-deep hover:bg-[#1A3D33] text-cream-warm font-semibold py-6 rounded-xl transition-all shadow-[0_20px_40px_rgba(16,44,38,0.2)] group text-[11px] uppercase tracking-[0.2em] disabled:opacity-70 disabled:cursor-not-allowed">
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <>Zaloguj się <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" strokeWidth={3} /></>}
              </button>

              <button type="button" onClick={() => { setMode('reset'); setError(''); }}
                className="w-full text-center text-[10px] font-semibold text-green-light uppercase tracking-widest hover:text-green-deep transition-colors pt-2">
                Nie pamiętam hasła →
              </button>
            </form>
          )}

          {/* ── RESET MODE ── */}
          {mode === 'reset' && (
            <form onSubmit={handleReset} className="space-y-8">
              <div className="text-center mb-2">
                <div className="w-12 h-12 bg-cream-warm/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <KeyRound size={22} className="text-green-deep" />
                </div>
                <h2 className="font-extrabold text-green-deep text-xl tracking-tight">Reset hasła</h2>
                <p className="text-xs text-slate-400 mt-2">Wyślemy link resetujący na Twój email</p>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-semibold text-green-light uppercase tracking-[0.3em] ml-6">Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                  className="w-full px-8 py-6 bg-cream border-none rounded-xl focus:ring-4 focus:ring-cream-warm/40 outline-none transition-all font-bold text-sm text-green-deep"
                  placeholder="id@detailflow.pl"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-500 text-xs font-bold rounded-2xl border border-red-100 text-center">{error}</div>
              )}

              <button type="submit" disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-green-deep text-cream-warm font-semibold py-6 rounded-xl transition-all text-[11px] uppercase tracking-[0.2em] disabled:opacity-70">
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <>Wyślij link resetujący <ArrowRight size={20} strokeWidth={3} /></>}
              </button>

              <button type="button" onClick={() => { setMode('login'); setError(''); }}
                className="w-full flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest hover:text-green-deep transition-colors pt-2">
                <ArrowLeft size={14} /> Wróć do logowania
              </button>
            </form>
          )}

          {/* ── RESET SENT MODE ── */}
          {mode === 'reset-sent' && (
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
              <button onClick={() => { setMode('login'); setError(''); }}
                className="w-full flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest hover:text-green-deep transition-colors py-3">
                <ArrowLeft size={14} /> Wróć do logowania
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LoginView;
