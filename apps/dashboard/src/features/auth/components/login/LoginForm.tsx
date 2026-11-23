import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Loader2 } from 'lucide-react';
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-3">
        <label className="text-[10px] font-semibold text-green-light uppercase tracking-[0.3em] ml-6">Email</label>
        <input
          type="email"
          {...register('email')}
          className={`w-full px-8 py-6 bg-cream border-2 ${errors.email ? 'border-red-400 focus:ring-red-400/40' : 'border-transparent focus:ring-cream-warm/40'} rounded-xl focus:ring-4 outline-hidden transition-all font-bold text-sm text-green-deep`}
          placeholder="email@detaileed.com"
        />
        {errors.email && (
          <p className="text-red-500 font-bold tracking-widest uppercase text-[10px] ml-6">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-3">
        <label className="text-[10px] font-semibold text-green-light uppercase tracking-[0.3em] ml-6">Hasło</label>
        <input
          type="password"
          {...register('password')}
          className={`w-full px-8 py-6 bg-cream border-2 ${errors.password ? 'border-red-400 focus:ring-red-400/40' : 'border-transparent focus:ring-cream-warm/40'} rounded-xl focus:ring-4 outline-hidden transition-all font-bold text-sm text-green-deep`}
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="text-red-500 font-bold tracking-widest uppercase text-[10px] ml-6">{errors.password.message}</p>
        )}
      </div>

      <AuthFeedback captcha={captcha} error={error} />

      <button
        type="submit"
        disabled={isLoading || !captcha.ready}
        className="w-full flex items-center justify-center gap-4 bg-green-deep hover:bg-[#1A3D33] text-cream-warm font-semibold py-6 rounded-xl transition-all shadow-[0_20px_40px_rgba(16,44,38,0.2)] group text-[11px] uppercase tracking-[0.2em] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <>
            Zaloguj się{' '}
            <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" strokeWidth={3} />
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onForgotPassword}
        className="w-full text-center text-[10px] font-semibold text-green-light uppercase tracking-widest hover:text-green-deep transition-colors pt-2"
      >
        Nie pamiętam hasła →
      </button>
    </form>
  );
};
