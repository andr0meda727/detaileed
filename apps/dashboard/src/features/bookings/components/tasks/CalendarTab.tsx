import React, { useMemo, useState } from 'react';
import { CalendarX } from 'lucide-react';
import { Card, EmptyState } from '@detaileed/ui';
import type { Booking } from '@/features/bookings/model/types';
import { BOOKING_STATUSES, type BookingStatus } from '@/features/bookings/model/statuses';
import { byScheduledAt } from '@/features/bookings/model/filters';
import { BookingCard } from '@/features/bookings/components/BookingCard';
import { BookingCardSkeleton } from '@/features/bookings/components/BookingCardSkeleton';
import { MonthCalendar } from '@/features/bookings/components/tasks/MonthCalendar';
import { dayInZone, formatDay, todayInZone } from '@detaileed/domain/studioTime';
import { useStudioTimeZone } from '@/features/studios';

interface TabProps {
  /** Bookings the schedule shows (see visibleBookings). */
  bookings: Booking[];
  loading: boolean;
  onOpen: (booking: Booking) => void;
  onRequestStatusChange: (booking: Booking, status: BookingStatus) => void;
}

interface CalendarTabProps extends TabProps {
  /** YYYY-MM-DD of the day whose bookings are listed. */
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

/** Month grid with booking dots, and the bookings of the selected day. */
export const CalendarTab: React.FC<CalendarTabProps> = ({
  bookings,
  loading,
  selectedDate,
  onSelectDate: setSelectedDate,
  onOpen,
  onRequestStatusChange,
}) => {
  const timeZone = useStudioTimeZone();
  const today = todayInZone(timeZone);
  // The shown month as YYYY-MM, starting at the studio's current month.
  const [currentMonth, setCurrentMonth] = useState(() => today.slice(0, 7));
  // Studio day of each booking, worked out once.
  const bookingDays = useMemo(
    () => new Map(bookings.map((b) => [b.id, dayInZone(b.scheduledAt, timeZone)])),
    [bookings, timeZone],
  );
  // Days with open (not finished, not cancelled) bookings get a dot.
  const openDays = useMemo(
    () =>
      new Set(
        bookings
          .filter((b) => b.status !== BOOKING_STATUSES.ANULOWANA.name && b.status !== BOOKING_STATUSES.ZAKONCZONA.name)
          .map((b) => bookingDays.get(b.id)),
      ),
    [bookings, bookingDays],
  );
  const selectedDayBookings = useMemo(
    () => bookings.filter((b) => bookingDays.get(b.id) === selectedDate).sort(byScheduledAt),
    [bookings, bookingDays, selectedDate],
  );
  const shiftMonth = (delta: number) => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(Date.UTC(y, m - 1 + delta, 1));
    setCurrentMonth(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
  };

  return (
    <div className="flex flex-col gap-6 xl:flex-row">
      <MonthCalendar
        month={currentMonth}
        onShiftMonth={shiftMonth}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        today={today}
        hasBookings={(date) => openDays.has(date)}
      />
      <section className="min-w-0 flex-1 space-y-3">
        <h3 className="border-b border-border pb-2 text-lg font-semibold text-foreground first-letter:uppercase">
          {formatDay(selectedDate, { weekday: 'long', day: 'numeric', month: 'long' })}
        </h3>
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <BookingCardSkeleton key={i} />
            ))}
          </div>
        ) : selectedDayBookings.length > 0 ? (
          <div className="space-y-2">
            {selectedDayBookings.map((b) => (
              <BookingCard key={b.id} booking={b} onOpen={onOpen} onRequestStatusChange={onRequestStatusChange} />
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState icon={CalendarX} message="Brak rezerwacji w tym dniu" />
          </Card>
        )}
      </section>
    </div>
  );
};
