import React from 'react';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Mail, MapPin, Phone, Sparkles } from 'lucide-react';
import { useCreateStudio } from '@/features/studios/api/studios';
import { Alert, Button, FormInput, Modal, useToast } from '@detaileed/ui';
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

const iconProps = { className: 'size-4', strokeWidth: 1.75, 'aria-hidden': true } as const;

// ─── Props ────────────────────────────────────────────────────────────────────
interface CreateStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (studio: Studio) => void;
  /** false = onboarding (the modal has no close button) */
  canClose?: boolean;
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export const CreateStudioModal: React.FC<CreateStudioModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  canClose = true,
}) => {
  const createStudio = useCreateStudio();

  return (
    <Modal
      isOpen={isOpen}
      // While the studio is being created the dialog stays open.
      onClose={() => !createStudio.isPending && onClose()}
      dismissible={canClose}
      title="Nowe studio"
      description="Uzupełnij dane swojego detailingu"
      size="sm"
    >
      {/* The dialog's content mounts on each opening, so the form starts empty every time. */}
      <CreateStudioForm createStudio={createStudio} onSuccess={onSuccess} onCancel={canClose ? onClose : undefined} />
    </Modal>
  );
};

// ─── Form ─────────────────────────────────────────────────────────────────────
interface CreateStudioFormProps {
  createStudio: ReturnType<typeof useCreateStudio>;
  onSuccess: (studio: Studio) => void;
  /** Absent during onboarding: the first studio must be created. */
  onCancel?: () => void;
}

function CreateStudioForm({ createStudio, onSuccess, onCancel }: CreateStudioFormProps) {
  const { addToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', address: '', phone: '', email: '' },
  });

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
      onSuccess(newStudio);
    } catch (e) {
      addToast(getApiErrorMessage(e, 'Nie udało się utworzyć studia'), 'error');
    }
  };

  const isPending = createStudio.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {!onCancel && (
        <Alert tone="info" icon={Sparkles}>
          Witaj w Detaileed! Zanim zaczniesz, skonfiguruj swoje pierwsze studio. Możesz je edytować w każdej chwili w
          ustawieniach.
        </Alert>
      )}

      <FormInput
        label="Nazwa studia"
        placeholder="np. AutoDetail Pro, CarSpa Warszawa…"
        autoFocus
        leftIcon={<Building2 {...iconProps} />}
        error={errors.name?.message}
        {...register('name')}
      />
      <FormInput
        label="Adres"
        placeholder="ul. Przykładowa 1, 00-001 Warszawa"
        leftIcon={<MapPin {...iconProps} />}
        error={errors.address?.message}
        {...register('address')}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInput
          label="Telefon"
          placeholder="+48 123 456 789"
          leftIcon={<Phone {...iconProps} />}
          error={errors.phone?.message}
          {...register('phone')}
        />
        <FormInput
          label="Email"
          placeholder="kontakt@studio.pl"
          leftIcon={<Mail {...iconProps} />}
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <div className="flex flex-wrap justify-end gap-2 pt-1">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={isPending}>
            Anuluj
          </Button>
        )}
        <Button type="submit" id="create-studio-submit" loading={isPending}>
          Utwórz studio
        </Button>
      </div>
    </form>
  );
}
