import React, { useState } from 'react';
import { Building2, MapPin, CheckCircle2, Loader2, Crown, Shield, UserCheck } from 'lucide-react';
import { StudioDto } from '../../types';
import { useStudios } from '../../hooks/useStudios';
import { useStudio } from '../../contexts/StudioContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface StudioSelectViewProps {
  onSelect: (studio: StudioDto) => void;
  onOpenMenu: () => void;
}

// ─── Role config ─────────────────────────────────────────────────────────────
type RoleConfig = {
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
  bg: string; text: string; border: string; accent: string;
};

const ROLE_CONFIG: Record<string, RoleConfig> = {
  Owner:    { label: 'Właściciel', icon: Crown,     bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-amber-200',  accent: 'bg-amber-500' },
  Manager:  { label: 'Menedżer',   icon: Shield,    bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200',   accent: 'bg-blue-500'  },
  Employee: { label: 'Pracownik',  icon: UserCheck, bg: 'bg-emerald-50', text: 'text-emerald-700',border: 'border-emerald-200',accent: 'bg-emerald-500'},
};

const getFallback = (role: string): RoleConfig => ({
  label: role, icon: UserCheck,
  bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', accent: 'bg-slate-400',
});

// ─── View ─────────────────────────────────────────────────────────────────────
const StudioSelectView: React.FC<StudioSelectViewProps> = ({ onSelect }) => {
  const { data: studios = [], isLoading, isError } = useStudios();
  const { selectedStudio, setSelectedStudio } = useStudio();
  const [selecting, setSelecting] = useState<string | null>(null);

  const handleSelect = (studio: StudioDto) => {
    setSelecting(studio.studioId);
    setSelectedStudio(studio);
    setTimeout(() => {
      setSelecting(null);
      onSelect(studio);
    }, 350);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream mesh-bg p-6 sm:p-12">
      <div className="mb-12 text-center max-w-md animate-slide-up">
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] mb-7 shadow-[0_20px_50px_rgba(26,46,30,0.2)]"
          style={{ background: 'linear-gradient(135deg, #1a2e1e 0%, #2a4a30 100%)' }}
        >
          <Building2 className="text-cream-warm" size={32} />
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif text-green-deep tracking-tight mb-4 leading-tight">Wybierz Studio</h1>
        <p className="text-green-deep/40 text-[14px] font-medium leading-relaxed max-w-sm mx-auto">
          Wybierz studio, z którym chcesz pracować. Możesz je zmienić w dowolnym momencie.
        </p>
      </div>

      <div className="w-full max-w-4xl">
        {isLoading && <LoadingSpinner />}

        {isError && (
          <div className="text-center py-12 text-red-500 text-sm font-medium bg-red-50 rounded-3xl px-6">
            Nie udało się pobrać studiów. Odśwież stronę.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {studios.map(studio => {
              const isActive = selectedStudio?.studioId === studio.studioId;
              const isSelecting = selecting === studio.studioId;
              const cfg = ROLE_CONFIG[studio.role] ?? getFallback(studio.role);
              const RoleIcon = cfg.icon;

              return (
                <button
                  key={studio.studioId}
                  onClick={() => handleSelect(studio)}
                  disabled={!!selecting}
                  className={`relative text-left flex flex-col gap-5 p-7 rounded-[2rem] transition-all duration-300 overflow-hidden group animate-slide-up
                    ${isActive
                      ? 'shadow-[0_20px_50px_rgba(26,46,30,0.2)] scale-[1.02]'
                      : 'hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)]'
                    }
                    ${selecting && !isSelecting ? 'opacity-40 pointer-events-none' : ''}
                  `}
                  style={isActive
                    ? { background: 'linear-gradient(135deg, #1a2e1e 0%, #1e3523 100%)', border: '1px solid rgba(255,255,255,0.08)' }
                    : { background: 'white', border: '1px solid rgba(26,46,30,0.06)', boxShadow: '0 4px 16px -4px rgba(0,0,0,0.04)' }
                  }
                >
                  {/* accent stripe */}
                  <div className={`absolute inset-x-0 top-0 h-1 rounded-t-3xl ${isActive ? 'bg-cream-warm/40' : cfg.accent}`} />

                  {/* role badge */}
                  <div className="flex items-start justify-between">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border
                      ${isActive ? 'bg-white/10 text-cream-warm border-white/10' : `${cfg.bg} ${cfg.text} ${cfg.border}`}`}>
                      <RoleIcon size={11} className="shrink-0" />
                      {cfg.label}
                    </div>
                    {isSelecting && <Loader2 className={`animate-spin ${isActive ? 'text-cream-warm/60' : 'text-green-deep/30'}`} size={18} />}
                    {isActive && !isSelecting && <CheckCircle2 className="text-cream-warm" size={20} />}
                  </div>

                  {/* Studio info */}
                  <div className="flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${isActive ? 'bg-white/10' : 'bg-slate-50'}`}>
                      <Building2 size={20} className={isActive ? 'text-cream-warm/80' : 'text-green-deep/40'} />
                    </div>
                    <h3 className={`font-extrabold text-lg tracking-tight leading-tight mb-1 ${isActive ? 'text-white' : 'text-green-deep'}`}>
                      {studio.name}
                    </h3>
                    {studio.address
                      ? <div className={`flex items-start gap-1.5 text-xs leading-relaxed ${isActive ? 'text-white/40' : 'text-slate-400'}`}>
                          <MapPin size={11} className="shrink-0 mt-0.5" />
                          <span>{studio.address}</span>
                        </div>
                      : <span className={`text-xs ${isActive ? 'text-white/20' : 'text-slate-300'}`}>Brak adresu</span>
                    }
                  </div>

                  <div className={`text-[10px] font-semibold uppercase tracking-widest ${isActive ? 'text-cream-warm/60' : 'text-slate-300 group-hover:text-green-deep/40 transition-colors'}`}>
                    {isActive ? '✓ Aktualnie wybrane' : 'Kliknij, aby wybrać →'}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioSelectView;
