import React from 'react';
import { Calendar } from 'lucide-react';
import { BOOKING_STATUSES, BookingStatusBadge, type Booking, type BookingStatus } from '@/features/bookings';
import {
  Card,
  cn,
  CardHeader,
  EmptyState,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@detaileed/ui';
import { formatPln } from '@detaileed/domain/money';
import { timeInZone } from '@detaileed/domain/studioTime';
import { useStudioTimeZone } from '@/features/studios';
import { TodayBookingActions } from '@/features/dashboard-home/components/TodayBookingActions';

interface TodayScheduleProps {
  bookings: Booking[];
  loading: boolean;
  onOpen: (booking: Booking) => void;
  onRequestStatusChange: (booking: Booking, status: BookingStatus) => void;
}

const COLUMNS = ['Godzina', 'Klient i auto', 'Usługi', 'Stanowisko', 'Status'];

/** Columns that give way on tablets (`md` to `xl`): the bay shows under the time, the status under the client. */
const NARROW_HIDDEN: Record<string, string> = { Stanowisko: 'md:max-xl:hidden', Status: 'md:max-xl:hidden' };

/**
 * Today's bookings as a table (stacked cards on phones); a row opens the booking, planned ones can be completed or
 * cancelled from a menu.
 */
export const TodaySchedule: React.FC<TodayScheduleProps> = ({ bookings, loading, onOpen, onRequestStatusChange }) => {
  const timeZone = useStudioTimeZone();

  return (
    <Card className="min-w-0">
      <CardHeader
        title="Dzisiejszy grafik"
        description={
          loading ? (
            <Skeleton width="120px" height="14px" />
          ) : (
            `${bookings.length} ${bookings.length === 1 ? 'zlecenie' : 'zleceń'} zaplanowanych`
          )
        }
      />
      {!loading && bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Brak zleceń na dziś"
          message="Dodaj nową rezerwację przyciskiem „Nowa rezerwacja” powyżej."
        />
      ) : (
        <Table aria-label="Dzisiejsze wizyty" className="min-w-[640px] xl:min-w-[760px]" stacked>
          <TableHeader>
            <TableRow>
              {COLUMNS.map((column) => (
                <TableHead key={column} className={NARROW_HIDDEN[column]}>
                  {column}
                </TableHead>
              ))}
              <TableHead className="text-right">Kwota</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Akcje</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? [1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    {[...COLUMNS, 'Kwota', 'Akcje'].map((column, index) => (
                      <TableCell key={column} stack={index === 1 ? 'primary' : index > 3 ? 'hidden' : undefined}>
                        <Skeleton width="70%" height="14px" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : bookings.map((booking) => (
                  <TableRow key={booking.id} onClick={() => onOpen(booking)} className="cursor-pointer hover:bg-muted">
                    <TableCell stack="hidden" className="font-mono tabular-nums">
                      {timeInZone(booking.scheduledAt, timeZone)}
                      <div className="hidden font-sans text-xs whitespace-nowrap text-faint md:max-xl:block">
                        {booking.bay?.name}
                      </div>
                    </TableCell>
                    <TableCell stack="primary">
                      <span className="mr-2 font-mono font-medium tabular-nums md:hidden">
                        {timeInZone(booking.scheduledAt, timeZone)}
                      </span>
                      <button
                        type="button"
                        className="rounded-sm text-left whitespace-nowrap font-medium text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpen(booking);
                        }}
                      >
                        {booking.client.name}
                      </button>
                      <div className="text-xs whitespace-nowrap text-faint">
                        {booking.vehicle.brand} {booking.vehicle.model} ·{' '}
                        <span className="font-mono">{booking.vehicle.licensePlate}</span>
                      </div>
                      <BookingStatusBadge booking={booking} className="mt-2 xl:hidden" />
                    </TableCell>
                    <TableCell label="Usługi" stack="full" className="min-w-40 text-muted-foreground max-md:order-last">
                      {booking.services.length > 0 ? booking.services.join(', ') : 'Brak usług'}
                    </TableCell>
                    <TableCell
                      label="Stanowisko"
                      className={cn(
                        'whitespace-nowrap',
                        NARROW_HIDDEN.Stanowisko,
                        booking.bay ? 'text-muted-foreground' : 'text-faint',
                      )}
                    >
                      {booking.bay?.name ?? '—'}
                    </TableCell>
                    <TableCell stack="hidden" className={NARROW_HIDDEN.Status}>
                      <BookingStatusBadge booking={booking} />
                    </TableCell>
                    <TableCell label="Kwota" className="text-right font-mono whitespace-nowrap tabular-nums">
                      {formatPln(booking.totalPrice)} zł
                    </TableCell>
                    {/* Clicks inside the menu (portalled, but still in this React tree) must not open the booking. */}
                    <TableCell stack="actions" className="py-1.5 text-right" onClick={(e) => e.stopPropagation()}>
                      {booking.status === BOOKING_STATUSES.UTWORZONA.name && (
                        <TodayBookingActions booking={booking} onRequestStatusChange={onRequestStatusChange} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
};
