import { BookingCreateDto } from '../../../types';
import { BOOKING_STATUSES } from '../../../constants';

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
}: BuildBookingCreateDtoArgs): BookingCreateDto {
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
