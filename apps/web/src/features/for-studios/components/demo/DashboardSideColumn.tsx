import type { CSSProperties } from 'react';
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  CreditCard,
  Package,
  Star,
  User,
  UserCheck,
} from 'lucide-react';
import type { MOCK_INVENTORY } from '../../model/demoData';

const QUICK_ACTIONS: { label: string; icon: typeof Calendar; style: CSSProperties; iconColor: string }[] = [
  {
    label: 'Rezerwacja',
    icon: Calendar,
    style: { background: 'linear-gradient(135deg, #1a2e1e 0%, #2d4f33 100%)', color: '#f5f0e8' },
    iconColor: '#e8a830',
  },
  {
    label: 'Nowy Klient',
    icon: User,
    style: { background: 'linear-gradient(135deg, #e8a830 0%, #d4941c 100%)', color: '#1a2e1e' },
    iconColor: '#1a2e1e',
  },
  {
    label: 'Nowy Pojazd',
    icon: Star,
    style: { background: 'linear-gradient(135deg, #3d6b46 0%, #2d5235 100%)', color: '#f5f0e8' },
    iconColor: '#c8e6be',
  },
  {
    label: 'Magazyn',
    icon: Package,
    style: {
      background: 'linear-gradient(135deg, #f0ebe0 0%, #e8e0d0 100%)',
      color: '#1a2e1e',
      border: '1px solid rgba(26,46,30,0.1)',
    },
    iconColor: '#3d6b46',
  },
];

const ACTIVITY_FEED = [
  {
    id: 1,
    text: 'Nowe zlecenie dodane',
    sub: 'BMW M4 Competition — Jan Kowalski',
    time: '14 min temu',
    icon: CheckCircle2,
    color: 'text-green-deep bg-cream-warm/30',
  },
  {
    id: 2,
    text: 'Rezerwacja potwierdzona',
    sub: 'Mercedes AMG GT — Anna Nowak',
    time: '32 min temu',
    icon: Calendar,
    color: 'text-blue-500 bg-blue-50',
  },
  {
    id: 3,
    text: 'Niski stan magazynowy',
    sub: 'Pad polerski 150mm — 4 szt',
    time: '1 godz. temu',
    icon: AlertTriangle,
    color: 'text-amber bg-amber/10',
  },
  {
    id: 4,
    text: 'Zlecenie zakończone',
    sub: 'Porsche 911 Turbo S — XXX zł',
    time: '2 godz. temu',
    icon: CreditCard,
    color: 'text-violet-500 bg-violet-50',
  },
  {
    id: 5,
    text: 'Nowy klient dodany',
    sub: 'Piotr Lewandowski — Tesla Model S',
    time: '3 godz. temu',
    icon: UserCheck,
    color: 'text-cyan-500 bg-cyan-50',
  },
];

/** Quick actions, stock alerts and the activity feed beside the demo's schedule. */
export function DashboardSideColumn({ lowStockItems }: { lowStockItems: typeof MOCK_INVENTORY }) {
  return (
    <div className="lg:col-span-4 flex flex-col gap-6 lg:gap-8">
      <div className="floating-card-static p-6 sm:p-7">
        <h4 className="text-lg font-sans font-bold text-green-deep mb-5">Szybkie Akcje</h4>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((qa) => (
            <button
              key={qa.label}
              type="button"
              className="p-4 rounded-2xl flex flex-col items-center gap-2.5 transition-all active:scale-95 hover:-translate-y-1 hover:shadow-lg duration-200"
              style={qa.style}
            >
              <qa.icon size={22} strokeWidth={2} color={qa.iconColor} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{qa.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="floating-card-static p-6 sm:p-7">
        <div className="flex items-center justify-between mb-5">
          <h4 className="text-lg font-sans font-bold text-green-deep">Alerty Magazynowe</h4>
          <div className="w-9 h-9 rounded-[0.875rem] flex items-center justify-center bg-amber/15 text-amber">
            <Package size={16} />
          </div>
        </div>
        <div className="space-y-2">
          {lowStockItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl flex items-center justify-between"
              style={{ background: 'rgba(232,168,48,0.07)', border: '1px solid rgba(232,168,48,0.15)' }}
            >
              <div>
                <h5 className="text-[13px] font-bold text-green-deep truncate">{item.name}</h5>
                <p className="text-[10px] font-semibold text-amber uppercase tracking-widest">{item.categoryName}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-base font-bold text-amber font-mono">
                  {item.stock}
                  <span className="text-[11px] ml-0.5 opacity-60">{item.unit}</span>
                </p>
                <p className="text-[10px] font-semibold text-green-deep/35 uppercase">min. {item.minStock}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="floating-card-static p-6 sm:p-7">
        <div className="flex items-center justify-between mb-5">
          <h4 className="text-lg font-sans font-bold text-green-deep">Aktywność</h4>
          <div className="w-9 h-9 bg-green-deep text-cream rounded-[0.875rem] flex items-center justify-center">
            <Activity size={16} />
          </div>
        </div>
        <div className="space-y-0.5">
          {ACTIVITY_FEED.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3.5 p-3 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-green-deep/4"
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
    </div>
  );
}
