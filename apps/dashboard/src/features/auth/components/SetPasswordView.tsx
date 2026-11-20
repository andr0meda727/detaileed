import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { setPasswordSchema, SetPasswordValues } from '@/features/auth/model/schemas';
import supabase from '@/shared/lib/supabase';

interface SetPasswordViewProps {
  onSuccess: () => void;
}

const SetPasswordView: React.FC<SetPasswordViewProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordValues>({
    resolver: zodResolver(setPasswordSchema),
  });

  const onSubmit = async (data: SetPasswordValues) => {
    setError('');
    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: data.password,
      data: { needs_password: false },
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xs border border-cream-warm max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-green-deep mb-2">Witaj w Zespole!</h1>
          <p className="text-gray-500 text-sm">
            Zostałeś zaproszony do aplikacji. Ustaw swoje hasło, aby uzyskać dostęp do panelu.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{error}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-green-deep mb-2">Nowe hasło</label>
            <input
              type="password"
              {...register('password')}
              className={`w-full px-4 py-3 rounded-xl border ${errors.password ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-green-deep focus:ring-green-deep'} focus:ring-1 outline-hidden transition-all`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 font-bold tracking-widest text-[10px] uppercase mt-2">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-green-deep mb-2">Powtórz hasło</label>
            <input
              type="password"
              {...register('confirmPassword')}
              className={`w-full px-4 py-3 rounded-xl border ${errors.confirmPassword ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-green-deep focus:ring-green-deep'} focus:ring-1 outline-hidden transition-all`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 font-bold tracking-widest text-[10px] uppercase mt-2">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-deep text-cream font-semibold py-3.5 rounded-xl hover:bg-[#1a423a] transition-all disabled:opacity-70 mt-4"
          >
            {loading ? 'Zapisywanie...' : 'Zapisz hasło i wejdź'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetPasswordView;
