import React, { useMemo, useState } from 'react';
import { Search, SearchX } from 'lucide-react';
import { Card, EmptyState, SearchInput, cn } from '@detaileed/ui';
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Wyszukiwarka</h2>
          <p className="text-sm text-muted-foreground">Przeszukaj wszystkie rezerwacje w systemie</p>
        </div>
        <SearchInput
          aria-label="Szukaj rezerwacji"
          placeholder="Tablica, klient, model, usługa..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          wrapperClassName="md:w-96"
          autoFocus
        />
      </div>
      {!searchQuery ? (
        <Card>
          <EmptyState icon={Search} message="Wpisz frazę, aby wyszukać rezerwację" />
        </Card>
      ) : (
        <div
          className={cn(
            'space-y-3 transition-opacity duration-150',
            searchQuery !== debouncedSearchQuery && 'opacity-70',
          )}
        >
          <div className="flex items-center justify-between gap-3 text-xs text-faint">
            <span className="truncate">Wyniki dla: &ldquo;{searchQuery}&rdquo;</span>
            <span className="shrink-0 font-mono tabular-nums">Znaleziono: {globalSearchResults.length}</span>
          </div>
          {globalSearchResults.length > 0 ? (
            <div className="space-y-2">
              {globalSearchResults.map((b, idx) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  index={idx}
                  onOpen={onOpen}
                  onRequestStatusChange={onRequestStatusChange}
                />
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState icon={SearchX} title="Brak wyników" message="Spróbuj innej frazy." />
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
