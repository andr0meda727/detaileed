import type { LucideIcon } from 'lucide-react';
import { Plus, UserPlus } from 'lucide-react';

/** The demo's copy of the dashboard's page header. The page has one h1 (the hero), so the title is a heading level lower. */
export function DemoHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 lg:mb-12">
      <div className="space-y-2">
        <h3 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-green-deep tracking-tight leading-none">
          {title}
        </h3>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-deep/8 text-green-deep rounded-lg text-[9px] font-bold uppercase tracking-[0.15em] border border-green-deep/10">
            <div className="w-1.5 h-1.5 rounded-full bg-green-light animate-pulse" />
            Demo Mode
          </div>
          <p className="text-green-light/70 font-semibold text-[12px] truncate">{subtitle}</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          type="button"
          className="flex items-center justify-center gap-2.5 bg-amber text-green-deep px-6 lg:px-8 py-3.5 lg:py-4 rounded-lg font-bold text-[12px] lg:text-[13px] shadow-[0_8px_24px_-8px_rgba(232,168,48,0.5)] hover:-translate-y-1 hover:bg-amber-light transition-all duration-300 group"
        >
          <Plus size={16} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="whitespace-nowrap tracking-wide uppercase">Dodaj Rezerwację</span>
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 bg-white text-green-deep border border-green-deep/15 px-6 lg:px-8 py-3.5 lg:py-4 rounded-lg font-bold text-[12px] lg:text-[13px] hover:bg-green-deep/4 transition-all duration-300 group shadow-sm"
        >
          <UserPlus size={16} strokeWidth={2.5} />
          <span className="whitespace-nowrap tracking-wide uppercase">Nowy Klient</span>
        </button>
      </div>
    </header>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconBg,
  iconColor,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="floating-card-static p-5 sm:p-6 flex items-center gap-5">
      <div
        className="w-12 h-12 rounded-[0.875rem] flex items-center justify-center shrink-0 shadow-lg"
        style={{ background: iconBg }}
      >
        <Icon size={20} color={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-bold text-green-deep/40 uppercase tracking-[0.15em]">{label}</p>
        <p className="text-2xl font-extrabold text-green-deep font-mono tracking-tighter leading-none mt-1">{value}</p>
        <p className="text-[10px] font-semibold text-green-light/60 mt-1">{sub}</p>
      </div>
    </div>
  );
}
