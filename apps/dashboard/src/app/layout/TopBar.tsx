import React from 'react';
import { useMatches } from '@tanstack/react-router';
import { Menu } from 'lucide-react';
import { Button } from '@detaileed/ui';
import { pageName } from '@/app/layout/pageNames';

interface TopBarProps {
  studioName: string;
  /** Opens the sidebar drawer (phones and tablets). */
  onOpenMenu: () => void;
}

/** The slim bar above every studio screen: the menu button below `lg` and where you are (studio / screen). */
export const TopBar: React.FC<TopBarProps> = ({ studioName, onOpenMenu }) => {
  const current = useMatches({ select: (matches) => pageName(matches.at(-1)?.routeId ?? '') });
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background px-4 sm:px-7">
      <Button
        variant="ghost"
        size="sm"
        icon={Menu}
        aria-label="Otwórz menu"
        onClick={onOpenMenu}
        className="lg:hidden"
      />
      <nav aria-label="Ścieżka" className="min-w-0">
        <ol className="flex min-w-0 items-center gap-1.5 text-sm">
          <li className="truncate text-muted-foreground">{studioName}</li>
          {current && (
            <>
              <li aria-hidden className="text-faint">
                /
              </li>
              <li aria-current="page" className="shrink-0 text-foreground">
                {current}
              </li>
            </>
          )}
        </ol>
      </nav>
    </header>
  );
};
