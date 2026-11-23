import React, { useMemo, useState } from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import { Button, Card, EmptyState, SearchInput, SegmentedControl, Skeleton, Tooltip, cn } from '@detaileed/ui';
import type { Booking } from '@/features/bookings/model/types';
import type { BookingStatus } from '@/features/bookings/model/statuses';
import { BOOKING_STATUSES } from '@/features/bookings/model/statuses';
import { byScheduledAt, groupBookingsByDay, matchesBookingQuery } from '@/features/bookings/model/filters';
import { BookingCard } from '@/features/bookings/components/BookingCard';
import { BookingCardSkeleton } from '@/features/bookings/components/BookingCardSkeleton';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { formatDay } from '@detaileed/domain/studioTime';
import { useStudioTimeZone } from '@/features/studios';

interface TabProps {
  /** Bookings the schedule shows (see visibleBookings). */
  bookings: Booking[];
  loading: boolean;
  onOpen: (booking: Booking) => void;
  onRequestStatusChange: (booking: Booking, status: BookingStatus) => void;
}

type StatusFilter = 'all' | 'UTWORZONA' | 'ZAKONCZONA' | 'ANULOWANA';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'UTWORZONA', label: 'W toku' },
  { value: 'ZAKONCZONA', label: 'Ukończone' },
  { value: 'ANULOWANA', label: 'Anulowane' },
];

/** Bookings grouped by day, filterable by status and a search box. */
export const InProgressTab: React.FC<TabProps> = ({ bookings, loading, onOpen, onRequestStatusChange }) => {
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
  const timeZone = useStudioTimeZone();
  const groupedInProgressBookings = useMemo(
    () => groupBookingsByDay(inProgressBookings, timeZone),
    [inProgressBookings, timeZone],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex max-w-full items-center gap-1">
          {/* On phones the segments keep their labels and scroll sideways instead of truncating. */}
          <div className="min-w-0 overflow-x-auto [scrollbar-width:none]">
            <SegmentedControl
              aria-label="Status zleceń"
              options={STATUS_FILTERS}
              value={filterStatus}
              onValueChange={setFilterStatus}
              className="w-max max-w-none"
            />
          </div>
          <Tooltip content={<VisibilityRules />} side="bottom" align="start">
            <Button variant="ghost" size="sm" icon={Info} aria-label="Zasady wyświetlania" />
          </Tooltip>
        </div>
        <SearchInput
          aria-label="Szukaj zlecenia"
          placeholder="Szukaj zlecenia..."
          value={inProgressSearchQuery}
          onChange={(e) => setInProgressSearchQuery(e.target.value)}
          onClear={() => setInProgressSearchQuery('')}
          wrapperClassName="md:w-72"
        />
      </div>
      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((dayIdx) => (
            <div key={dayIdx} className="space-y-3">
              <Skeleton width="180px" height="16px" />
              {[1, 2, 3].map((i) => (
                <BookingCardSkeleton key={i} />
              ))}
            </div>
          ))}
        </div>
      ) : groupedInProgressBookings.length > 0 ? (
        <div
          className={cn('space-y-6 transition-opacity duration-150', inProgressSearchQuery !== query && 'opacity-70')}
        >
          {groupedInProgressBookings.map((group) => (
            <section key={group.date} className="space-y-3">
              <h3 className="border-b border-border pb-2 text-sm font-medium text-muted-foreground first-letter:uppercase">
                {formatDay(group.date, { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              <div className="space-y-2">
                {group.bookings.map((b) => (
                  <BookingCard key={b.id} booking={b} onOpen={onOpen} onRequestStatusChange={onRequestStatusChange} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState icon={CheckCircle2} title="Brak zleceń" message="Brak przypisanych rezerwacji." />
        </Card>
      )}
    </div>
  );
};

/** What the list shows of each status (see visibleBookings). */
function VisibilityRules() {
  return (
    <div className="space-y-1 py-1">
      <p className="font-medium">Zasady wyświetlania</p>
      <ul className="space-y-0.5">
        <li>
          Zlecenia <strong className="font-medium">w toku</strong>: zawsze widoczne
        </li>
        <li>
          Zlecenia <strong className="font-medium">ukończone</strong>: z bieżącego tygodnia
        </li>
        <li>
          Zlecenia <strong className="font-medium">anulowane</strong>: tylko z dzisiaj
        </li>
      </ul>
    </div>
  );
}
