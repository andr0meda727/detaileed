import React from 'react';
import { Calendar, CheckCircle2, Wrench, Activity, CreditCard, AlertTriangle } from 'lucide-react';

const activityFeed = [
  {
    id: 1,
    text: 'Nowe zlecenie dodane',
    sub: 'Sprawdź zakładkę rezerwacji',
    time: '14 min temu',
    icon: CheckCircle2,
    color: 'text-green-deep bg-cream-warm/30',
  },
  {
    id: 2,
    text: 'Nowa rezerwacja w systemie',
    sub: 'Klient dodany automatycznie',
    time: '32 min temu',
    icon: Calendar,
    color: 'text-blue-500 bg-blue-50',
  },
  {
    id: 3,
    text: 'Niski stan magazynowy',
    sub: 'Sprawdź magazyn',
    time: '1 godz. temu',
    icon: AlertTriangle,
    color: 'text-amber-500 bg-amber-50',
  },
  {
    id: 4,
    text: 'System zaktualizowany',
    sub: 'Synchronizacja z backendem',
    time: '2 godz. temu',
    icon: CreditCard,
    color: 'text-violet-500 bg-violet-50',
  },
  {
    id: 5,
    text: 'Dane załadowane poprawnie',
    sub: 'API połączone',
    time: '3 godz. temu',
    icon: Wrench,
    color: 'text-cyan-500 bg-cyan-50',
  },
];

/** Recent activity (static sample entries until the API offers an activity log). */
export const ActivityFeed: React.FC = () => {
  return (
    <div className="floating-card-static p-6 sm:p-7">
      <div className="flex items-center justify-between mb-5">
        <h4 className="text-lg font-sans font-bold text-green-deep">Aktywność</h4>
        <div className="w-9 h-9 bg-green-deep text-cream-warm rounded-[0.875rem] flex items-center justify-center">
          <Activity size={16} />
        </div>
      </div>
      <div className="space-y-0.5">
        {activityFeed.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3.5 p-3 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-[rgba(26,46,30,0.04)]"
            style={{ borderRadius: '1rem' }}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
              <item.icon size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-green-deep leading-tight">{item.text}</p>
              <p className="text-[9px] font-semibold text-green-deep/35 mt-0.5 truncate">{item.sub}</p>
            </div>
            <span className="text-[8px] font-semibold text-green-deep/25 whitespace-nowrap shrink-0 mt-0.5">
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
