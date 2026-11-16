import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().trim().email('Podaj poprawny adres e-mail'),
  password: z.string().min(1, 'Podaj hasło'),
});

export type SignInValues = z.infer<typeof signInSchema>;

/** The same password rule as the backend: at least 8 characters with a capital letter and a digit. */
export const signUpSchema = z
  .object({
    firstName: z.string().trim().min(1, 'Podaj imię').max(50),
    lastName: z.string().trim().min(1, 'Podaj nazwisko').max(50),
    email: z.string().trim().email('Podaj poprawny adres e-mail'),
    password: z
      .string()
      .min(8, 'Hasło musi mieć co najmniej 8 znaków')
      .regex(/[A-Z]/, 'Hasło musi zawierać wielką literę')
      .regex(/\d/, 'Hasło musi zawierać cyfrę'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Hasła muszą być takie same',
  });

export type SignUpValues = z.infer<typeof signUpSchema>;
