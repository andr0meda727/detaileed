import React, { useState } from 'react';
import { Building2, MapPin, CheckCircle2, Loader2, Crown, Shield, UserCheck, Plus, RefreshCw } from 'lucide-react';
import { StudioDto } from '@/types';
import { useStudios } from '@/features/studios/api/studios';
import { getLastStudioId } from '@/features/studios/model/activeStudio';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import CreateStudioModal from '@/features/studios/components/CreateStudioModal';

interface StudioSelectViewProps {
  onSelect: (studio: StudioDto) => void;
}

// ─── Role config ─────────────────────────────────────────────────────────────
type RoleConfig = {
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
  bg: string;
  text: string;
  border: string;
  accent: string;
};

const ROLE_CONFIG: Record<string, RoleConfig> = {
  Owner: {
    label: 'Właściciel',
    icon: Crown,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    accent: 'bg-amber-500',
  },
  Manager: {
    label: 'Menedżer',
    icon: Shield,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    accent: 'bg-blue-500',
  },
  Employee: {
    label: 'Pracownik',
    icon: UserCheck,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    accent: 'bg-emerald-500',
  },
};

const getFallback = (role: string): RoleConfig => ({
  label: role,
  icon: UserCheck,
  bg: 'bg-slate-50',
  text: 'text-slate-600',
  border: 'border-slate-200',
  accent: 'bg-slate-400',
});

/** Owner lub Manager mogą tworzyć nowe studio */
const canCreateStudio = (studios: StudioDto[]) =>
  studios.length === 0 || studios.some((s) => s.role === 'Owner' || s.role === 'Manager');

