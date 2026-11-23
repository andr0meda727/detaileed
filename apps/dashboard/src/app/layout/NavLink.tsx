import React from 'react';
import { Link, useMatchRoute } from '@tanstack/react-router';
import { cn } from '@detaileed/ui';
import { NAV_ROW, type NavItem } from '@/app/layout/navItems';

interface NavLinkProps extends NavItem {
  studioId: string;
  onNavigate?: () => void;
}

/** One sidebar link; the active one gets the `muted` fill and full-strength text. */
export const NavLink: React.FC<NavLinkProps> = ({ to, studioId, icon: Icon, label, badge, onNavigate }) => {
  const matchRoute = useMatchRoute();
  // The dashboard is the studio's index, so only an exact match counts as active there.
  const exact = to === '/s/$studioId';
  const active = Boolean(matchRoute({ to, params: { studioId }, fuzzy: !exact }));
  return (
    <Link
      to={to}
      params={{ studioId }}
      onClick={onNavigate}
      activeOptions={{ exact }}
      aria-current={active ? 'page' : undefined}
      className={cn(
        NAV_ROW,
        active ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
      <span className="truncate">{label}</span>
      {!!badge && (
        <span
          aria-label={`${badge} oczekujących`}
          className="ml-auto rounded-full border border-border-strong px-1.5 font-mono text-xs tabular-nums text-foreground"
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
};
