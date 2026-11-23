import { Card, cn, Stat } from '@detaileed/ui';
import { DEMO_TODAY, MOCK_BOOKINGS, MOCK_CLIENTS, MOCK_INVENTORY } from '../../model/demoData';
import { dateOf, fullDateOf } from '../../model/demoFormat';
import { DemoHeader } from './DemoHeader';
import { DashboardSideColumn } from './DashboardSideColumn';
import { TodaySchedule, UpcomingBookings } from './DashboardBookings';
import { DemoRevenueCard } from './DemoRevenueCard';

const byTime = (a: { scheduledAt: string }, b: { scheduledAt: string }) => a.scheduledAt.localeCompare(b.scheduledAt);
const todayBookings = MOCK_BOOKINGS.filter((b) => dateOf(b.scheduledAt) === DEMO_TODAY).sort(byTime);
const upcomingBookings = MOCK_BOOKINGS.filter((b) => dateOf(b.scheduledAt) > DEMO_TODAY).sort(byTime);
const lowStockItems = MOCK_INVENTORY.filter((i) => i.stock < i.minStock);
const todayRevenue = todayBookings.filter((b) => b.completedAt !== null).reduce((sum, b) => sum + b.totalPrice, 0);

const STATS = [
  { label: 'Przychód dziś', value: `${todayRevenue} zł`, hint: 'z zakończonych wizyt' },
  {
    label: 'Aktywne zlecenia',
    value: MOCK_BOOKINGS.filter((b) => b.completedAt === null).length,
    hint: `${todayBookings.length} dziś`,
  },
  { label: 'Baza klientów', value: MOCK_CLIENTS.length, hint: 'aktywni' },
  { label: 'Ukończone', value: MOCK_BOOKINGS.filter((b) => b.completedAt !== null).length, hint: 'łącznie' },
];

/** Dividers between the stat cells: a 2×2 grid on phones and tablets, one row from `lg`. */
const CELL_BORDERS = ['border-r border-b lg:border-b-0', 'border-b lg:border-r lg:border-b-0', 'border-r', ''];

/** The demo's home screen: greeting, key figures, today's schedule, revenue, upcoming bookings and side widgets. */
export function DashboardView({ onShowBookings }: { onShowBookings: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <DemoHeader
        title="Dzień dobry"
        subtitle={
          <span className="flex flex-wrap items-center gap-x-1.5">
            <span>{fullDateOf(DEMO_TODAY)}</span>
            <span aria-hidden className="text-faint">
              ·
            </span>
            <span>
              Masz {todayBookings.length} zleceń na dziś i {upcomingBookings.length} nadchodzących.
            </span>
          </span>
        }
      />

      <Card role="group" aria-label="Podsumowanie" className="grid grid-cols-2 overflow-hidden lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <Stat
            key={stat.label}
            className={cn('border-border px-5 py-4', CELL_BORDERS[i])}
            label={stat.label}
            value={stat.value}
            hint={stat.hint}
          />
        ))}
      </Card>

      <TodaySchedule bookings={todayBookings} />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <DemoRevenueCard />
          <UpcomingBookings bookings={upcomingBookings} onShowAll={onShowBookings} />
        </div>
        <DashboardSideColumn lowStockItems={lowStockItems} />
      </div>
    </div>
  );
}
