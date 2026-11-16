import { z } from 'zod';

export const bookingFormSchema = z.object({
  clientId: z.string().min(1, 'Klient jest wymagany'),
  vehicleId: z.string().min(1, 'Pojazd jest wymagany'),
  scheduledAt: z.string().min(1, 'Termin jest wymagany (Data i godzina)'),
  statusId: z.string().optional(),
  serviceIds: z.array(z.string()).min(1, 'Wybierz co najmniej jedną usługę'),
  priceInput: z
    .string()
    .min(1, 'Cena jest wymagana')
    .regex(/^[\d\s]+(?:[.,]\d{1,2})?$/, 'Podaj poprawną kwotę (np. 150 lub 150,50)'),
  notes: z.string().optional().or(z.literal('')),
  /** A bay picked by hand or with a free slot; null lets the planner choose. */
  bayId: z.string().nullable().optional(),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
