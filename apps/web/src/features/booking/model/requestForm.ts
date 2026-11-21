import { z } from 'zod';
import type { SubmitBookingRequest, VehicleSize } from '@detaileed/api-client';
import { zonedToUtc } from '@detaileed/domain/studioTime';
import { carSchema, emptyCar, toCarRequest, type CarValues } from '@/features/account';

/** `vehicleChoice` for "another car" (typed into the form) instead of a garage car's id. */
export const NEW_CAR = 'new';

export interface RequestFormValues {
  serviceIds: string[];
  /** A garage car's id, NEW_CAR, or '' before choosing. */
  vehicleChoice: string;
  car: CarValues;
  /** A free slot's start (UTC) when the studio plans. */
  slotStart: string | null;
  /** The preferred day and local time when it doesn't. */
  date: string;
  time: string;
  notes: string;
}

export function requestFormDefaults(serviceIds: string[], size: VehicleSize, hasGarage: boolean): RequestFormValues {
  return {
    serviceIds,
    vehicleChoice: hasGarage ? '' : NEW_CAR,
    car: { ...emptyCar, size },
    slotStart: null,
    date: '',
    time: '',
    notes: '',
  };
}

/**
 * Rules of the request form. A studio that plans offers free slots (one must be picked); otherwise the customer
 * types a preferred day and time in the studio's zone, which must be in the future.
 */
export function requestFormSchema(planning: boolean, timeZone: string, now: Date = new Date()) {
  return z
    .object({
      serviceIds: z.array(z.string()).min(1, 'Wybierz co najmniej jedną usługę'),
      vehicleChoice: z.string().min(1, 'Wybierz auto'),
      car: z.object({ licensePlate: z.string(), brand: z.string(), model: z.string(), size: z.string() }),
      slotStart: z.string().nullable(),
      date: z.string(),
      time: z.string(),
      notes: z.string().max(1000, 'Uwagi mogą mieć najwyżej 1000 znaków'),
    })
    .superRefine((v, ctx) => {
      if (v.vehicleChoice === NEW_CAR) {
        const car = carSchema.safeParse(v.car);
        if (!car.success) {
          for (const issue of car.error.issues) {
            ctx.addIssue({ code: 'custom', path: ['car', ...issue.path], message: issue.message });
          }
        }
      }
      if (planning) {
        if (!v.slotStart) ctx.addIssue({ code: 'custom', path: ['slotStart'], message: 'Wybierz wolny termin' });
        return;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date)) {
        ctx.addIssue({ code: 'custom', path: ['date'], message: 'Wybierz dzień' });
      } else if (!/^\d{2}:\d{2}$/.test(v.time)) {
        ctx.addIssue({ code: 'custom', path: ['time'], message: 'Wybierz godzinę' });
      } else if (new Date(zonedToUtc(v.date, v.time, timeZone)) <= now) {
        ctx.addIssue({ code: 'custom', path: ['time'], message: 'Wybierz termin w przyszłości' });
      }
    });
}

/** Body of `POST /api/me/booking-requests` from valid form values. */
export function toSubmitRequest(
  values: RequestFormValues,
  studioId: string,
  timeZone: string,
  planning: boolean,
): SubmitBookingRequest {
  const isNewCar = values.vehicleChoice === NEW_CAR;
  return {
    studioId,
    serviceIds: values.serviceIds,
    vehicleId: isNewCar ? null : values.vehicleChoice,
    vehicle: isNewCar ? toCarRequest(values.car) : null,
    preferredAt: planning ? values.slotStart! : zonedToUtc(values.date, values.time, timeZone),
    notes: values.notes.trim() || null,
  };
}
