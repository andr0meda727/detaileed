import React, { useMemo, useState } from 'react';
import { CheckCircle2, Search } from 'lucide-react';
import type { Booking } from '@/features/bookings/model/types';
import type { BookingStatus } from '@/features/bookings/model/statuses';
import { BOOKING_STATUSES } from '@/features/bookings/model/statuses';
import { byScheduledAt, groupBookingsByDay, matchesBookingQuery } from '@/features/bookings/model/filters';
import BookingCard from '@/features/bookings/components/BookingCard';
import Skeleton from '@/shared/ui/Skeleton';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';

interface TabProps {
  /** Bookings the schedule shows (see visibleBookings). */
  bookings: Booking[];
  loading: boolean;
  onOpen: (booking: Booking) => void;
  onRequestStatusChange: (booking: Booking, status: BookingStatus) => void;
}

type StatusFilter = 'all' | 'UTWORZONA' | 'ZAKONCZONA' | 'ANULOWANA';

/** Bookings grouped by day, filterable by status and a search box. */
const InProgressTab: React.FC<TabProps> = ({ bookings, loading, onOpen, onRequestStatusChange }) => {
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [inProgressSearchQuery, setInProgressSearchQuery] = useState('');
  const query = useDebouncedValue(inProgressSearchQuery);

  const inProgressBookings = useMemo(
    () =>
      bookings
        .filter((b) => filterStatus === 'all' || b.status === BOOKING_STATUSES[filterStatus].name)
        .filter((b) => matchesBookingQuery(b, query))
        .sort(byScheduledAt),
    [bookings, filterStatus, query],
  );
  const groupedInProgressBookings = useMemo(() => groupBookingsByDay(inProgressBookings), [inProgressBookings]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'all', label: 'Wszystkie' },
              { id: 'UTWORZONA', label: 'W toku' },
              { id: 'ZAKONCZONA', label: 'Ukończone' },
              { id: 'ANULOWANA', label: 'Anulowane' },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filterStatus === f.id ? 'bg-green-deep text-cream-warm shadow-md' : 'bg-white text-slate-400 border border-slate-200 hover:border-green-deep/20'}`}
            >
              {f.label}
            </button>
          ))}
          {/* Tooltip info */}
          <div className="relative group ml-1">
            <div className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center cursor-help hover:bg-green-deep hover:text-cream-warm hover:border-green-deep transition-all text-[10px] font-bold select-none">
              ?
            </div>
            <div
              className="absolute left-0 top-8 z-50 w-68 p-4 rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 text-left"
              style={{ background: '#1a2e1e', width: '260px' }}
            >
              <p
                className="text-[9px] font-bold uppercase tracking-widest mb-3"
                style={{ color: 'rgba(245,240,232,0.5)' }}
              >
                Zasady wyświetlania
              </p>
              <ul className="space-y-2 text-[11px] font-medium leading-snug" style={{ color: '#f5f0e8' }}>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5"></span>
                  <span>
                    Zlecenia <strong>w toku</strong> – zawsze widoczne
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                  <span>
                    Zlecenia <strong>ukończone</strong> – z bieżącego tygodnia
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5"></span>
                  <span>
                    Zlecenia <strong>anulowane</strong> – tylko z dzisiaj
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="relative w-full md:w-[300px]">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Szukaj zlecenia..."
            value={inProgressSearchQuery}
            onChange={(e) => setInProgressSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-xs outline-none focus:ring-2 focus:ring-cream-warm/50 focus:border-cream-warm transition-all"
          />
        </div>
      </div>
      {loading ? (
        <div className="space-y-8">
          {[1, 2].map((dayIdx) => (
            <div key={dayIdx} className="space-y-4">
              <Skeleton width="200px" height="20px" className="ml-2 mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="floating-card-static flex flex-col sm:flex-row items-stretch sm:items-center overflow-hidden h-auto sm:h-[104px]"
                  >
                    <div
                      className="w-full sm:w-28 p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-slate-50 flex flex-col items-center justify-center shrink-0"
                      style={{ background: 'rgba(26,46,30,0.01)' }}
                    >
                      <Skeleton width="40px" height="24px" className="mb-2 rounded-md" />
                      <Skeleton width="32px" height="12px" className="rounded-md" />
                    </div>
                    <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Skeleton width="70px" height="22px" className="rounded-lg" />
                        <Skeleton width="120px" height="20px" className="rounded-lg" />
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <Skeleton width="30%" height="14px" className="rounded-md" />
                        <Skeleton width="20%" height="14px" className="rounded-md" />
                      </div>
                    </div>
                    <div
                      className="px-5 sm:px-6 py-4 flex items-center justify-end sm:shrink-0"
                      style={{ borderTop: '1px solid rgba(26,46,30,0.02)', background: 'rgba(26,46,30,0.005)' }}
                    >
                      <Skeleton width="80px" height="28px" className="rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className={`space-y-8 transition-opacity duration-200 ${inProgressSearchQuery !== query ? 'opacity-70' : 'opacity-100'}`}
        >
          {groupedInProgressBookings.length > 0 ? (
            groupedInProgressBookings.map((group) => (
              <div key={group.date} className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2 border-b border-slate-100 pb-2 mb-4">
                  {new Date(group.date).toLocaleDateString('pl-PL', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </h3>
                <div className="space-y-4">
                  {group.bookings.map((b, idx) => (
                    <BookingCard
                      key={b.id}
                      booking={b}
                      index={idx}
                      onOpen={onOpen}
                      onRequestStatusChange={onRequestStatusChange}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-24 text-center border-2 border-dashed border-slate-100">
              <div className="w-20 h-20 bg-cream-warm/20 text-green-deep rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-2xl font-semibold text-green-deep tracking-tighter">Brak zleceń</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
                Brak przypisanych rezerwacji.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InProgressTab;
