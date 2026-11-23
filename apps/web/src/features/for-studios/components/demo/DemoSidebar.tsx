import { ChevronsUpDown, Settings, X } from 'lucide-react';
import { Avatar, Button, cn, Logo } from '@detaileed/ui';
import { DEMO_EMAIL, DEMO_MENU, DEMO_STUDIO, type DemoView } from './demoMenu';

/** A sidebar row, as in the dashboard: 36px, muted text, `muted` fill when hovered or active. */
const NAV_ROW =
  'flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors duration-150 ' +
  'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-subtle';

interface DemoSidebarProps {
  activeView: DemoView;
  onSelect: (view: DemoView) => void;
  /** The drawer below `lg`. */
  isOpen: boolean;
  onClose: () => void;
}

/** The demo's copy of the dashboard sidebar; only the menu works. */
export function DemoSidebar({ activeView, onSelect, isOpen, onClose }: DemoSidebarProps) {
  return (
    <>
      {isOpen && <div className="absolute inset-0 z-20 bg-overlay lg:hidden" onClick={onClose} aria-hidden />}

      <div
        className={cn(
          'absolute inset-y-0 left-0 z-30 flex w-60 shrink-0 flex-col gap-4 overflow-y-auto border-r border-border bg-subtle px-3 py-3.5',
          'motion-safe:transition-transform motion-safe:duration-200 lg:static lg:translate-x-0',
          // Closed below lg: out of the frame and out of the tab order.
          isOpen ? 'translate-x-0' : 'max-lg:invisible -translate-x-full',
        )}
      >
        <div className="flex items-center justify-between gap-2 px-1.5 pt-0.5">
          <Logo size={24} className="text-foreground" />
          <Button
            variant="ghost"
            size="sm"
            icon={X}
            aria-label="Zamknij menu demo"
            onClick={onClose}
            className="lg:hidden"
          />
        </div>

        <div className="flex h-11 w-full items-center justify-between gap-2 rounded-md border border-border-strong bg-surface px-2.5">
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-foreground">{DEMO_STUDIO.name}</span>
            <span className="truncate text-xs text-faint">{DEMO_STUDIO.address}</span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden />
        </div>

        <nav aria-label="Widoki demo" className="flex flex-col gap-0.5">
          {DEMO_MENU.map(({ id, icon: Icon, label }) => {
            const active = activeView === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelect(id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  NAV_ROW,
                  active
                    ? 'bg-muted font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-0.5 border-t border-border pt-3 text-muted-foreground">
          <div className={NAV_ROW}>
            <Settings className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="truncate">Ustawienia studia</span>
          </div>
          <div className={NAV_ROW}>
            <Avatar name={DEMO_EMAIL} size="sm" decorative />
            <span className="min-w-0 flex-1 truncate text-foreground">{DEMO_EMAIL}</span>
            <ChevronsUpDown className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
          </div>
        </div>
      </div>
    </>
  );
}
