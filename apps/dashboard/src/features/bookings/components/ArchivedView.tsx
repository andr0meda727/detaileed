import React, { useState, useMemo } from 'react';
import { Archive, Download } from 'lucide-react';
import type { Booking } from '@/features/bookings/model/types';
import { formatPln } from '@detaileed/domain/money';
import { useBookings } from '@/features/bookings/api/bookings';
import { Button, Card, EmptyState, LicensePlate, SearchInput, Skeleton, useToast } from '@detaileed/ui';
import { GlobalHeader } from '@/shared/ui/GlobalHeader';
import { formatBookingDay, formatBookingTime } from '@/features/bookings/model/format';
import { useStudioTimeZone } from '@/features/studios';
import { BookingStatusBadge } from '@/features/bookings/components/BookingStatusBadge';
import { ArchivedBookingModal } from '@/features/bookings/components/ArchivedBookingModal';

export const ArchivedView: React.FC = () => {
  const { addToast } = useToast();
  const { data: bookings = [], isLoading: loading } = useBookings({ isCompleted: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const filteredBookings = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return bookings.filter(
      (b) =>
        b.services.join(' ').toLowerCase().includes(q) ||
        b.client.name.toLowerCase().includes(q) ||
        b.vehicle.licensePlate.toLowerCase().includes(q),
    );
  }, [searchQuery, bookings]);

  const timeZone = useStudioTimeZone();

  return (
    <div className="space-y-6 pb-20">
      <GlobalHeader
        title="Archiwum"
        subtitle="Pełna historia operacyjna"
        onAddBooking={() => addToast('Globalny moduł tworzenia rezerwacji zostanie podpięty w kolejnym kroku.', 'info')}
        onAddClient={() =>
          addToast('Globalny moduł szybkiego dodawania klienta zostanie podpięty w kolejnym kroku.', 'info')
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          aria-label="Szukaj w historii"
          placeholder="Szukaj w historii..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          wrapperClassName="flex-1"
        />
        <Button variant="secondary" icon={Download}>
          Eksportuj
        </Button>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <ul className="divide-y divide-border">
            {[1, 2, 3, 4].map((i) => (
              <li key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton width="48px" height="32px" />
                <div className="flex-1 space-y-2">
                  <Skeleton width="180px" height="16px" />
                  <Skeleton width="40%" height="12px" />
                </div>
                <Skeleton width="80px" height="20px" />
              </li>
            ))}
          </ul>
        ) : filteredBookings.length > 0 ? (
          <ul className="divide-y divide-border">
            {filteredBookings.map((booking) => (
              <li key={booking.id}>
                <button
                  type="button"
                  onClick={() => setSelectedBooking(booking)}
                  className="flex w-full flex-col gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:flex-row sm:items-center sm:gap-5"
                >
                  <span className="flex shrink-0 items-baseline gap-2 font-mono tabular-nums sm:w-16 sm:flex-col sm:gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      {formatBookingDay(booking.scheduledAt, timeZone)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatBookingTime(booking.scheduledAt, timeZone)}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1 space-y-1">
                    <span className="flex min-w-0 items-center gap-2">
                      <LicensePlate plate={booking.vehicle.licensePlate} />
                      <span className="truncate text-sm font-medium text-foreground">
                        {booking.vehicle.brand} {booking.vehicle.model}
                      </span>
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {booking.services.join(', ') || 'Brak usług'}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-1">
                    <span className="font-mono text-sm font-medium text-foreground tabular-nums">
                      {formatPln(booking.totalPrice)}
                    </span>
                    <BookingStatusBadge booking={booking} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={Archive} message="Brak archiwalnych zleceń" />
        )}
      </Card>

      <ArchivedBookingModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
    </div>
  );
};
