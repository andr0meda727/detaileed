import { z } from 'zod';
import { ServiceCategory } from '@detaileed/api-client';

/** Złoty typed by a person: digits with up to two decimals after `,` or `.`; empty = price on request. */
const price = z
  .string()
  .trim()
  .regex(/^(\d{1,6}([.,]\d{1,2})?)?$/, 'Podaj cenę, np. 249,99');

export const serviceFormSchema = z.object({
  name: z.string().trim().min(1, 'Nazwa usługi jest wymagana').max(100),
  category: z.enum(Object.values(ServiceCategory) as [ServiceCategory, ...ServiceCategory[]]),
  durationMinutes: z
    .string()
    .trim()
    .regex(/^\d+$/, 'Podaj liczbę minut')
    .refine((v) => Number(v) >= 5 && Number(v) <= 720, 'Od 5 do 720 minut'),
  prices: z.object({ Small: price, Medium: price, Large: price, XL: price }),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
