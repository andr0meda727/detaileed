import type { BookingInput } from '@/features/bookings/model/types';
import { BOOKING_STATUSES } from '@/features/bookings/model/statuses';
import { zonedToUtc } from '@detaileed/domain/studioTime';

interface BuildBookingCreateDtoArgs {
  vehicleId: string;
  clientId: string;
  /** The studio day and local time; turned into UTC in `timeZone`. */
  date: string;
  time: string;
  timeZone: string;
  serviceIds: string[];
  priceInput: string;
  notes?: string | null;
  /** The bay to book; null or left out lets the planner choose (studios that plan). */
  bayId?: string | null;
}

export function buildBookingCreateDto({
  vehicleId,
  clientId,
  date,
  time,
  timeZone,
  serviceIds,
  priceInput,
  notes = null,
  bayId = null,
}: BuildBookingCreateDtoArgs): BookingInput {
  return {
    vehicleId,
    clientId,
    scheduledAt: zonedToUtc(date, time, timeZone),
    statusId: BOOKING_STATUSES.UTWORZONA.id,
    serviceIds,
    price: parseFloat(priceInput.replace(',', '.')),
    notes,
    bayId,
  };
}
