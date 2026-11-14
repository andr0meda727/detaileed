import { z } from 'zod';

// Reusable regex patterns
const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{3,4}$/im;
const nipRegex = /^[0-9]{10}$/; // Basic polish NIP validation

export const clientFormSchema = z.object({
  name: z.string().min(2, 'Imię i nazwisko jest wymagane (min. 2 znaki)').max(100),
  phone: z.string().min(1, 'Numer telefonu jest wymagany').regex(phoneRegex, 'Podaj prawidłowy numer telefonu (np. 500 600 700, +48500600700 lub 48-500-600-700)'),
  email: z.string().email('Niepoprawny format email').optional().or(z.literal('')),
  nip: z.string().regex(nipRegex, 'NIP musi składać się z 10 cyfr').optional().or(z.literal('')),
});

export const vehicleFormSchema = z.object({
  brand: z.string().optional().or(z.literal('')),
  model: z.string().optional().or(z.literal('')),
  licensePlate: z.string().min(3, 'Numer rejestracyjny jest wymagany (min. 3 znaki)').toUpperCase(),
});

// A combined schema for adding a client along with their first vehicle inline
export const createClientWithVehicleSchema = clientFormSchema.extend({
  vehicle: vehicleFormSchema.optional(), // Might be required depending on logic
});

export const bookingFormSchema = z.object({
  clientId: z.string().min(1, 'Klient jest wymagany'),
  vehicleId: z.string().min(1, 'Pojazd jest wymagany'),
  scheduledAt: z.string().min(1, 'Termin jest wymagany (Data i godzina)'),
  statusId: z.string().optional(),
  serviceIds: z.array(z.string()).min(1, 'Wybierz co najmniej jedną usługę'),
  priceInput: z.string().min(1, 'Cena jest wymagana').regex(/^[\d\s]+(?:[.,]\d{1,2})?$/, 'Podaj poprawną kwotę (np. 150 lub 150,50)'),
  notes: z.string().optional().or(z.literal('')),
});

export const bookingNewClientSchema = z.object({
  client: clientFormSchema,
  vehicle: vehicleFormSchema,
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;
export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;
export type CreateClientWithVehicleValues = z.infer<typeof createClientWithVehicleSchema>;
export type BookingFormValues = z.infer<typeof bookingFormSchema>;
export type BookingNewClientValues = z.infer<typeof bookingNewClientSchema>;

export const loginFormSchema = z.object({
  email: z.string().min(1, 'Email jest wymagany').email('Niepoprawny format email'),
  password: z.string().min(1, 'Hasło jest wymagane'),
});

export const passwordResetSchema = z.object({
  email: z.string().min(1, 'Email jest wymagany').email('Niepoprawny format email'),
});

export const setPasswordSchema = z.object({
  password: z.string().min(8, 'Hasło musi mieć minimum 8 znaków'),
  confirmPassword: z.string().min(8, 'Hasło musi mieć minimum 8 znaków'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła nie są identyczne",
  path: ["confirmPassword"],
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type PasswordResetValues = z.infer<typeof passwordResetSchema>;
export type SetPasswordValues = z.infer<typeof setPasswordSchema>;
