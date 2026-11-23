import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormInput } from '@detaileed/ui';
import { loginFormSchema, LoginFormValues } from '@/features/auth/model/schemas';
import { AuthFeedback, type AuthFeedbackProps } from './AuthFeedback';

interface LoginFormProps extends AuthFeedbackProps {
  isLoading: boolean;
  onSubmit: (data: LoginFormValues) => void;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ isLoading, onSubmit, onForgotPassword, captcha, error }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormInput
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="email@detaileed.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <FormInput
        label="Hasło"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />

      <AuthFeedback captcha={captcha} error={error} />

      <Button type="submit" fullWidth loading={isLoading} disabled={!captcha.ready} className="mt-1">
        Zaloguj się
      </Button>
      <Button variant="ghost" fullWidth onClick={onForgotPassword}>
        Nie pamiętam hasła
      </Button>
    </form>
  );
};
