import React from 'react';
import { Link } from '@tanstack/react-router';
import {
  Users,
  Package,
  LayoutDashboard,
  CalendarClock,
  X,
  Building2,
  ChevronDown,
  FileBarChart2,
  Shield,
  Inbox,
  GanttChart,
} from 'lucide-react';
import { useStudio } from '@/features/studios';
import { usePendingRequestsCount } from '@/features/booking-requests';
import { isEmployeeRole } from '@/shared/lib/studioRole';
import logo from '@/shared/assets/logo.svg';
import { NavLink } from '@/app/layout/NavLink';
import { SettingsNav } from '@/app/layout/SettingsNav';
import { UserSection } from '@/app/layout/UserSection';
import type { NavItem } from '@/app/layout/navItems';

interface SidebarProps {
  studioId: string;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  userEmail?: string | null;
}

const DIVIDER_STYLE: React.CSSProperties = {
  height: '1px',
  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)',
};

export const Sidebar: React.FC<SidebarProps> = ({ studioId, onLogout, isOpen, onClose, userEmail }) => {
  const { selectedStudio } = useStudio();
  const isEmployee = isEmployeeRole(selectedStudio?.role);
  const { data: pendingRequests } = usePendingRequestsCount();

  const menuItems: NavItem[] = [
    { to: '/s/$studioId', icon: LayoutDashboard, label: 'Panel Główny' },
    { to: '/s/$studioId/tasks', icon: CalendarClock, label: 'Rezerwacje' },
    { to: '/s/$studioId/requests', icon: Inbox, label: 'Zapytania', badge: pendingRequests },
    { to: '/s/$studioId/board', icon: GanttChart, label: 'Grafik' },
    { to: '/s/$studioId/clients', icon: Users, label: 'Klienci' },
    ...(isEmployee ? [] : [{ to: '/s/$studioId/team', icon: Shield, label: 'Zespół' } satisfies NavItem]),
    { to: '/s/$studioId/inventory', icon: Package, label: 'Magazyn' },
    { to: '/s/$studioId/reports', icon: FileBarChart2, label: 'Raporty' },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-green-deep/60 backdrop-blur-xs z-40 lg:hidden" onClick={onClose} />}

      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-72 flex flex-col
          border-r border-white/5 shadow-[2px_0_40px_rgba(0,0,0,0.25)]
          transition-transform duration-500 ease-in-out
          lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          background: 'linear-gradient(160deg, var(--green-deep) 0%, #1c3220 45%, #172818 100%)',
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

          <SettingsNav studioId={studioId} onNavigate={onClose} />

          <div className="my-4" style={DIVIDER_STYLE} />

          <UserSection userEmail={userEmail} onLogout={onLogout} />
        </div>
      </div>
    </>
  );
};
