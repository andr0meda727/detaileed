import { z } from 'zod';
import { VehicleSize } from '@detaileed/api-client';

const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{3,4}$/im;
const nipRegex = /^[0-9]{10}$/; // Basic polish NIP validation

export const clientFormSchema = z.object({
  name: z.string().min(2, 'Imię i nazwisko jest wymagane (min. 2 znaki)').max(100),
  phone: z
    .string()
    .min(1, 'Numer telefonu jest wymagany')
    .regex(phoneRegex, 'Podaj prawidłowy numer telefonu (np. 500 600 700, +48500600700 lub 48-500-600-700)'),
  email: z.string().email('Niepoprawny format email').optional().or(z.literal('')),
  nip: z.string().regex(nipRegex, 'NIP musi składać się z 10 cyfr').optional().or(z.literal('')),
});

export const vehicleFormSchema = z.object({
  brand: z.string().optional().or(z.literal('')),
  model: z.string().optional().or(z.literal('')),
  licensePlate: z.string().min(3, 'Numer rejestracyjny jest wymagany (min. 3 znaki)').toUpperCase(),
  size: z.enum(Object.values(VehicleSize) as [VehicleSize, ...VehicleSize[]], 'Wybierz wielkość pojazdu'),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;
export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

/** A new client together with their first vehicle (booking and add-vehicle modals). */
export const newClientWithVehicleSchema = clientFormSchema.extend({ vehicle: vehicleFormSchema });

export type NewClientWithVehicleValues = z.infer<typeof newClientWithVehicleSchema>;
