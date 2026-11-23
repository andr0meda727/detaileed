import React from 'react';
import { CalendarClock, ChevronRight } from 'lucide-react';
import { type Booking } from '@/features/bookings';
import { formatPln } from '@detaileed/domain/money';
import { Button, Card, CardHeader, EmptyState, Skeleton } from '@detaileed/ui';
import { dayInZone } from '@detaileed/domain/studioTime';
import { useStudioTimeZone } from '@/features/studios';

interface UpcomingBookingsProps {
  bookings: Booking[];
  loading: boolean;
  onOpen: (booking: Booking) => void;
  onShowAll: () => void;
}

const MONTHS = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];

/** The next bookings after today, with a link to the full schedule. */
export const UpcomingBookings: React.FC<UpcomingBookingsProps> = ({ bookings, loading, onOpen, onShowAll }) => {
  const timeZone = useStudioTimeZone();

  return (
    <Card>
      <CardHeader
        title="Nadchodzące"
        description={`Następne ${bookings.length} rezerwacji`}
        actions={
          <Button variant="ghost" size="sm" onClick={onShowAll}>
            Wszystkie
            <ChevronRight className="size-4" strokeWidth={1.75} aria-hidden />
          </Button>
        }
      />
      {loading ? (
        <ul aria-hidden className="divide-y divide-border">
          {[1, 2, 3, 4].map((i) => (
            <li key={i} className="flex items-center gap-4 px-5 py-3">
              <Skeleton width="36px" height="32px" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton width="120px" height="14px" />
                <Skeleton width="60%" height="12px" />
              </div>
              <Skeleton width="64px" height="14px" />
            </li>
          ))}
        </ul>
      ) : bookings.length === 0 ? (
        <EmptyState icon={CalendarClock} message="Brak nadchodzących rezerwacji." />
      ) : (
        <ul className="divide-y divide-border">
          {bookings.slice(0, 4).map((booking) => {
            const [, month, day] = dayInZone(booking.scheduledAt, timeZone).split('-');
            return (
              <li key={booking.id}>
                <button
                  type="button"
                  onClick={() => onOpen(booking)}
                  className="flex w-full items-center gap-4 px-5 py-3 text-left transition-colors duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
                >
                  <span className="flex w-9 shrink-0 flex-col items-center">
                    <span className="font-mono text-base font-medium tabular-nums text-foreground">{day}</span>
                    <span className="text-xs text-faint">{MONTHS[Number(month) - 1]}</span>
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {booking.vehicle.brand} {booking.vehicle.model}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {booking.services.length > 0 ? booking.services.join(', ') : 'Brak usług'}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-sm tabular-nums text-foreground">
                    {formatPln(booking.totalPrice)} zł
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};
