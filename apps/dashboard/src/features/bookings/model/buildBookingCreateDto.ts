import type { BookingInput } from '@/features/bookings/model/types';
import { BOOKING_STATUSES } from '@/features/bookings/model/statuses';

interface BuildBookingCreateDtoArgs {
  vehicleId: string;
  clientId: string;
  date: string;
  time: string;
  serviceIds: string[];
  priceInput: string;
  notes?: string | null;
}

export function buildBookingCreateDto({
  vehicleId,
  clientId,
  date,
  time,
  serviceIds,
  priceInput,
  notes = null,
}: BuildBookingCreateDtoArgs): BookingInput {
  return {
    vehicleId,
    clientId,
    scheduledAt: new Date(`${date}T${time}`).toISOString(),
    statusId: BOOKING_STATUSES.UTWORZONA.id,
    serviceIds,
    price: parseFloat(priceInput.replace(',', '.')),
    notes,
  };
}
