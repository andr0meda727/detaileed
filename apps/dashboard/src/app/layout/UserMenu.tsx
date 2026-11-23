import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ChevronsUpDown, LogOut, UserCircle } from 'lucide-react';
import {
  Avatar,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ThemeSwitch,
} from '@detaileed/ui';
import { NAV_ROW } from '@/app/layout/navItems';

interface UserMenuProps {
  studioId: string;
  userEmail?: string | null;
  onLogout: () => void;
  onNavigate?: () => void;
}

/** The signed-in user at the bottom of the sidebar: the theme switch, their account and signing out. */
export const UserMenu: React.FC<UserMenuProps> = ({ studioId, userEmail, onLogout, onNavigate }) => {
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(NAV_ROW, 'text-muted-foreground hover:bg-muted hover:text-foreground')}
        aria-label="Menu użytkownika"
      >
        <Avatar name={userEmail} size="sm" decorative />
        <span className="min-w-0 flex-1 truncate text-left">{userEmail ?? 'Konto'}</span>
        <ChevronsUpDown className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        {userEmail && <DropdownMenuLabel className="truncate">{userEmail}</DropdownMenuLabel>}
        <div className="px-1 py-1.5">
          <ThemeSwitch fullWidth />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          icon={UserCircle}
          onSelect={() => {
            onNavigate?.();
            void navigate({ to: '/s/$studioId/settings/user', params: { studioId } });
          }}
        >
          Moje konto
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem danger icon={LogOut} onSelect={onLogout}>
          Wyloguj
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
