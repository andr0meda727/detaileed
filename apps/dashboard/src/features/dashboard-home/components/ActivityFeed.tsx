import React from 'react';
import { Calendar, CheckCircle2, Wrench, CreditCard, AlertTriangle } from 'lucide-react';
import { Card, CardHeader } from '@detaileed/ui';

const activityFeed = [
  { id: 1, text: 'Nowe zlecenie dodane', sub: 'Sprawdź zakładkę rezerwacji', time: '14 min temu', icon: CheckCircle2 },
  {
    id: 2,
    text: 'Nowa rezerwacja w systemie',
    sub: 'Klient dodany automatycznie',
    time: '32 min temu',
    icon: Calendar,
  },
  { id: 3, text: 'Niski stan magazynowy', sub: 'Sprawdź magazyn', time: '1 godz. temu', icon: AlertTriangle },
  { id: 4, text: 'System zaktualizowany', sub: 'Synchronizacja z backendem', time: '2 godz. temu', icon: CreditCard },
  { id: 5, text: 'Dane załadowane poprawnie', sub: 'API połączone', time: '3 godz. temu', icon: Wrench },
];

/** Recent activity (static sample entries until the API offers an activity log). */
export const ActivityFeed: React.FC = () => (
  <Card>
    <CardHeader title="Aktywność" />
    <ul className="flex flex-col py-2">
      {activityFeed.map((item) => (
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
);
