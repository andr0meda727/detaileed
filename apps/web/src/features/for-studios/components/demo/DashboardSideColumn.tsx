import { AlertTriangle, Calendar, Car, CheckCircle2, CreditCard, Package, User, UserCheck } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader } from '@detaileed/ui';
import { formatPln } from '@detaileed/domain/money';
import type { MOCK_INVENTORY } from '../../model/demoData';

const QUICK_ACTIONS = [
  { label: 'Nowa rezerwacja', icon: Calendar },
  { label: 'Nowy klient', icon: User },
  { label: 'Nowy pojazd', icon: Car },
  { label: 'Magazyn', icon: Package },
];

const ACTIVITY_FEED = [
  {
    id: 1,
    text: 'Nowe zlecenie dodane',
    sub: 'BMW M4 Competition, Jan Kowalski',
    time: '14 min temu',
    icon: CheckCircle2,
  },
  { id: 2, text: 'Rezerwacja potwierdzona', sub: 'Mercedes AMG GT, Anna Nowak', time: '32 min temu', icon: Calendar },
  { id: 3, text: 'Niski stan magazynowy', sub: 'Pad polerski 150mm, 4 szt', time: '1 godz. temu', icon: AlertTriangle },
  {
    id: 4,
    text: 'Zlecenie zakończone',
    sub: `Porsche 911 Turbo S, ${formatPln(9800)} zł`,
    time: '2 godz. temu',
    icon: CreditCard,
  },
  { id: 5, text: 'Nowy klient dodany', sub: 'Piotr Lewandowski, Tesla Model S', time: '3 godz. temu', icon: UserCheck },
];

/** Quick actions, stock alerts and the activity feed beside the demo's revenue and upcoming bookings. */
export function DashboardSideColumn({ lowStockItems }: { lowStockItems: typeof MOCK_INVENTORY }) {
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <Card>
        <CardHeader title="Szybkie akcje" titleAs="h4" />
        <CardContent className="grid grid-cols-2 gap-2 xl:grid-cols-1">
          {QUICK_ACTIONS.map(({ label, icon }) => (
            <Button key={label} variant="secondary" icon={icon} className="justify-start">
              {label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Alerty magazynowe"
          titleAs="h4"
          actions={<Badge tone="warning">{lowStockItems.length} do uzupełnienia</Badge>}
        />
        <ul className="divide-y divide-border">
          {lowStockItems.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                <p className="truncate text-xs text-faint">{item.categoryName}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono text-sm tabular-nums text-warning">
                  {item.stock} {item.unit}
                </p>
                <p className="font-mono text-xs tabular-nums text-faint">min. {item.minStock}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader title="Aktywność" titleAs="h4" />
        <ul className="flex flex-col py-2">
          {ACTIVITY_FEED.map((item) => (
            <li key={item.id} className="flex items-start gap-3 px-5 py-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <item.icon className="size-4" strokeWidth={1.75} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">{item.text}</p>
                <p className="truncate text-xs text-muted-foreground">{item.sub}</p>
              </div>
              <span className="shrink-0 text-xs whitespace-nowrap text-faint">{item.time}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
