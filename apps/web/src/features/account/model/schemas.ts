import { z } from 'zod';
import { VehicleSize } from '@detaileed/api-client';

/** The backend's rules: Polish phone numbers; plates of letters, digits, dashes and spaces, at most 15. */
const PHONE = /^(\+48|0048)?[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}$/;
const PLATE = /^[A-Za-z0-9\- ]{2,15}$/;

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Podaj imię i nazwisko').max(100),
  phone: z.string().trim().regex(PHONE, 'Podaj numer telefonu, np. 500 600 700'),
});

export type ProfileValues = z.infer<typeof profileSchema>;

export const carSchema = z.object({
  licensePlate: z.string().trim().regex(PLATE, 'Podaj numer rejestracyjny (litery i cyfry, do 15 znaków)'),
  brand: z.string().trim().max(50),
  model: z.string().trim().max(50),
  size: z.enum(Object.values(VehicleSize) as [VehicleSize, ...VehicleSize[]]),
});

export type CarValues = z.infer<typeof carSchema>;

export const emptyCar: CarValues = { licensePlate: '', brand: '', model: '', size: VehicleSize.Medium };

/** A car as the API takes it (garage or a one-off car on a request): upper-case plate, empty fields as null. */
export function toCarRequest(values: CarValues) {
  return {
    licensePlate: values.licensePlate.trim().toUpperCase(),
    brand: values.brand.trim() || null,
    model: values.model.trim() || null,
    size: values.size,
  };
}
