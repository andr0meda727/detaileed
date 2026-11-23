import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Building2, Check, ChevronsUpDown, LayoutGrid } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@detaileed/ui';
import { useStudio, useStudios } from '@/features/studios';

/** The current studio's name; opens a menu of the user's studios and a link to the studio list. */
export const StudioSwitcher: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const { selectedStudio } = useStudio();
  const { data: studios = [] } = useStudios();
  const navigate = useNavigate();

  const go = (to: () => Promise<void>) => {
    onNavigate?.();
    void to();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={
          'flex h-11 w-full items-center justify-between gap-2 rounded-md border border-border-strong bg-surface px-2.5 ' +
          'text-left transition-colors duration-150 hover:bg-muted outline-none focus-visible:ring-2 ' +
          'focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-subtle'
        }
        aria-label={`Studio: ${selectedStudio?.name ?? 'nie wybrano'}. Zmień studio`}
      >
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-foreground">
            {selectedStudio?.name ?? 'Wybierz studio'}
          </span>
          {selectedStudio?.address && <span className="truncate text-xs text-faint">{selectedStudio.address}</span>}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width) min-w-56">
        <DropdownMenuLabel>Twoje studia</DropdownMenuLabel>
        {studios.map((studio) => {
          const current = studio.studioId === selectedStudio?.studioId;
          return (
            <DropdownMenuItem
              key={studio.studioId}
              icon={Building2}
              aria-current={current ? 'true' : undefined}
              onSelect={() => go(() => navigate({ to: '/s/$studioId', params: { studioId: studio.studioId } }))}
            >
              <span className="flex-1 truncate">{studio.name}</span>
              {current && <Check className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={LayoutGrid} onSelect={() => go(() => navigate({ to: '/studios' }))}>
          Wszystkie studia
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