// ─── View ─────────────────────────────────────────────────────────────────────
const StudioSelectView: React.FC<StudioSelectViewProps> = ({ onSelect }) => {
  const { data: studios = [], isLoading, isError, refetch } = useStudios();
  const lastStudioId = getLastStudioId();

  const [selecting, setSelecting] = useState<string | null>(null);
  // Tylko ręczne otwarcie modalu — logika auto-open poniżej
  const [manualOpen, setManualOpen] = useState(false);

  // ── Computed open state ──────────────────────────────────────────────────────
  // Modal otwiera się gdy:
  // (a) user kliknął przycisk "Nowe Studio" (manualOpen)
  // (b) dane załadowane i lista studiów jest pusta (auto-onboarding)
  const noStudiosAfterLoad = !isLoading && studios.length === 0;
  const isModalOpen = manualOpen || noStudiosAfterLoad;
  // Można zamknąć tylko gdy user ma już jakieś studio
  const canClose = studios.length > 0;

  const handleSelect = (studio: StudioDto) => {
    setSelecting(studio.studioId);
    setTimeout(() => {
      setSelecting(null);
      onSelect(studio);
    }, 350);
  };

  const handleCreateSuccess = (newStudio: StudioDto) => {
    setManualOpen(false);
    handleSelect(newStudio);
  };

  const showCreateCard = !isLoading && !isError && canCreateStudio(studios) && studios.length > 0;

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream mesh-bg p-6 sm:p-12">
        <div className="mb-12 text-center max-w-md">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-xl mb-7 shadow-[0_20px_50px_rgba(26,46,30,0.2)]"
            style={{ background: 'linear-gradient(135deg, #1a2e1e 0%, #2a4a30 100%)' }}
          >
            <Building2 className="text-cream-warm" size={32} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif text-green-deep tracking-tight mb-4 leading-tight">
            Wybierz Studio
          </h1>
          <p className="text-green-deep/40 text-[14px] font-medium leading-relaxed max-w-sm mx-auto">
            Wybierz studio, z którym chcesz pracować. Możesz je zmienić w dowolnym momencie.
          </p>
        </div>

        <div className="w-full max-w-4xl">
          {isLoading && <LoadingSpinner />}

          {isError && (
            <div className="text-center py-12 space-y-4">
              <p className="text-red-500 text-sm font-medium bg-red-50 rounded-3xl px-6 py-4 inline-block">
                Nie udało się pobrać listy studiów.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => refetch()}
                  className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 hover:text-green-deep hover:border-green-deep/20 transition-all"
                >
                  <RefreshCw size={14} /> Spróbuj ponownie
                </button>
                <button
                  onClick={() => setManualOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-[11px] uppercase tracking-widest text-cream-warm shadow-md transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #1a2e1e 0%, #2a4a30 100%)' }}
                >
                  <Plus size={14} /> Utwórz studio
                </button>
              </div>
            </div>
          )}

          {!isLoading && !isError && studios.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {studios.map((studio) => {
                const isActive = lastStudioId === studio.studioId;
                const isSelecting = selecting === studio.studioId;
                const cfg = ROLE_CONFIG[studio.role] ?? getFallback(studio.role);
                const RoleIcon = cfg.icon;

                return (
                  <button
                    key={studio.studioId}
                    onClick={() => handleSelect(studio)}
                    disabled={!!selecting}
                    className={`relative text-left flex flex-col gap-5 p-7 rounded-xl transition-all duration-300 overflow-hidden group
                      ${
                        isActive
                          ? 'shadow-[0_20px_50px_rgba(26,46,30,0.2)] scale-[1.02]'
                          : 'hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)]'
                      }
                      ${selecting && !isSelecting ? 'opacity-40 pointer-events-none' : ''}
                    `}
                    style={
                      isActive
                        ? {
                            background: 'linear-gradient(135deg, #1a2e1e 0%, #1e3523 100%)',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }
                        : {
                            background: 'white',
                            border: '1px solid rgba(26,46,30,0.06)',
                            boxShadow: '0 4px 16px -4px rgba(0,0,0,0.04)',
                          }
                    }
                  >
                    {/* accent stripe */}
                    <div
                      className={`absolute inset-x-0 top-0 h-1 rounded-t-3xl ${isActive ? 'bg-cream-warm/40' : cfg.accent}`}
                    />

                    {/* role badge */}
                    <div className="flex items-start justify-between">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border
                        ${isActive ? 'bg-white/10 text-cream-warm border-white/10' : `${cfg.bg} ${cfg.text} ${cfg.border}`}`}
                      >
                        <RoleIcon size={11} className="shrink-0" />
                        {cfg.label}
                      </div>
                      {isSelecting && (
                        <Loader2
                          className={`animate-spin ${isActive ? 'text-cream-warm/60' : 'text-green-deep/30'}`}
                          size={18}
                        />
                      )}
                      {isActive && !isSelecting && <CheckCircle2 className="text-cream-warm" size={20} />}
                    </div>

                    {/* Studio info */}
                    <div className="flex-1">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${isActive ? 'bg-white/10' : 'bg-slate-50'}`}
                      >
                        <Building2 size={20} className={isActive ? 'text-cream-warm/80' : 'text-green-deep/40'} />
                      </div>
                      <h3
                        className={`font-extrabold text-lg tracking-tight leading-tight mb-1 ${isActive ? 'text-white' : 'text-green-deep'}`}
                      >
                        {studio.name}
                      </h3>
                      {studio.address ? (
                        <div
                          className={`flex items-start gap-1.5 text-xs leading-relaxed ${isActive ? 'text-white/40' : 'text-slate-400'}`}
                        >
                          <MapPin size={11} className="shrink-0 mt-0.5" />
                          <span>{studio.address}</span>
                        </div>
                      ) : (
                        <span className={`text-xs ${isActive ? 'text-white/20' : 'text-slate-300'}`}>Brak adresu</span>
                      )}
                    </div>

                    <div
                      className={`text-[10px] font-semibold uppercase tracking-widest ${isActive ? 'text-cream-warm/60' : 'text-slate-300 group-hover:text-green-deep/40 transition-colors'}`}
                    >
                      {isActive ? '✓ Aktualnie wybrane' : 'Kliknij, aby wybrać →'}
                    </div>
                  </button>
                );
              })}

              {/* "+ Nowe Studio" card — only when user has existing studios */}
              {showCreateCard && (
                <button
                  onClick={() => setManualOpen(true)}
                  className="relative text-left flex flex-col items-center justify-center gap-3 p-7 rounded-xl border-2 border-dashed border-green-deep/15 hover:border-green-deep/30 hover:bg-green-deep/[0.02] transition-all duration-300 group min-h-[200px]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-green-deep/5 flex items-center justify-center group-hover:bg-green-deep/10 transition-colors">
                    <Plus size={22} className="text-green-deep/40 group-hover:text-green-deep/70 transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="font-extrabold text-sm text-green-deep/50 group-hover:text-green-deep/80 transition-colors tracking-tight">
                      Nowe Studio
                    </p>
                    <p className="text-[11px] text-slate-300 group-hover:text-slate-400 transition-colors mt-0.5">
                      Utwórz kolejne studio
                    </p>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal — otwiera się automatycznie gdy brak studiów lub manualnie */}
      <CreateStudioModal
        isOpen={isModalOpen}
        onClose={() => setManualOpen(false)}
        onSuccess={handleCreateSuccess}
        canClose={canClose}
      />
    </>
  );
};

export default StudioSelectView;
