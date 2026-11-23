import type { LucideIcon } from 'lucide-react';
import { BarChart3, CalendarDays, LayoutDashboard, Package, Shield, Users } from 'lucide-react';

export type DemoView = 'Dashboard' | 'Tasks' | 'Clients' | 'Team' | 'Inventory' | 'Reports';

/** The studio and the signed-in person the demo pretends to show. */
export const DEMO_STUDIO = { name: 'Demo Studio Detailing', address: 'ul. Przykładowa 12, Warszawa' };
export const DEMO_EMAIL = 'demo@detaileed.com';

/** The demo's screens in sidebar order, with the dashboard's icons and labels. */
export const DEMO_MENU: { id: DemoView; icon: LucideIcon; label: string }[] = [
  { id: 'Dashboard', icon: LayoutDashboard, label: 'Panel główny' },
  { id: 'Tasks', icon: CalendarDays, label: 'Rezerwacje' },
  { id: 'Clients', icon: Users, label: 'Klienci' },
  { id: 'Team', icon: Shield, label: 'Zespół' },
  { id: 'Inventory', icon: Package, label: 'Magazyn' },
  { id: 'Reports', icon: BarChart3, label: 'Raporty' },
];
