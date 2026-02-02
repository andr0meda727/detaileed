
import React, { useState } from 'react';
import { Zap, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginViewProps {
  onLogin: (email: string) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('demo@detailflow.pl');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2fbf9] p-10 mesh-bg">
      <div className="max-w-[480px] w-full space-y-12 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center">
          <div className="inline-flex items-center justify-center bg-[#0b2826] w-24 h-24 rounded-[3rem] mb-10 shadow-[0_30px_60px_rgba(11,40,38,0.25)] border border-[#1d4441]">
            <Zap size={44} className="text-[#5dcbb6]" strokeWidth={2.5} />
          </div>
          <h1 className="text-5xl font-[900] text-[#0b2826] tracking-tighter italic">DetailFlow OS</h1>
          <p className="text-[#20655e] font-bold mt-3 uppercase tracking-[0.4em] text-[10px]">Secure Detailing Infrastructure</p>
        </div>

        <div className="bg-white p-12 rounded-[4rem] premium-shadow border border-[#d4f3ec]">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#237e73] uppercase tracking-[0.3em] ml-6">Operator ID</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-8 py-6 bg-[#f2fbf9] border-none rounded-[2rem] focus:ring-4 focus:ring-[#5dcbb6]/20 outline-none transition-all font-bold text-sm text-[#0b2826]"
                placeholder="id@detailflow.pl"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#237e73] uppercase tracking-[0.3em] ml-6">Security Token</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-8 py-6 bg-[#f2fbf9] border-none rounded-[2rem] focus:ring-4 focus:ring-[#5dcbb6]/20 outline-none transition-all font-bold text-sm text-[#0b2826]"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-4 bg-[#0b2826] hover:bg-[#1d4441] text-[#5dcbb6] font-black py-6 rounded-[2rem] transition-all shadow-[0_20px_40px_rgba(11,40,38,0.2)] group text-[11px] uppercase tracking-[0.2em]"
            >
              Access System
              <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" strokeWidth={3} />
            </button>
          </form>
        </div>
        
        <div className="flex items-center justify-center gap-3 text-[#20655e] text-xs font-black uppercase tracking-widest">
           <ShieldCheck size={18} className="text-[#5dcbb6]" strokeWidth={2.5} />
           AES-256 Protected Workspace
        </div>
      </div>
    </div>
  );
};

export default LoginView;
