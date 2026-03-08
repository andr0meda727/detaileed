import React, { useState } from 'react';
import {
  History, Users, Package, LayoutDashboard, CalendarClock,
  LogOut, Zap, X, Building2, ChevronDown, Settings,
  Wrench, UserCircle, LucideIcon,
} from 'lucide-react';
import { ViewType } from '../types';
import { useStudio } from '../contexts/StudioContext';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  userEmail?: string | null;
}

// ─── NavBtn (defined outside Sidebar to satisfy TypeScript) ──────────────────
interface NavBtnProps {
  id: string;
  icon: LucideIcon;
  label: string;
  activeView: ViewType;
  setActiveView: (v: ViewType) => void;
  indent?: boolean;
}

const NavBtn: React.FC<NavBtnProps> = ({ id, icon: Icon, label, activeView, setActiveView, indent = false }) => {
  const active = activeView === id;
  return (
    <button
      onClick={() => setActiveView(id as ViewType)}
      className={`
        w-full flex items-center gap-3 rounded-2xl transition-all duration-200 group
        ${indent ? 'px-4 py-3' : 'px-4 py-3.5'}
        ${active
          ? 'bg-white/15 text-white border border-white/10'
          : 'text-white/60 hover:text-white hover:bg-white/8'
        }
      `}
    >
      <Icon
        size={18}
        strokeWidth={active ? 2.5 : 2}
        className={active ? 'text-[#F7E7CE] shrink-0' : 'text-white/40 shrink-0 group-hover:text-white/80 transition-colors'}
      />
      <span className="font-semibold text-[11px] uppercase tracking-[0.12em] whitespace-nowrap">{label}</span>
    </button>
  );
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onLogout, isOpen, onClose, userEmail }) => {
  const { selectedStudio } = useStudio();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const menuItems: { id: string; icon: LucideIcon; label: string }[] = [
    { id: 'Dashboard', icon: LayoutDashboard, label: 'Panel Główny' },
    { id: 'Tasks',     icon: CalendarClock,  label: 'Rezerwacje' },
    { id: 'Clients',   icon: Users,          label: 'Klienci (CRM)' },
    { id: 'Inventory', icon: Package,        label: 'Magazyn' },
    { id: 'Archived',  icon: History,        label: 'Archiwum Zleceń' },
  ];

  const settingsItems: { id: string; icon: LucideIcon; label: string }[] = [
    { id: 'StudioSettings', icon: Wrench,     label: 'Ustawienia Studia' },
    { id: 'UserSettings',   icon: UserCircle, label: 'Moje Konto' },
  ];

  const isSettingsActive = activeView === 'StudioSettings' || activeView === 'UserSettings';

  React.useEffect(() => {
    if (isSettingsActive) setSettingsOpen(true);
  }, [isSettingsActive]);

  const navShared = (active: boolean) => `
    w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group
    ${active ? 'bg-white/15 text-white border border-white/10' : 'text-white/60 hover:text-white hover:bg-white/8'}
  `;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-[#102C26]/60 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#102C26] flex flex-col
        border-r border-white/5 shadow-2xl transition-transform duration-500 ease-in-out
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <button onClick={onClose} className="lg:hidden absolute top-6 right-6 text-white/40 hover:text-white transition-colors z-10">
          <X size={20} strokeWidth={2.5} />
        </button>

        <div className="flex flex-col flex-1 overflow-y-auto px-5 pt-7 pb-5">

          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group mb-6 px-1" onClick={() => setActiveView('Dashboard')}>
            <div className="w-10 h-10 bg-[#F7E7CE] rounded-xl flex items-center justify-center shadow-[0_0_24px_rgba(247,231,206,0.2)] transition-transform group-hover:rotate-12 duration-300 shrink-0">
              <Zap className="text-[#102C26]" size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white tracking-tighter leading-none uppercase">DetailFlow</h1>
              <span className="text-[8px] font-semibold text-[#F7E7CE]/60 uppercase tracking-[0.4em] mt-0.5 block">Studio OS</span>
            </div>
          </div>

          {/* Studio switcher */}
          <button
            onClick={() => setActiveView('Studios')}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-2xl border mb-6 transition-all duration-200 group
              ${activeView === 'Studios'
                ? 'bg-white/15 border-white/15 text-white'
                : 'bg-white/6 border-white/6 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/12'
              }
            `}
          >
            <Building2
              size={15}
              className={activeView === 'Studios' ? 'text-[#F7E7CE] shrink-0' : 'text-white/35 shrink-0 group-hover:text-white/70 transition-colors'}
            />
            <span className="flex-1 text-left text-[10px] font-semibold uppercase tracking-[0.12em] truncate">
              {selectedStudio ? selectedStudio.name : 'Moje Studia'}
            </span>
            <ChevronDown size={13} className="opacity-40 shrink-0" />
          </button>

          {/* Main nav */}
          <nav className="space-y-0.5 flex-1">
            {menuItems.map(item => (
              <NavBtn
                key={item.id}
                id={item.id}
                icon={item.icon}
                label={item.label}
                activeView={activeView}
                setActiveView={setActiveView}
              />
            ))}
          </nav>

          {/* Divider */}
          <div className="border-t border-white/8 my-4" />

          {/* Settings accordion */}
          <div className="space-y-0.5">
            <button
              onClick={() => setSettingsOpen(v => !v)}
              className={navShared(isSettingsActive)}
            >
              <Settings
                size={18}
                strokeWidth={isSettingsActive ? 2.5 : 2}
                className={isSettingsActive ? 'text-[#F7E7CE] shrink-0' : 'text-white/40 shrink-0 group-hover:text-white/80 transition-colors'}
              />
              <span className="flex-1 text-left font-semibold text-[11px] uppercase tracking-[0.12em] whitespace-nowrap">Ustawienia</span>
              <ChevronDown
                size={14}
                className={`opacity-40 transition-transform duration-200 shrink-0 ${settingsOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {settingsOpen && (
              <div className="ml-5 pl-3 border-l border-white/8 space-y-0.5">
                {settingsItems.map(item => (
                  <NavBtn
                    key={item.id}
                    id={item.id}
                    icon={item.icon}
                    label={item.label}
                    activeView={activeView}
                    setActiveView={setActiveView}
                    indent
                  />
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-white/8 my-4" />

          {/* User info */}
          {userEmail && (
            <div className="flex items-center gap-3 px-4 py-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-[#F7E7CE]/15 flex items-center justify-center shrink-0">
                <span className="text-[#F7E7CE] font-bold text-[10px] uppercase">{userEmail.charAt(0)}</span>
              </div>
              <span className="text-white/40 text-[11px] font-medium truncate">{userEmail}</span>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-white/60 hover:text-red-400 hover:bg-red-500/8 transition-all duration-200 group"
          >
            <LogOut size={18} strokeWidth={2} className="text-white/40 shrink-0 group-hover:text-red-400 transition-colors" />
            <span className="font-semibold text-[11px] uppercase tracking-[0.12em]">Wyloguj</span>
          </button>

        </div>
      </div>
    </>
  );
};

export default Sidebar;
