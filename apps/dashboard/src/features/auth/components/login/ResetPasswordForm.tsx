import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { Button, FormInput } from '@detaileed/ui';
import { passwordResetSchema, PasswordResetValues } from '@/features/auth/model/schemas';
import { AuthFeedback, type AuthFeedbackProps } from './AuthFeedback';

interface ResetPasswordFormProps extends AuthFeedbackProps {
  isLoading: boolean;
  onSubmit: (data: PasswordResetValues) => void;
  onBack: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  isLoading,
  onSubmit,
  onBack,
  captcha,
  error,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetValues>({ resolver: zodResolver(passwordResetSchema) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight">Reset hasła</h2>
        <p className="text-sm text-muted-foreground">Wyślemy link resetujący na Twój email</p>
      </div>
      <FormInput
        label="Email"
        type="email"
        autoComplete="email"
        autoFocus
        placeholder="id@detaileed.pl"
        error={errors.email?.message}
        {...register('email')}
      />

      <AuthFeedback captcha={captcha} error={error} />

      <Button type="submit" fullWidth loading={isLoading} disabled={!captcha.ready} className="mt-1">
        Wyślij link resetujący
      </Button>
      <Button variant="ghost" fullWidth icon={ArrowLeft} onClick={onBack}>
        Wróć do logowania
      </Button>
    </form>
  );
};
