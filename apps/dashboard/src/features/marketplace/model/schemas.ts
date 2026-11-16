import { z } from 'zod';

/** The API's phone rule (Polish numbers, optional +48 / 0048, spaces or dashes between groups). */
const PHONE = /^(\+48|0048)?[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}$/;

export const listingFormSchema = z.object({
  name: z.string().trim().min(2, 'Nazwa jest wymagana (min. 2 znaki)').max(100),
  description: z.string().trim().max(2000, 'Opis może mieć najwyżej 2000 znaków'),
  address: z.string().trim().min(1, 'Adres jest wymagany').max(200),
  city: z.string().trim().min(1, 'Miasto jest wymagane').max(100),
  phone: z.string().trim().regex(PHONE, 'Podaj poprawny numer, np. 500 600 700').or(z.literal('')),
  location: z
    .object({ lat: z.number(), lng: z.number() })
    .nullable()
    .refine((v) => v !== null, 'Zaznacz studio na mapie'),
});

/** What the form holds (the pin may still be missing). */
export type ListingFormInput = z.input<typeof listingFormSchema>;
/** What a valid form gives (the pin is set). */
export type ListingFormValues = z.output<typeof listingFormSchema>;
