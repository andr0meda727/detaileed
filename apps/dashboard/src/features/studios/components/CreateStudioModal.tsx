import React, { useEffect } from 'react';
import { getApiErrorMessage } from '@/shared/lib/errorHandler';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, MapPin, Phone, Mail, Loader2, Sparkles, X } from 'lucide-react';
import { useCreateStudio } from '@/features/studios/api/studios';
import { useToast } from '@detaileed/ui';
import type { Studio } from '@/features/studios/model/types';

// ─── Schema ───────────────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(1, 'Nazwa studia jest wymagana').max(100, 'Nazwa jest zbyt długa'),
  address: z.string().max(200).optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  email: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
      message: 'Niepoprawny format email',
    }),
});

type FormValues = z.infer<typeof schema>;

// ─── Field component ──────────────────────────────────────────────────────────
const Field: React.FC<{
  label: string;
  icon: React.ReactNode;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, icon, error, required, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-[10px] font-bold text-green-deep/60 uppercase tracking-widest ml-1">
      {label}
      {required && <span className="text-amber-500">*</span>}
    </label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">{icon}</span>
      {children}
    </div>
    {error && <p className="text-red-500 font-bold tracking-widest uppercase text-[10px] ml-1">{error}</p>}
  </div>
);

// ─── Props ────────────────────────────────────────────────────────────────────
interface CreateStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (studio: Studio) => void;
  /** false = onboarding (modal bez możliwości zamknięcia X) */
  canClose?: boolean;
}

// ─── Modal ────────────────────────────────────────────────────────────────────
const CreateStudioModal: React.FC<CreateStudioModalProps> = ({ isOpen, onClose, onSuccess, canClose = true }) => {
  const { addToast } = useToast();
  const createStudio = useCreateStudio();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', address: '', phone: '', email: '' },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      const dto = {
        name: data.name.trim(),
        address: data.address?.trim() || null,
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
      };
      const newStudio = await createStudio.mutateAsync(dto);
      addToast(`Studio „${newStudio.name}" zostało utworzone!`, 'success');
      reset();
      onSuccess(newStudio);
    } catch (e) {
      addToast(getApiErrorMessage(e, 'Nie udało się utworzyć studia'), 'error');
    }
  };

  if (!isOpen) return null;

  const isPending = createStudio.isPending;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(10,20,12,0.55)', backdropFilter: 'blur(8px)' }}
      onClick={canClose ? onClose : undefined}
    >
      {/* Panel */}
      <div
        className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.35)] animate-in fade-in slide-in-from-bottom-4 duration-300"
        style={{ background: 'linear-gradient(160deg, #f7f4ef 0%, #ffffff 60%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div
          className="h-1.5 w-full"
          style={{ background: 'linear-gradient(90deg, var(--green-deep) 0%, #d4a853 100%)' }}
        />

        {/* Header */}
        <div className="px-8 pt-8 pb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg bg-brand-gradient">
              <Building2 size={22} className="text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-green-deep tracking-tight leading-tight">Nowe Studio</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Uzupełnij dane swojego detailingu</p>
            </div>
          </div>

          {canClose && (
            <button
              onClick={onClose}
              disabled={isPending}
              className="p-2 rounded-xl text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-all active:scale-90 disabled:opacity-40"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Onboarding banner (when canClose=false) */}
        {!canClose && (
          <div className="mx-8 mb-6 px-5 py-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
            <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 font-semibold leading-relaxed">
              Witaj w Detaileed! Zanim zaczniesz, skonfiguruj swoje pierwsze studio. Możesz je edytować w każdej chwili
              w ustawieniach.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 space-y-5">
          {/* Name */}
          <Field label="Nazwa studia" icon={<Building2 size={15} />} error={errors.name?.message} required>
            <input
              {...register('name')}
              placeholder="np. AutoDetail Pro, CarSpa Warszawa…"
              autoFocus
              className={`w-full pl-10 pr-4 py-4 bg-slate-50 rounded-2xl outline-hidden font-semibold text-sm border-2 transition-all
                ${
                  errors.name
                    ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                    : 'border-transparent focus:border-green-deep/20 focus:bg-white focus:ring-2 focus:ring-green-deep/10'
                }`}
            />
          </Field>

          {/* Address */}
          <Field label="Adres" icon={<MapPin size={15} />} error={errors.address?.message}>
            <input
              {...register('address')}
              placeholder="ul. Przykładowa 1, 00-001 Warszawa"
              className="w-full pl-10 pr-4 py-4 bg-slate-50 rounded-2xl outline-hidden font-semibold text-sm border-2 border-transparent focus:border-green-deep/20 focus:bg-white focus:ring-2 focus:ring-green-deep/10 transition-all"
            />
          </Field>

          {/* Phone + Email row */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Telefon" icon={<Phone size={15} />} error={errors.phone?.message}>
              <input
                {...register('phone')}
                placeholder="+48 123 456 789"
                className="w-full pl-10 pr-3 py-4 bg-slate-50 rounded-2xl outline-hidden font-semibold text-sm border-2 border-transparent focus:border-green-deep/20 focus:bg-white focus:ring-2 focus:ring-green-deep/10 transition-all"
              />
            </Field>

            <Field label="Email" icon={<Mail size={15} />} error={errors.email?.message}>
              <input
                {...register('email')}
                placeholder="kontakt@studio.pl"
                className={`w-full pl-10 pr-3 py-4 bg-slate-50 rounded-2xl outline-hidden font-semibold text-sm border-2 transition-all
                  ${
                    errors.email
                      ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                      : 'border-transparent focus:border-green-deep/20 focus:bg-white focus:ring-2 focus:ring-green-deep/10'
                  }`}
              />
            </Field>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            id="create-studio-submit"
            className="w-full py-4 rounded-2xl font-bold text-[12px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-green-deep/20 bg-brand-gradient"
            style={{ color: '#f7f4ef' }}
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Tworzenie…
              </>
            ) : (
              <>
                <Sparkles size={16} className="text-amber-300" />
                Utwórz Studio
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateStudioModal;
