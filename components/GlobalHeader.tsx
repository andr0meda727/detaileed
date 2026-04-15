
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
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 lg:mb-12 animate-slide-up">
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          {onOpenMenu && (
            <button
              onClick={onOpenMenu}
              className="lg:hidden p-2.5 bg-green-deep text-cream-warm rounded-xl shadow-lg active:scale-95 transition-all"
            >
              <Menu size={20} strokeWidth={2.5} />
            </button>
          )}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-green-deep tracking-tight leading-none">{title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-deep/8 text-green-deep rounded-lg text-[9px] font-bold uppercase tracking-[0.15em] border border-green-deep/10 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-green-light" style={{ animation: 'pulse 2s infinite' }}></div>
            Live Mode
          </div>
          <p className="text-green-light/70 font-semibold text-[12px] truncate">{subtitle}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {onAddBooking && (
          <button
            onClick={onAddBooking}
            className="flex items-center justify-center gap-2.5 bg-amber text-green-deep px-6 lg:px-8 py-3.5 lg:py-4 rounded-lg font-bold text-[12px] lg:text-[13px] shadow-[0_8px_24px_-8px_rgba(232,168,48,0.5)] hover:-translate-y-1 hover:bg-amber-light hover:shadow-[0_16px_32px_-8px_rgba(232,168,48,0.55)] transition-all duration-300 group"
          >
            <Plus size={16} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="whitespace-nowrap tracking-wide uppercase">Dodaj Rezerwację</span>
          </button>
        )}
        {onAddClient && (
          <button
            onClick={onAddClient}
            className="flex items-center justify-center gap-2 bg-white text-green-deep border border-green-deep/15 px-6 lg:px-8 py-3.5 lg:py-4 rounded-lg font-bold text-[12px] lg:text-[13px] hover:bg-green-deep/4 hover:border-green-deep/25 hover:-translate-y-0.5 transition-all duration-300 group shadow-sm"
          >
            <UserPlus size={16} strokeWidth={2.5} />
            <span className="whitespace-nowrap tracking-wide uppercase">Nowy Klient</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default GlobalHeader;
