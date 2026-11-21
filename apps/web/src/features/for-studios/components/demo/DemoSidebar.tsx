import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  CalendarClock,
  ChevronDown,
  FileBarChart2,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Shield,
  Users,
} from 'lucide-react';

export type DemoView = 'Dashboard' | 'Tasks' | 'Clients' | 'Team' | 'Inventory' | 'Reports';

const MENU: { id: DemoView; icon: LucideIcon; label: string }[] = [
  { id: 'Dashboard', icon: LayoutDashboard, label: 'Panel Główny' },
  { id: 'Tasks', icon: CalendarClock, label: 'Rezerwacje' },
  { id: 'Clients', icon: Users, label: 'Klienci' },
  { id: 'Team', icon: Shield, label: 'Zespół' },
  { id: 'Inventory', icon: Package, label: 'Magazyn' },
  { id: 'Reports', icon: FileBarChart2, label: 'Raporty' },
];

const DIVIDER = { background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' };

function NavButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`
        w-full flex items-center gap-4 rounded-xl transition-all duration-200 group relative
        px-5 py-3.5
        ${active ? 'bg-white/12 text-white' : 'text-white/55 hover:text-white hover:bg-white/7'}
      `}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-amber"
          style={{ boxShadow: '0 0 8px rgba(232,168,48,0.6)' }}
        />
      )}
      <Icon
        size={19}
        strokeWidth={active ? 2.5 : 2}
        className={
          active ? 'text-amber shrink-0' : 'text-white/35 shrink-0 group-hover:text-white/70 transition-colors'
        }
      />
      <span className="font-syne font-bold text-[14px] tracking-wide whitespace-nowrap">{label}</span>
    </button>
  );
}

/** The demo's copy of the dashboard sidebar; only the menu works. */
export function DemoSidebar({ activeView, onSelect }: { activeView: DemoView; onSelect: (view: DemoView) => void }) {
  return (
    <div
      className="w-72 flex flex-col shrink-0 border-r border-white/5"
      style={{ background: 'linear-gradient(160deg, #1a2e1e 0%, #1c3220 45%, #172818 100%)' }}
    >
      <div className="flex flex-col flex-1 overflow-y-auto px-5 pt-7 pb-5">
        <div className="flex items-center gap-3 group mb-7 px-1">
          <Image
            src="/detaileed-logo.svg"
            alt=""
            width={40}
            height={40}
            unoptimized
            className="w-10 h-10 rounded-[0.875rem] shrink-0 object-cover"
          />
          <div>
            <p className="font-sans font-black text-[19px] tracking-tight text-white leading-none">
              <span className="text-amber">D</span>etaileed
            </p>
            <span className="font-sans font-medium text-[8px] tracking-[0.22em] text-white/35 uppercase mt-1 block">
              Studio OS
            </span>
          </div>
        </div>

        <div className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border mb-6 bg-white/5 border-white/5 text-white/50">
          <Building2 size={14} className="text-white/30 shrink-0" />
          <span className="flex-1 text-left text-[11.5px] font-syne font-bold tracking-wide truncate">
            Demo Studio Detailing
          </span>
          <ChevronDown size={12} className="opacity-30 shrink-0" />
        </div>

        <nav aria-label="Widoki demo" className="space-y-1.5 flex-1">
          {MENU.map((item) => (
            <NavButton
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeView === item.id}
              onClick={() => onSelect(item.id)}
            />
          ))}
        </nav>

        <div className="my-4 h-px" style={DIVIDER} />

        <div className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-white/55">
          <Settings size={19} strokeWidth={2} className="text-white/35 shrink-0" />
          <span className="flex-1 text-left font-syne font-bold text-[14px] tracking-wide">Ustawienia</span>
          <ChevronDown size={13} className="opacity-30 shrink-0" />
        </div>

        <div className="my-4 h-px" style={DIVIDER} />

        <div className="flex items-center gap-3 px-4 py-2 mb-2 rounded-xl">
          <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center shrink-0">
            <span className="text-cream-warm font-bold text-[10px] uppercase">D</span>
          </div>
          <span className="text-white/35 text-[11px] font-medium truncate">demo@detaileed.com</span>
        </div>

        <div className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-white/40">
          <LogOut size={18} strokeWidth={2} className="text-white/30 shrink-0" />
          <span className="font-syne font-bold text-[14px] tracking-wide">Wyloguj</span>
        </div>
      </div>
    </div>
  );
}
