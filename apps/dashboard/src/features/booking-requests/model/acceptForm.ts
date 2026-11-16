import { z } from 'zod';
import type { AcceptBookingRequest } from '@detaileed/api-client';
import { dayInZone, timeInZone, zonedToUtc } from '@detaileed/domain/studioTime';
import type { BookingRequest } from '@/features/booking-requests/model/types';

export const acceptFormSchema = z.object({
  /** The studio day and local time of the visit. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Podaj datę'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Podaj godzinę'),
  price: z
    .string()
    .trim()
    .regex(/^\d{1,6}([.,]\d{1,2})?$/, 'Podaj cenę, np. 249,99'),
  /** A bay picked from the plan; null lets the planner choose. */
  bayId: z.string().nullable(),
});

export type AcceptFormValues = z.infer<typeof acceptFormSchema>;

/** Starts from the customer's preferred time (in the studio's zone) and the estimate. */
export function acceptFormDefaults(request: BookingRequest, timeZone: string): AcceptFormValues {
  return {
    date: dayInZone(request.preferredAt, timeZone),
    time: timeInZone(request.preferredAt, timeZone),
    price: String(request.estimatedPrice).replace('.', ','),
    bayId: null,
  };
}

/** Body of `POST /api/booking-requests/{id}/accept`: the time in UTC, the price in złoty and the bay, if picked. */
export function toAcceptBody(values: AcceptFormValues, timeZone: string): AcceptBookingRequest {
  return {
    scheduledAt: zonedToUtc(values.date, values.time, timeZone),
    price: Number(values.price.trim().replace(',', '.')),
    bayId: values.bayId,
  };
}
