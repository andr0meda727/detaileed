import React, { useState } from 'react';
import {
  History, Users, Package, LayoutDashboard, CalendarClock,
  LogOut, Zap, X, Building2, ChevronDown, Settings,
  Wrench, UserCircle, LucideIcon, FileBarChart2, Shield
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
        w-full flex items-center gap-4 rounded-2xl transition-all duration-200 group relative
        ${indent ? 'px-5 py-3' : 'px-5 py-3.5'}
        ${active
          ? 'bg-white/12 text-white'
          : 'text-white/55 hover:text-white hover:bg-white/7'
        }
      `}
    >
      {/* Amber accent line for active */}
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-amber"
          style={{ boxShadow: '0 0 8px rgba(232,168,48,0.6)' }}
        />
      )}
      <Icon
        size={19}
        strokeWidth={active ? 2.5 : 2}
        className={active ? 'text-amber shrink-0' : 'text-white/35 shrink-0 group-hover:text-white/70 transition-colors'}
      />
      <span className="font-syne font-bold text-[14px] tracking-wide whitespace-nowrap">{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onLogout, isOpen, onClose, userEmail }) => {
  const { selectedStudio } = useStudio();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const menuItems: { id: string; icon: LucideIcon; label: string }[] = [
    { id: 'Dashboard', icon: LayoutDashboard, label: 'Panel Główny' },
    { id: 'Tasks',     icon: CalendarClock,  label: 'Rezerwacje'  },
    { id: 'Clients',   icon: Users,          label: 'Klienci'     },
    { id: 'Team',      icon: Shield,         label: 'Zespół'      },
    { id: 'Inventory', icon: Package,        label: 'Magazyn'     },
    { id: 'Reports',   icon: FileBarChart2,  label: 'Raporty'     },
    { id: 'Archived',  icon: History,        label: 'Archiwum'    },
  ];

  const settingsItems: { id: string; icon: LucideIcon; label: string }[] = [
    { id: 'StudioSettings', icon: Wrench,     label: 'Ustawienia Studia' },
    { id: 'UserSettings',   icon: UserCircle, label: 'Moje Konto'        },
  ];

  const isSettingsActive = activeView === 'StudioSettings' || activeView === 'UserSettings';

  React.useEffect(() => {
    if (isSettingsActive) setSettingsOpen(true);
  }, [isSettingsActive]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-[#1a2e1e]/60 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-72 flex flex-col
          border-r border-white/5 shadow-[2px_0_40px_rgba(0,0,0,0.25)]
          transition-transform duration-500 ease-in-out
          lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          background: 'linear-gradient(160deg, #1a2e1e 0%, #1c3220 45%, #172818 100%)',
        }}
      >
        <button onClick={onClose} className="lg:hidden absolute top-6 right-6 text-white/30 hover:text-white transition-colors z-10">
          <X size={20} strokeWidth={2.5} />
        </button>

        <div className="flex flex-col flex-1 overflow-y-auto px-5 pt-7 pb-5">

          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group mb-7 px-1"
            onClick={() => setActiveView('Dashboard')}
          >
            <div
              className="w-10 h-10 rounded-[0.875rem] flex items-center justify-center shrink-0 transition-transform group-hover:rotate-12 duration-300"
              style={{
                background: 'rgba(255,255,255,0.08)',
                boxShadow: '0 0 20px rgba(232,168,48,0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              <Zap className="text-amber" size={19} strokeWidth={2.5} />
            </div>
            <div>
            <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '19px', letterSpacing: '-0.02em' }} className="text-white leading-none">
                <span className="text-amber">D</span>etailFlow
              </h1>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '8px', letterSpacing: '0.22em' }} className="text-white/35 uppercase mt-1 block">Studio OS</span>
            </div>
          </div>

          {/* Studio switcher */}
          <button
            onClick={() => setActiveView('Studios')}
            className={`
              w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border mb-6 transition-all duration-200 group
              ${activeView === 'Studios'
                ? 'bg-white/12 border-white/12 text-white'
                : 'bg-white/5 border-white/5 text-white/50 hover:text-white hover:bg-white/8 hover:border-white/10'
              }
            `}
          >
            <Building2
              size={14}
              className={activeView === 'Studios' ? 'text-amber shrink-0' : 'text-white/30 shrink-0 group-hover:text-white/60 transition-colors'}
            />
            <span className="flex-1 text-left text-[11.5px] font-syne font-bold tracking-wide truncate">
              {selectedStudio ? selectedStudio.name : 'Wybierz Studio'}
            </span>
            <ChevronDown size={12} className="opacity-30 shrink-0" />
          </button>

          {/* Main nav */}
          <nav className="space-y-1.5 flex-1">
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
          <div className="my-4" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' }} />

          {/* Settings accordion */}
          <div className="space-y-0.5">
            <button
              onClick={() => setSettingsOpen(v => !v)}
              className={`
                w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-200 group
                ${isSettingsActive ? 'bg-white/12 text-white' : 'text-white/55 hover:text-white hover:bg-white/7'}
              `}
            >
              <Settings
                size={19}
                strokeWidth={isSettingsActive ? 2.5 : 2}
                className={isSettingsActive ? 'text-amber shrink-0' : 'text-white/35 shrink-0 group-hover:text-white/70 transition-colors'}
              />
              <span className="flex-1 text-left font-syne font-bold text-[14px] tracking-wide whitespace-nowrap">Ustawienia</span>
              <ChevronDown
                size={13}
                className={`opacity-30 transition-transform duration-200 shrink-0 ${settingsOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {settingsOpen && (
              <div className="ml-5 pl-3 border-l border-white/6 space-y-0.5">
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
          <div className="my-4" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' }} />

          {/* User info */}
          {userEmail && (
            <div className="flex items-center gap-3 px-4 py-2 mb-2 rounded-xl">
              <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center shrink-0">
                <span className="text-cream-warm font-bold text-[10px] uppercase">{userEmail.charAt(0)}</span>
              </div>
              <span className="text-white/35 text-[11px] font-medium truncate">{userEmail}</span>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-white/40 hover:text-red-400 hover:bg-red-500/7 transition-all duration-200 group"
          >
            <LogOut size={18} strokeWidth={2} className="text-white/30 shrink-0 group-hover:text-red-400 transition-colors" />
            <span className="font-syne font-bold text-[14px] tracking-wide">Wyloguj</span>
          </button>

        </div>
      </div>
    </>
  );
};

export default Sidebar;
