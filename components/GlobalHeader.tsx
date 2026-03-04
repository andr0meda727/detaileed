
import React from 'react';
import { Plus, UserPlus, Menu } from 'lucide-react';

interface GlobalHeaderProps {
  title: string;
  subtitle: string;
  onAddBooking?: () => void;
  onAddClient?: () => void;
  onOpenMenu?: () => void;
}

const GlobalHeader: React.FC<GlobalHeaderProps> = ({ title, subtitle, onAddBooking, onAddClient, onOpenMenu }) => {
  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 lg:mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          {onOpenMenu && (
            <button
              onClick={onOpenMenu}
              className="lg:hidden p-2.5 bg-[#102C26] text-[#F7E7CE] rounded-xl shadow-lg active:scale-95 transition-all"
            >
              <Menu size={20} strokeWidth={2.5} />
            </button>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[1000] text-[#102C26] tracking-tighter italic leading-tight">{title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#F7E7CE]/20 text-[#102C26] rounded-lg text-[9px] font-black uppercase tracking-widest border border-[#F7E7CE]/40 shadow-sm shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-[#102C26] animate-pulse"></div>
            Live Mode
          </div>
          <p className="text-slate-400 font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.2em] opacity-80 truncate">{subtitle}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {onAddBooking && (
          <button
            onClick={onAddBooking}
            className="flex items-center justify-center gap-3 bg-[#102C26] text-[#F7E7CE] px-6 lg:px-8 py-4 lg:py-5 rounded-2xl lg:rounded-[2rem] font-black text-[10px] lg:text-[11px] uppercase tracking-[0.15em] lg:tracking-[0.2em] shadow-xl hover:scale-[1.03] transition-all group"
          >
            <Plus size={16} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
            <span className="whitespace-nowrap">Dodaj Rezerwację</span>
          </button>
        )}
        {onAddClient && (
          <button
            onClick={onAddClient}
            className="flex items-center justify-center gap-3 bg-white text-[#102C26] border border-[#E8D5B5] px-6 lg:px-8 py-4 lg:py-5 rounded-2xl lg:rounded-[2rem] font-black text-[10px] lg:text-[11px] uppercase tracking-[0.15em] lg:tracking-[0.2em] shadow-sm hover:border-[#F7E7CE] hover:bg-[#FDF8F0] transition-all group"
          >
            <UserPlus size={16} strokeWidth={2.5} />
            <span className="whitespace-nowrap">Nowy Klient</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default GlobalHeader;
