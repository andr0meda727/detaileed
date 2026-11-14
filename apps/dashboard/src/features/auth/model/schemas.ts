import { z } from 'zod';

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
