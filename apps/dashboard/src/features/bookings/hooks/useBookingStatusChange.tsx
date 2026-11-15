import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from '@/shared/ui/Modal';
import { useToast } from '@/shared/ui/useToast';
import { getApiErrorMessage } from '@/shared/lib/errorHandler';
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

  const confirmDialog = (
    <Modal isOpen={!!confirmation} onClose={() => setConfirmation(null)} title="Zmień Status">
      <div className="space-y-8">
        <div className="flex items-center gap-6 p-8 bg-slate-50 rounded-2xl">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${confirmation?.type.id === BOOKING_STATUSES.ZAKONCZONA.id ? 'bg-cream-warm/20 text-green-deep' : 'bg-red-50 text-red-500'}`}
          >
            <AlertCircle size={32} />
          </div>
          <div>
            <p className="text-lg font-bold text-green-deep leading-tight mb-2">
              {confirmation?.type.id === BOOKING_STATUSES.ZAKONCZONA.id
                ? 'Zakończyć to zlecenie?'
                : 'Anulować tę rezerwację?'}
            </p>
            <p className="text-sm text-slate-500 font-semibold">
              {confirmation?.booking.vehicle.brand} {confirmation?.booking.vehicle.model}
            </p>
            <p className="text-xs text-slate-400 font-mono mt-1">{confirmation?.booking.vehicle.licensePlate}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setConfirmation(null)}
            className="flex-1 py-5 bg-white border border-slate-200 text-slate-400 rounded-xl font-semibold text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            Wróć
          </button>
          <button
            onClick={() => confirmation && void change(confirmation.booking, confirmation.type)}
            className={`flex-1 py-5 rounded-xl font-semibold text-[11px] uppercase tracking-widest text-white shadow-xl hover:shadow-2xl active:scale-95 transition-all ${confirmation?.type.id === BOOKING_STATUSES.ZAKONCZONA.id ? 'bg-green-deep text-cream-warm' : 'bg-red-500'}`}
          >
            Tak, kontynuuj
          </button>
        </div>
      </div>
    </Modal>
  );

  return { requestStatusChange, confirmDialog };
}
