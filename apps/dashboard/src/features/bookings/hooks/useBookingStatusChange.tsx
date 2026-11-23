import { useState } from 'react';
import { ConfirmDialog, LicensePlate, useToast } from '@detaileed/ui';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';
import { useCancelBooking, useCompleteBooking } from '@/features/bookings/api/bookings';
import type { Booking } from '@/features/bookings/model/types';
import { BOOKING_STATUSES, type BookingStatus } from '@/features/bookings/model/statuses';

/**
 * Complete/cancel with a confirmation step. Call `requestStatusChange` from a button and render
 * `confirmDialog` once in the screen.
 */
export function useBookingStatusChange() {
  const { addToast } = useToast();
  const completeBooking = useCompleteBooking();
  const cancelBooking = useCancelBooking();
  const [confirmation, setConfirmation] = useState<{ booking: Booking; type: BookingStatus } | null>(null);

  const change = async (booking: Booking, targetStatus: BookingStatus) => {
    try {
      // Quick actions only ever finish a booking: complete it or cancel it.
      if (targetStatus.id === BOOKING_STATUSES.ZAKONCZONA.id) await completeBooking.mutateAsync(booking.id);
      else await cancelBooking.mutateAsync(booking.id);
      addToast(`Status rezerwacji zmieniony na: ${targetStatus.name}`, 'success');
    } catch (err) {
      addToast(getApiErrorMessage(err, 'Wystąpił błąd podczas zmiany statusu.'), 'error');
    } finally {
      setConfirmation(null);
    }
  };

  const requestStatusChange = (booking: Booking, type: BookingStatus) => setConfirmation({ booking, type });

  const completing = confirmation?.type.id === BOOKING_STATUSES.ZAKONCZONA.id;
  const vehicle = confirmation?.booking.vehicle;
  const confirmDialog = (
    <ConfirmDialog
      open={!!confirmation}
      onOpenChange={(open) => !open && setConfirmation(null)}
      tone={completing ? 'default' : 'danger'}
      title={completing ? 'Zakończyć to zlecenie?' : 'Anulować tę rezerwację?'}
      description={
        vehicle && (
          <span className="flex flex-wrap items-center gap-2">
            <span>
              {vehicle.brand} {vehicle.model}
            </span>
            <LicensePlate plate={vehicle.licensePlate} />
          </span>
        )
      }
      confirmLabel="Tak, kontynuuj"
      cancelLabel="Wróć"
      loading={completeBooking.isPending || cancelBooking.isPending}
      onConfirm={() => confirmation && void change(confirmation.booking, confirmation.type)}
    />
  );

  return { requestStatusChange, confirmDialog };
}
