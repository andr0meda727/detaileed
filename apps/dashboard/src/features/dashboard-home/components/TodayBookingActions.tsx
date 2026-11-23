import React from 'react';
import { Check, MoreHorizontal, X } from 'lucide-react';
import { BOOKING_STATUSES, type Booking, type BookingStatus } from '@/features/bookings';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@detaileed/ui';

interface TodayBookingActionsProps {
  booking: Booking;
  onRequestStatusChange: (booking: Booking, status: BookingStatus) => void;
}

/** The "more" menu of a planned booking: complete or cancel it (both ask for confirmation first). */
export const TodayBookingActions: React.FC<TodayBookingActionsProps> = ({ booking, onRequestStatusChange }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm" icon={MoreHorizontal} aria-label="Więcej akcji" />
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem icon={Check} onSelect={() => onRequestStatusChange(booking, BOOKING_STATUSES.ZAKONCZONA)}>
        Zakończ zlecenie
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem danger icon={X} onSelect={() => onRequestStatusChange(booking, BOOKING_STATUSES.ANULOWANA)}>
        Anuluj zlecenie
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
