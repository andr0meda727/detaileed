import React from 'react';
import { Link, useMatchRoute } from '@tanstack/react-router';
import type { NavItem } from '@/app/layout/navItems';

interface NavLinkProps extends NavItem {
  studioId: string;
  onNavigate?: () => void;
  indent?: boolean;
}

export const NavLink: React.FC<NavLinkProps> = ({
  to,
  studioId,
  icon: Icon,
  label,
  badge,
  onNavigate,
  indent = false,
}) => {
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
      {!!badge && (
        <span
          aria-label={`${badge} oczekujących`}
          className="ml-auto min-w-6 h-6 px-1.5 rounded-full bg-amber text-green-deep text-[11px] font-bold flex items-center justify-center"
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
};
