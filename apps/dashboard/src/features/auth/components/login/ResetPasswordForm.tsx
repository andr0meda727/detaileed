import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, KeyRound, Loader2 } from 'lucide-react';
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="text-center mb-2">
        <div className="w-12 h-12 bg-cream-warm/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <KeyRound size={22} className="text-green-deep" />
        </div>
        <h2 className="font-extrabold text-green-deep text-xl tracking-tight">Reset hasła</h2>
        <p className="text-xs text-slate-400 mt-2">Wyślemy link resetujący na Twój email</p>
      </div>
      <div className="space-y-3">
        <label className="text-[10px] font-semibold text-green-light uppercase tracking-[0.3em] ml-6">Email</label>
        <input
          type="email"
          {...register('email')}
          autoFocus
          className={`w-full px-8 py-6 bg-cream border-2 ${errors.email ? 'border-red-400 focus:ring-red-400/40' : 'border-transparent focus:ring-cream-warm/40'} rounded-xl focus:ring-4 outline-hidden transition-all font-bold text-sm text-green-deep`}
          placeholder="id@detaileed.pl"
        />
        {errors.email && (
          <p className="text-red-500 font-bold tracking-widest uppercase text-[10px] ml-6">{errors.email.message}</p>
        )}
      </div>

      <AuthFeedback captcha={captcha} error={error} />

      <button
        type="submit"
        disabled={isLoading || !captcha.ready}
        className="w-full flex items-center justify-center gap-3 bg-green-deep text-cream-warm font-semibold py-6 rounded-xl transition-all text-[11px] uppercase tracking-[0.2em] disabled:opacity-70"
      >
        {isLoading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <>
            Wyślij link resetujący <ArrowRight size={20} strokeWidth={3} />
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest hover:text-green-deep transition-colors pt-2"
      >
        <ArrowLeft size={14} /> Wróć do logowania
      </button>
    </form>
  );
};
