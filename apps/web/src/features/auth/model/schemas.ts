import { z } from 'zod';

const email = z.string().trim().email('Podaj poprawny adres e-mail');

/** The same password rule as the backend: at least 8 characters with a capital letter and a digit. */
export const passwordSchema = z
  .string()
  .min(8, 'Hasło musi mieć co najmniej 8 znaków')
  .regex(/[A-Z]/, 'Hasło musi zawierać wielką literę')
  .regex(/\d/, 'Hasło musi zawierać cyfrę');

const samePasswords = {
  path: ['confirmPassword'],
  message: 'Hasła muszą być takie same',
};

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Podaj hasło'),
});

export type SignInValues = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    firstName: z.string().trim().min(1, 'Podaj imię').max(50),
    lastName: z.string().trim().min(1, 'Podaj nazwisko').max(50),
    email,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, samePasswords);

export type SignUpValues = z.infer<typeof signUpSchema>;

export const forgotPasswordSchema = z.object({ email });

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

/** A new password typed twice: after a reset link and in the account settings. */
export const newPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, samePasswords);

export type NewPasswordValues = z.infer<typeof newPasswordSchema>;
