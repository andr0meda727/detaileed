import React, { useState } from 'react';
import { Link, useMatchRoute } from '@tanstack/react-router';
import {
  Users,
  Package,
  LayoutDashboard,
  CalendarClock,
  LogOut,
  X,
  Building2,
  ChevronDown,
  Settings,
  Wrench,
  UserCircle,
  LucideIcon,
  FileBarChart2,
  Shield,
} from 'lucide-react';
import { useStudio } from '@/features/studios';
import { isEmployeeRole } from '@/shared/lib/studioRole';
import logo from '@/images/logo.svg';

type StudioPath =
  | '/s/$studioId'
  | '/s/$studioId/tasks'
  | '/s/$studioId/clients'
  | '/s/$studioId/team'
  | '/s/$studioId/inventory'
  | '/s/$studioId/reports'
  | '/s/$studioId/settings/studio'
  | '/s/$studioId/settings/user';

interface NavItem {
  to: StudioPath;
  icon: LucideIcon;
  label: string;
}

interface SidebarProps {
  studioId: string;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  userEmail?: string | null;
}

interface NavLinkProps extends NavItem {
  studioId: string;
  onNavigate?: () => void;
  indent?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, studioId, icon: Icon, label, onNavigate, indent = false }) => {
  const matchRoute = useMatchRoute();
  // The dashboard is the studio's index, so only an exact match counts as active there.
  const active = Boolean(matchRoute({ to, params: { studioId }, fuzzy: to !== '/s/$studioId' }));
  return (
    <Link
      to={to}
      params={{ studioId }}
      onClick={onNavigate}
      className={`
        w-full flex items-center gap-4 rounded-xl transition-all duration-200 group relative
        ${indent ? 'px-5 py-3' : 'px-5 py-3.5'}
        ${active ? 'bg-white/12 text-white' : 'text-white/55 hover:text-white hover:bg-white/7'}
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
        className={
          active ? 'text-amber shrink-0' : 'text-white/35 shrink-0 group-hover:text-white/70 transition-colors'
        }
      />
      <span className="font-syne font-bold text-[14px] tracking-wide whitespace-nowrap">{label}</span>
    </Link>
  );
};

const SETTINGS_ITEMS: NavItem[] = [
  { to: '/s/$studioId/settings/studio', icon: Wrench, label: 'Ustawienia Studia' },
  { to: '/s/$studioId/settings/user', icon: UserCircle, label: 'Moje Konto' },
];

const DIVIDER_STYLE: React.CSSProperties = {
  height: '1px',
  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)',
};

const Sidebar: React.FC<SidebarProps> = ({ studioId, onLogout, isOpen, onClose, userEmail }) => {
  const { selectedStudio } = useStudio();
  const matchRoute = useMatchRoute();
  const isEmployee = isEmployeeRole(selectedStudio?.role);

  const menuItems: NavItem[] = [
    { to: '/s/$studioId', icon: LayoutDashboard, label: 'Panel Główny' },
    { to: '/s/$studioId/tasks', icon: CalendarClock, label: 'Rezerwacje' },
    { to: '/s/$studioId/clients', icon: Users, label: 'Klienci' },
    ...(isEmployee ? [] : [{ to: '/s/$studioId/team', icon: Shield, label: 'Zespół' } satisfies NavItem]),
    { to: '/s/$studioId/inventory', icon: Package, label: 'Magazyn' },
    { to: '/s/$studioId/reports', icon: FileBarChart2, label: 'Raporty' },
  ];

  const isSettingsActive = SETTINGS_ITEMS.some((item) => matchRoute({ to: item.to, params: { studioId } }));
  // The accordion follows the active route until the user toggles it.
  const [settingsToggled, setSettingsToggled] = useState<boolean | null>(null);
  const settingsOpen = settingsToggled ?? isSettingsActive;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-[#1a2e1e]/60 backdrop-blur-xs z-40 lg:hidden" onClick={onClose} />}

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
        <button
          onClick={onClose}
          className="lg:hidden absolute top-6 right-6 text-white/30 hover:text-white transition-colors z-10"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <div className="flex flex-col flex-1 overflow-y-auto px-5 pt-7 pb-5">
          {/* Logo */}
          <Link
            to="/s/$studioId"
            params={{ studioId }}
            onClick={onClose}
            className="flex items-center gap-3 cursor-pointer group mb-7 px-1"
          >
            <img
              src={logo}
              alt="Detaileed logo"
              className="h-10 w-auto shrink-0 transition-transform duration-300 group-hover:scale-105"
            />
            <div>
              <h1
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 900,
                  fontSize: '19px',
                  letterSpacing: '-0.02em',
                }}
                className="text-white leading-none"
              >
                <span className="text-amber">D</span>etaileed
              </h1>
            </div>
          </Link>

          {/* Studio switcher */}
          <Link
            to="/studios"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border mb-6 transition-all duration-200 group bg-white/5 border-white/5 text-white/50 hover:text-white hover:bg-white/8 hover:border-white/10"
          >
            <Building2 size={14} className="text-white/30 shrink-0 group-hover:text-white/60 transition-colors" />
            <span className="flex-1 text-left text-[11.5px] font-syne font-bold tracking-wide truncate">
              {selectedStudio ? selectedStudio.name : 'Wybierz Studio'}
            </span>
            <ChevronDown size={12} className="opacity-30 shrink-0" />
          </Link>

          {/* Main nav */}
          <nav className="space-y-1.5 flex-1">
            {menuItems.map((item) => (
              <NavLink key={item.to} {...item} studioId={studioId} onNavigate={onClose} />
            ))}
          </nav>

          <div className="my-4" style={DIVIDER_STYLE} />

          {/* Settings accordion */}
          <div className="space-y-0.5">
            <button
              onClick={() => setSettingsToggled(!settingsOpen)}
              className={`
                w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 group
                ${isSettingsActive ? 'bg-white/12 text-white' : 'text-white/55 hover:text-white hover:bg-white/7'}
              `}
            >
              <Settings
                size={19}
                strokeWidth={isSettingsActive ? 2.5 : 2}
                className={
                  isSettingsActive
                    ? 'text-amber shrink-0'
                    : 'text-white/35 shrink-0 group-hover:text-white/70 transition-colors'
                }
              />
              <span className="flex-1 text-left font-syne font-bold text-[14px] tracking-wide whitespace-nowrap">
                Ustawienia
              </span>
              <ChevronDown
                size={13}
                className={`opacity-30 transition-transform duration-200 shrink-0 ${settingsOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {settingsOpen && (
              <div className="ml-5 pl-3 border-l border-white/6 space-y-0.5">
                {SETTINGS_ITEMS.map((item) => (
                  <NavLink key={item.to} {...item} studioId={studioId} onNavigate={onClose} indent />
                ))}
              </div>
            )}
          </div>

          <div className="my-4" style={DIVIDER_STYLE} />

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
            className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/7 transition-all duration-200 group"
          >
            <LogOut
              size={18}
              strokeWidth={2}
              className="text-white/30 shrink-0 group-hover:text-red-400 transition-colors"
            />
            <span className="font-syne font-bold text-[14px] tracking-wide">Wyloguj</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
