import { Menu } from 'lucide-react';
import { Button } from '@detaileed/ui';
import { DEMO_STUDIO } from './demoMenu';

/** The demo's copy of the dashboard's top bar: the menu button below `lg` and the studio / screen breadcrumb. */
export function DemoTopBar({ current, onOpenMenu }: { current: string; onOpenMenu: () => void }) {
  return (
    <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4 sm:px-7">
      <Button
        variant="ghost"
        size="sm"
        icon={Menu}
        aria-label="Otwórz menu demo"
        onClick={onOpenMenu}
        className="lg:hidden"
      />
      <nav aria-label="Ścieżka w demo" className="min-w-0">
        <ol className="flex min-w-0 items-center gap-1.5 text-sm">
          <li className="truncate text-muted-foreground">{DEMO_STUDIO.name}</li>
          <li aria-hidden className="text-faint">
            /
          </li>
          <li aria-current="page" className="shrink-0 text-foreground">
            {current}
          </li>
        </ol>
      </nav>
    </div>
  );
}
