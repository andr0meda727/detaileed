import React, { useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import {
  BarChart3,
  CalendarDays,
  GanttChart,
  Inbox,
  LayoutDashboard,
  Package,
  Settings,
  Shield,
  Users,
  X,
} from 'lucide-react';
import { Button, cn, Logo } from '@detaileed/ui';
import { useStudio } from '@/features/studios';
import { usePendingRequestsCount } from '@/features/booking-requests';
import { isEmployeeRole } from '@/shared/lib/studioRole';
import { NavLink } from '@/app/layout/NavLink';
import { StudioSwitcher } from '@/app/layout/StudioSwitcher';
import { UserMenu } from '@/app/layout/UserMenu';
import type { NavItem } from '@/app/layout/navItems';

interface SidebarProps {
  studioId: string;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  userEmail?: string | null;
}

/** The studio's navigation: a fixed 240px column on desktop, a drawer over the `overlay` below `lg`. */
export const Sidebar: React.FC<SidebarProps> = ({ studioId, onLogout, isOpen = false, onClose, userEmail }) => {
  const { selectedStudio } = useStudio();
  const isEmployee = isEmployeeRole(selectedStudio?.role);
  const { data: pendingRequests } = usePendingRequestsCount();

  // Escape closes the drawer on phones.
  useEffect(() => {
    if (!isOpen || !onClose) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const menuItems: NavItem[] = [
    { to: '/s/$studioId', icon: LayoutDashboard, label: 'Panel główny' },
    { to: '/s/$studioId/tasks', icon: CalendarDays, label: 'Rezerwacje' },
    { to: '/s/$studioId/requests', icon: Inbox, label: 'Zapytania', badge: pendingRequests },
    { to: '/s/$studioId/board', icon: GanttChart, label: 'Grafik' },
    { to: '/s/$studioId/clients', icon: Users, label: 'Klienci' },
    ...(isEmployee ? [] : [{ to: '/s/$studioId/team', icon: Shield, label: 'Zespół' } satisfies NavItem]),
    { to: '/s/$studioId/inventory', icon: Package, label: 'Magazyn' },
    { to: '/s/$studioId/reports', icon: BarChart3, label: 'Raporty' },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-overlay lg:hidden" onClick={onClose} aria-hidden />}

      <aside
        aria-label="Menu studia"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col gap-4 overflow-y-auto border-r border-border bg-subtle px-3 py-3.5',
          'motion-safe:transition-transform motion-safe:duration-200 lg:translate-x-0',
          // Closed on phones: off screen and out of the tab order.
          isOpen ? 'translate-x-0' : 'max-lg:invisible -translate-x-full',
        )}
      >
        <div className="flex items-center justify-between gap-2 px-1.5 pt-0.5">
          <Link
            to="/s/$studioId"
            params={{ studioId }}
            onClick={onClose}
            className="rounded-md text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Logo size={24} />
          </Link>
          <Button
            variant="ghost"
            size="sm"
            icon={X}
            aria-label="Zamknij menu"
            onClick={onClose}
            className="lg:hidden"
          />
        </div>

        <StudioSwitcher onNavigate={onClose} />

        <nav aria-label="Studio" className="flex flex-col gap-0.5">
          {menuItems.map((item) => (
            <NavLink key={item.to} {...item} studioId={studioId} onNavigate={onClose} />
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-0.5 border-t border-border pt-3">
          <NavLink
            to="/s/$studioId/settings/studio"
            icon={Settings}
            label="Ustawienia studia"
            studioId={studioId}
            onNavigate={onClose}
          />
          <UserMenu studioId={studioId} userEmail={userEmail} onLogout={onLogout} onNavigate={onClose} />
        </div>
      </aside>
    </>
  );
};
