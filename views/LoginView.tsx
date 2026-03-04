
import React, { useState } from 'react';
import { Zap, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginViewProps {
  onLogin: (email: string) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('demo@detailflow.pl');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://spsquzkwqikbwdrrkpqy.supabase.co/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'sb_publishable_0e54D14bUH3Hu2D_9IFlCg_eYZA86NZ'
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error_description || data.msg || 'Błąd logowania');
      }

      if (data.access_token) {
        localStorage.setItem('supabase_token', data.access_token);
        onLogin(email);
      } else {
        throw new Error('Nie otrzymano tokena autoryzacji');
      }
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas logowania');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F0] p-10 mesh-bg">
      <div className="max-w-[480px] w-full space-y-12 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center">
          <div className="inline-flex items-center justify-center bg-[#102C26] w-24 h-24 rounded-[3rem] mb-10 shadow-[0_30px_60px_rgba(16,44,38,0.25)] border border-[#1A3D33]">
            <Zap size={44} className="text-[#F7E7CE]" strokeWidth={2.5} />
          </div>
          <h1 className="text-5xl font-[900] text-[#102C26] tracking-tighter italic">DetailFlow OS</h1>
          <p className="text-[#5A8A7A] font-bold mt-3 uppercase tracking-[0.4em] text-[10px]">Secure Detailing Infrastructure</p>
        </div>

        <div className="bg-white p-12 rounded-[4rem] premium-shadow border border-[#EDD9B7]">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#5A8A7A] uppercase tracking-[0.3em] ml-6">Operator ID</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-8 py-6 bg-[#FDF8F0] border-none rounded-[2rem] focus:ring-4 focus:ring-[#F7E7CE]/40 outline-none transition-all font-bold text-sm text-[#102C26]"
                placeholder="id@detailflow.pl"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#5A8A7A] uppercase tracking-[0.3em] ml-6">Security Token</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-8 py-6 bg-[#FDF8F0] border-none rounded-[2rem] focus:ring-4 focus:ring-[#F7E7CE]/40 outline-none transition-all font-bold text-sm text-[#102C26]"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-500 text-xs font-bold rounded-2xl border border-red-100 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-4 bg-[#102C26] hover:bg-[#1A3D33] text-[#F7E7CE] font-black py-6 rounded-[2rem] transition-all shadow-[0_20px_40px_rgba(16,44,38,0.2)] group text-[11px] uppercase tracking-[0.2em] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Access System'}
              {!isLoading && <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" strokeWidth={3} />}
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center gap-3 text-[#5A8A7A] text-xs font-black uppercase tracking-widest">
          <ShieldCheck size={18} className="text-[#F7E7CE]" strokeWidth={2.5} />
          AES-256 Protected Workspace
        </div>
      </div>
    </div>
  );
};

export default LoginView;
