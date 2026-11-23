import React, { useState } from 'react';
import { useMatchRoute } from '@tanstack/react-router';
import { ChevronDown, Settings, UserCircle, Wrench } from 'lucide-react';
import { NavLink } from '@/app/layout/NavLink';
import type { NavItem } from '@/app/layout/navItems';

const SETTINGS_ITEMS: NavItem[] = [
  { to: '/s/$studioId/settings/studio', icon: Wrench, label: 'Ustawienia Studia' },
  { to: '/s/$studioId/settings/user', icon: UserCircle, label: 'Moje Konto' },
];

/** The settings accordion: studio settings and the user's account. */
export const SettingsNav: React.FC<{ studioId: string; onNavigate?: () => void }> = ({ studioId, onNavigate }) => {
  const matchRoute = useMatchRoute();
  const isSettingsActive = SETTINGS_ITEMS.some((item) => matchRoute({ to: item.to, params: { studioId } }));
  // The accordion follows the active route until the user toggles it.
  const [settingsToggled, setSettingsToggled] = useState<boolean | null>(null);
  const settingsOpen = settingsToggled ?? isSettingsActive;

  return (
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
            <NavLink key={item.to} {...item} studioId={studioId} onNavigate={onNavigate} indent />
          ))}
        </div>
      )}
    </div>
  );
};
