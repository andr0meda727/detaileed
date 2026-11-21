import { z } from 'zod';
import type { ChangeStudioDetailsRequest, StudioDetailsDto } from '@detaileed/api-client';

/** The API's phone rule (Polish numbers, optional +48 / 0048, spaces or dashes between groups). */
const PHONE = /^(\+48|0048)?[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}$/;

/**
 * The studio's details as the owner edits them. The name, phone, address, city and pin are what customers see on
 * the public profile; the pin is optional here, but the profile can't be published without it.
 */
export const studioDetailsSchema = z.object({
  name: z.string().trim().min(2, 'Nazwa jest wymagana (min. 2 znaki)').max(100, 'Nazwa może mieć najwyżej 100 znaków'),
  phone: z.string().trim().regex(PHONE, 'Podaj poprawny numer, np. 500 600 700').or(z.literal('')),
  email: z.string().trim().email('Podaj poprawny adres e-mail').max(254).or(z.literal('')),
  address: z.string().trim().max(200, 'Adres może mieć najwyżej 200 znaków'),
  city: z.string().trim().max(100, 'Miasto może mieć najwyżej 100 znaków'),
  location: z.object({ lat: z.number(), lng: z.number() }).nullable(),
});

export type StudioDetailsFormInput = z.input<typeof studioDetailsSchema>;
export type StudioDetailsFormValues = z.output<typeof studioDetailsSchema>;

/** The studio's details with numbers as numbers (the API may send them as strings). */
export interface StudioDetails {
  studioId: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  timeZone: string;
}

export function toStudioDetails(dto: StudioDetailsDto): StudioDetails {
  return {
    ...dto,
    latitude: dto.latitude == null ? null : Number(dto.latitude),
    longitude: dto.longitude == null ? null : Number(dto.longitude),
  };
}

export function studioDetailsFormDefaults(details: StudioDetails): StudioDetailsFormInput {
  return {
    name: details.name,
    phone: details.phone ?? '',
    email: details.email ?? '',
    address: details.address ?? '',
    city: details.city ?? '',
    location:
      details.latitude !== null && details.longitude !== null
        ? { lat: details.latitude, lng: details.longitude }
        : null,
  };
}

/** Body of `PUT /api/studios/current`, with empty fields as null. */
export function toStudioDetailsInput(values: StudioDetailsFormValues): ChangeStudioDetailsRequest {
  return {
    name: values.name,
    phone: values.phone || null,
    email: values.email || null,
    address: values.address || null,
    city: values.city || null,
    latitude: values.location?.lat ?? null,
    longitude: values.location?.lng ?? null,
  };
}
