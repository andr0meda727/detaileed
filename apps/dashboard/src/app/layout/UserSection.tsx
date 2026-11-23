import React from 'react';
import { LogOut } from 'lucide-react';

/** The signed-in user's email and the sign-out button at the bottom of the sidebar. */
export const UserSection: React.FC<{ userEmail?: string | null; onLogout: () => void }> = ({ userEmail, onLogout }) => (
  <>
    {userEmail && (
      <div className="flex items-center gap-3 px-4 py-2 mb-2 rounded-xl">
        <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center shrink-0">
          <span className="text-cream-warm font-bold text-[10px] uppercase">{userEmail.charAt(0)}</span>
        </div>
        <span className="text-white/35 text-[11px] font-medium truncate">{userEmail}</span>
      </div>
    )}

    <button
      onClick={onLogout}
      className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/7 transition-all duration-200 group"
    >
      <LogOut size={18} strokeWidth={2} className="text-white/30 shrink-0 group-hover:text-red-400 transition-colors" />
      <span className="font-syne font-bold text-[14px] tracking-wide">Wyloguj</span>
    </button>
  </>
);
