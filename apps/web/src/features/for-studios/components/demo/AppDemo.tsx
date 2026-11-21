'use client';

import { useState } from 'react';
import { DemoSidebar, type DemoView } from './DemoSidebar';
import { DashboardView } from './DashboardView';
import { TasksView } from './TasksView';
import { ClientsView } from './ClientsView';
import { TeamView } from './TeamView';
import { InventoryView } from './InventoryView';
import { ReportsView } from './ReportsView';

/** A clickable copy of the studio dashboard on hard-coded data: no API and no sign-in. */
export function AppDemo() {
  const [view, setView] = useState<DemoView>('Dashboard');

  return (
    <div
      className="rounded-2xl overflow-hidden border border-slate-200/60 shadow-2xl"
      style={{ height: '720px', background: 'var(--color-cream)' }}
    >
      <div className="flex h-full">
        <DemoSidebar activeView={view} onSelect={setView} />
        <div className="flex-1 p-4 sm:p-8 lg:p-12 overflow-y-auto mesh-bg">
          <div className="max-w-7xl mx-auto pb-24 pt-2">
            {view === 'Dashboard' && <DashboardView onShowBookings={() => setView('Tasks')} />}
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
