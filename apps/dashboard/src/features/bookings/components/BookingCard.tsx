import React from 'react';
import { Check, MoreHorizontal, User, X } from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  LicensePlate,
} from '@detaileed/ui';
import type { Booking } from '@/features/bookings/model/types';
import { BOOKING_STATUSES, type BookingStatus } from '@/features/bookings/model/statuses';
import { formatBookingDay, formatBookingTime } from '@/features/bookings/model/format';
import { BookingStatusBadge } from '@/features/bookings/components/BookingStatusBadge';
import { useStudioTimeZone } from '@/features/studios';

interface BookingCardProps {
  booking: Booking;
  onOpen: (booking: Booking) => void;
  onRequestStatusChange: (booking: Booking, status: BookingStatus) => void;
}

/** One booking in a list: date, vehicle, services, client, status and the complete/cancel menu. */
export const BookingCard: React.FC<BookingCardProps> = ({ booking, onOpen, onRequestStatusChange }) => {
  const timeZone = useStudioTimeZone();
  const { vehicle } = booking;
  return (
    <div className="relative flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition-colors duration-150 hover:bg-subtle sm:flex-row sm:items-center sm:gap-5">
      {/* The whole card opens the details; the menu sits above this button. */}
      <button
        type="button"
        onClick={() => onOpen(booking)}
        aria-label={`Szczegóły rezerwacji ${vehicle.licensePlate}, ${vehicle.brand} ${vehicle.model}`}
        className="absolute inset-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
      <div className="pointer-events-none flex shrink-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 sm:w-28 sm:flex-col">
        <span className="font-mono text-sm font-medium text-foreground tabular-nums">
          {formatBookingDay(booking.scheduledAt, timeZone)}
        </span>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {formatBookingTime(booking.scheduledAt, timeZone)}–{formatBookingTime(booking.endsAt, timeZone)}
        </span>
        {booking.bay && <span className="text-xs text-faint">{booking.bay.name}</span>}
      </div>
      <div className="pointer-events-none min-w-0 flex-1 space-y-1.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <LicensePlate plate={vehicle.licensePlate} />
          <h4 className="truncate text-sm font-medium text-foreground">
            {vehicle.brand} {vehicle.model}
          </h4>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {booking.services.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {booking.services.map((s, idx) => (
                <span key={idx} className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-faint">Brak usług</span>
          )}
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <User size={12} strokeWidth={1.75} aria-hidden />
            {booking.client.name}
          </span>
        </div>
      </div>
      <div className="pointer-events-none flex shrink-0 items-center justify-end gap-2">
        <BookingStatusBadge booking={booking} />
        {booking.status === BOOKING_STATUSES.UTWORZONA.name && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                icon={MoreHorizontal}
                aria-label="Więcej akcji"
                className="pointer-events-auto relative"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                icon={Check}
                onSelect={() => onRequestStatusChange(booking, BOOKING_STATUSES.ZAKONCZONA)}
              >
                Zakończ zlecenie
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                danger
                icon={X}
                onSelect={() => onRequestStatusChange(booking, BOOKING_STATUSES.ANULOWANA)}
              >
                Anuluj zlecenie
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
