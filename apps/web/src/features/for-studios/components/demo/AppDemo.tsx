'use client';

import { useState } from 'react';
import { DemoSidebar } from './DemoSidebar';
import { DEMO_MENU, type DemoView } from './demoMenu';
import { DemoTopBar } from './DemoTopBar';
import { DashboardView } from './DashboardView';
import { TasksView } from './TasksView';
import { ClientsView } from './ClientsView';
import { TeamView } from './TeamView';
import { InventoryView } from './InventoryView';
import { ReportsView } from './ReportsView';

/**
 * A clickable copy of the studio dashboard on hard-coded data: no API and no sign-in. It follows the page theme
 * through the tokens. Below `lg` the sidebar becomes a drawer inside the frame, as in the dashboard.
 */
export function AppDemo() {
  const [view, setView] = useState<DemoView>('Dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const current = DEMO_MENU.find((item) => item.id === view)?.label ?? '';

  const select = (next: DemoView) => {
    setView(next);
    setMenuOpen(false);
  };

  return (
    <div className="relative flex h-[720px] overflow-hidden rounded-lg border border-border bg-background text-left font-sans text-foreground">
      <DemoSidebar activeView={view} onSelect={select} isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DemoTopBar current={current} onOpenMenu={() => setMenuOpen(true)} />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1180px] p-4 pb-16 sm:p-7 sm:pb-16">
            {view === 'Dashboard' && <DashboardView onShowBookings={() => select('Tasks')} />}
            {view === 'Tasks' && <TasksView />}
            {view === 'Clients' && <ClientsView />}
            {view === 'Team' && <TeamView />}
            {view === 'Inventory' && <InventoryView />}
            {view === 'Reports' && <ReportsView />}
          </div>
        </div>
      </div>
    </div>
  );
}
