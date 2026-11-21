import { useMemo, useState } from 'react';
import { CalendarDays, LayoutList, Search, User } from 'lucide-react';
import { MOCK_BOOKINGS, type DemoBooking } from '../../model/demoData';
import { dateOf, dayMonthOf, longDateOf, timeOf } from '../../model/demoFormat';
import { DemoHeader } from './DemoHeader';

type Tab = 'in-progress' | 'calendar' | 'search';
type StatusFilter = 'all' | 'created' | 'completed';

const TABS = [
  { id: 'in-progress', icon: LayoutList, label: 'Zlecenia' },
  { id: 'calendar', icon: CalendarDays, label: 'Kalendarz' },
  { id: 'search', icon: Search, label: 'Wyszukiwarka' },
] as const;

const FILTERS = [
  { id: 'all', label: 'Wszystkie' },
  { id: 'created', label: 'W toku' },
  { id: 'completed', label: 'Ukończone' },
] as const;

function BookingCard({ booking, index }: { booking: DemoBooking; index: number }) {
  return (
    <div
      className="floating-card flex flex-col sm:flex-row items-stretch cursor-pointer overflow-hidden"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className="p-5 sm:p-6 flex flex-col items-center justify-center min-w-[110px] shrink-0"
        style={{ borderRight: '1px solid rgba(26,46,30,0.05)', background: 'rgba(26,46,30,0.02)' }}
      >
        <span className="text-2xl font-bold text-green-deep font-mono leading-none">
          {dayMonthOf(booking.scheduledAt)}
        </span>
        <span className="text-[10px] font-semibold text-green-deep/35 font-mono tracking-widest mt-2">
          {timeOf(booking.scheduledAt)}
        </span>
      </div>
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-green-deep text-cream px-3 py-1 rounded-lg font-mono text-[10px] font-bold tracking-widest">
            {booking.vehicle.licensePlate}
          </span>
          <h4 className="font-sans font-bold text-green-deep text-base tracking-tight truncate">
            {booking.vehicle.brand} {booking.vehicle.model}
          </h4>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          <span className="text-[11px] font-semibold text-green-deep/40 uppercase tracking-wide">
            {booking.services.join(', ')}
          </span>
          <span className="text-[11px] font-semibold text-green-light/70">
            <User size={10} className="inline mr-1" />
            {booking.client.name}
          </span>
        </div>
      </div>
      <div
        className="px-5 sm:px-6 py-4 flex items-center justify-end sm:shrink-0"
        style={{ borderTop: '1px solid rgba(26,46,30,0.04)', background: 'rgba(26,46,30,0.01)' }}
      >
        <span
          className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border"
          style={{
            color: booking.statusColor,
            borderColor: booking.statusColor + '35',
            backgroundColor: booking.statusColor + '10',
          }}
        >
          {booking.status}
        </span>
      </div>
    </div>
  );
}

const EMPTY_BOX = 'bg-white rounded-2xl text-center border-2 border-dashed border-slate-100';

/** The demo's bookings screen: list by day with a status filter, and a search. */
export function TasksView() {
  const [tab, setTab] = useState<Tab>('in-progress');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return MOCK_BOOKINGS.filter((b) => status === 'all' || (status === 'created') === (b.completedAt === null))
      .filter(
        (b) =>
          !q ||
          b.client.name.toLowerCase().includes(q) ||
          b.vehicle.brand.toLowerCase().includes(q) ||
          b.vehicle.licensePlate.toLowerCase().includes(q) ||
          b.services.join(' ').toLowerCase().includes(q),
      )
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  }, [status, query]);

  const byDay = useMemo(() => {
    const groups = new Map<string, DemoBooking[]>();
    for (const b of filtered) groups.set(dateOf(b.scheduledAt), [...(groups.get(dateOf(b.scheduledAt)) ?? []), b]);
    return [...groups.entries()];
  }, [filtered]);

  return (
    <div className="space-y-8 pb-20">
      <DemoHeader title="Rezerwacje" subtitle="Harmonogram • Demo Studio" />

      <div className="flex p-1.5 w-full md:w-[440px] rounded-full bg-white border border-green-deep/7 shadow-sm">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${tab === t.id ? 'bg-green-deep text-cream shadow-lg' : 'text-green-deep/40 hover:text-green-deep'}`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'in-progress' && (
        <div className="space-y-8">
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatus(f.id)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${status === f.id ? 'bg-green-deep text-cream shadow-md' : 'bg-white text-slate-400 border border-slate-200 hover:border-green-deep/20'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {byDay.map(([date, bookings]) => (
            <div key={date} className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2 border-b border-slate-100 pb-2">
                {longDateOf(date)}
              </h4>
              <div className="space-y-4">
                {bookings.map((b, i) => (
                  <BookingCard key={b.id} booking={b} index={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'search' && (
        <div className="space-y-6">
          <div className="relative w-full md:w-[420px]">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              aria-label="Szukaj rezerwacji"
              placeholder="Tablica, klient, model, usługa..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-cream-warm/20 transition-all"
            />
          </div>
          {query ? (
            <div className="space-y-4">
              <span className="text-[10px] font-semibold text-green-light uppercase tracking-widest">
                Znaleziono: {filtered.length}
              </span>
              {filtered.map((b, i) => (
                <BookingCard key={b.id} booking={b} index={i} />
              ))}
            </div>
          ) : (
            <div className={`${EMPTY_BOX} p-20`}>
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={28} className="text-slate-300" />
              </div>
              <p className="text-slate-400 text-sm font-semibold">Wpisz frazę aby wyszukać rezerwację</p>
            </div>
          )}
        </div>
      )}

      {tab === 'calendar' && (
        <div className={`${EMPTY_BOX} p-8`}>
          <div className="w-16 h-16 bg-cream-warm/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarDays size={28} className="text-green-deep/30" />
          </div>
          <p className="text-slate-400 text-sm font-semibold">Podgląd kalendarza dostępny w pełnej wersji</p>
        </div>
      )}
    </div>
  );
}
