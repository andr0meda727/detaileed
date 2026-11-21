import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Booking } from '@/features/bookings/model/types';
import type { BookingStatus } from '@/features/bookings/model/statuses';
import { matchesBookingQuery } from '@/features/bookings/model/filters';
import { BookingCard } from '@/features/bookings/components/BookingCard';

import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';

interface TabProps {
  /** Bookings the schedule shows (see visibleBookings). */
  bookings: Booking[];
  loading: boolean;
  onOpen: (booking: Booking) => void;
  onRequestStatusChange: (booking: Booking, status: BookingStatus) => void;
}

/** Search across all bookings the schedule shows, newest first. */
export const SearchTab: React.FC<Omit<TabProps, 'loading'>> = ({ bookings, onOpen, onRequestStatusChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebouncedValue(searchQuery);

  const globalSearchResults = useMemo(
    () =>
      debouncedSearchQuery
        ? bookings
            .filter((b) => matchesBookingQuery(b, debouncedSearchQuery))
            .sort((x, y) => y.scheduledAt.localeCompare(x.scheduledAt))
        : [],
    [bookings, debouncedSearchQuery],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-green-deep tracking-tighter">Wyszukiwarka</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Przeszukaj wszystkie rezerwacje w systemie
          </p>
        </div>
        <div className="relative w-full md:w-[420px]">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Tablica, klient, model, usługa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-hidden focus:ring-4 focus:ring-cream-warm/20 focus:border-cream-warm transition-all"
            style={{ paddingLeft: '3rem' }}
            autoFocus
          />
        </div>
      </div>
      {!searchQuery ? (
        <div className="bg-white rounded-2xl p-20 text-center border-2 border-dashed border-slate-100">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={28} className="text-slate-300" />
          </div>
          <p className="text-slate-400 text-sm font-semibold">Wpisz frazę aby wyszukać rezerwację</p>
        </div>
      ) : (
        <div
          className={`space-y-4 transition-opacity duration-200 ${searchQuery !== debouncedSearchQuery ? 'opacity-70' : 'opacity-100'}`}
        >
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              Wyniki dla: &ldquo;{searchQuery}&rdquo;
            </span>
            <span className="text-[10px] font-semibold text-green-light uppercase tracking-widest">
              Znaleziono: {globalSearchResults.length}
            </span>
          </div>
          {globalSearchResults.length > 0 ? (
            globalSearchResults.map((b, idx) => (
              <BookingCard
                key={b.id}
                booking={b}
                index={idx}
                onOpen={onOpen}
                onRequestStatusChange={onRequestStatusChange}
              />
            ))
          ) : (
            <div className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-slate-100">
              <p className="text-slate-400 text-sm font-semibold">Brak wyników</p>
              <p className="text-slate-300 text-xs font-bold uppercase tracking-widest mt-1">Spróbuj innej frazy</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
