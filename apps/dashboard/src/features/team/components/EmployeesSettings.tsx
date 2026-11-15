import React, { useState } from 'react';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useInviteEmployee } from '@/features/team/api/employees';
import { getApiErrorMessage } from '@/shared/lib/errorHandler';

const inviteSchema = z.object({
  email: z.string().min(1, 'Email jest wymagany').email('Niepoprawny format email'),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

/** Studio settings tab: invite an employee by email. */
const EmployeesSettings: React.FC<{ addToast: (message: string, type: 'success' | 'error') => void }> = ({
  addToast,
}) => {
  const inviteEmployee = useInviteEmployee();
  const sending = inviteEmployee.isPending;
  const [lastSent, setLastSent] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
  });

  const onInvite = async (data: InviteFormValues) => {
    try {
      // Invitations from settings always add a regular employee (role 3).
      await inviteEmployee.mutateAsync({ email: data.email, roleId: 3 });
      setLastSent(data.email);
      reset();
      addToast(`Zaproszenie wysłane do ${data.email}`, 'success');
    } catch (e) {
      addToast(getApiErrorMessage(e, 'Nie udało się wysłać zaproszenia'), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-deep/5 border border-green-deep/10 rounded-3xl p-6 sm:p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 bg-green-deep rounded-xl flex items-center justify-center shrink-0">
            <Mail size={18} className="text-cream-warm" />
          </div>
          <div>
            <h3 className="font-extrabold text-green-deep text-base tracking-tight">Zaproś pracownika</h3>
            <p className="text-sm text-slate-400 mt-0.5">
              Wyślij zaproszenie e-mailem. Pracownik otrzyma link do rejestracji.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit(onInvite)} className="flex flex-col sm:flex-row gap-3 items-start">
          <div className="flex-1 w-full">
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="email"
                {...register('email')}
                placeholder="adres@email.com"
                className={`w-full pl-10 pr-4 py-4 bg-white border-2 rounded-2xl outline-none font-semibold text-sm ${errors.email ? 'border-red-400 focus:ring-red-400/20' : 'border-slate-100 focus:ring-cream-warm/20 focus:border-cream-warm/40'} transition-all`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 font-bold tracking-widest uppercase text-[10px] ml-1 mt-2">
                {errors.email.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={sending}
            className="h-[52px] flex items-center justify-center gap-2 bg-green-deep text-cream-warm px-7 rounded-2xl font-semibold text-[11px] uppercase tracking-widest active:scale-95 transition-all whitespace-nowrap disabled:opacity-60"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />} Wyślij zaproszenie
          </button>
        </form>
      </div>

      {lastSent && (
        <div className="flex items-center gap-3 px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm font-semibold">
          <CheckCircle size={17} />
          Zaproszono: <span className="font-extrabold">{lastSent}</span>
        </div>
      )}

      <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl">
        <p className="text-xs text-amber-700 font-semibold leading-relaxed">
          <strong>Jak to działa?</strong> Pracownik dostanie e-mail z linkiem do akceptacji i ustawienia hasła.
        </p>
      </div>
    </div>
  );
};

export default EmployeesSettings;
