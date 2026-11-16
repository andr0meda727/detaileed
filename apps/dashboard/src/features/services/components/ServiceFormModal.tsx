import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Button, FormInput, Modal, Select, useToast } from '@detaileed/ui';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';
import { SERVICE_CATEGORIES } from '@detaileed/domain/serviceCategory';
import { VEHICLE_SIZES } from '@detaileed/domain/vehicleSize';
import { useCreateService, useUpdateService } from '@/features/services/api/services';
import { serviceFormSchema, type ServiceFormValues } from '@/features/services/model/schemas';
import { serviceFormDefaults, toServiceInput } from '@/features/services/model/serviceForm';
import type { Service } from '@/features/services/model/types';

interface ServiceFormModalProps {
  isOpen: boolean;
  /** The service to edit, or null for a new one. Remount (change `key`) to reset the form. */
  service: Service | null;
  onClose: () => void;
}

const CATEGORY_OPTIONS = SERVICE_CATEGORIES.map((c) => ({ value: c.value, label: c.label }));

/** Add/edit a service: name, category, duration on a Medium car and a price per vehicle size. */
export default function ServiceFormModal({ isOpen, service, onClose }: ServiceFormModalProps) {
  const { addToast } = useToast();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: serviceFormDefaults(service),
  });

  const onSubmit = async (values: ServiceFormValues) => {
    const body = toServiceInput(values);
    try {
      if (service) await updateService.mutateAsync({ id: service.id, body });
      else await createService.mutateAsync(body);
      addToast(service ? 'Zapisano usługę' : 'Usługa dodana', 'success');
      onClose();
    } catch (err) {
      addToast(getApiErrorMessage(err, 'Nie udało się zapisać usługi'), 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={service ? 'Edycja Usługi' : 'Nowa Usługa'}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormInput
          label="Nazwa usługi"
          placeholder="np. Korekta lakieru"
          error={errors.name?.message}
          {...register('name')}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Select label="Kategoria" options={CATEGORY_OPTIONS} {...register('category')} />
          <FormInput
            label="Czas (min, średnie auto)"
            inputMode="numeric"
            error={errors.durationMinutes?.message}
            {...register('durationMinutes')}
          />
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1">
            Cena wg wielkości auta (zł)
          </p>
          <p className="text-xs text-slate-400 px-1 mb-3">
            Puste pole = cena na zapytanie. Klient zobaczy cenę dla swojego auta.
          </p>
          <div className="grid grid-cols-2 gap-x-4">
            {VEHICLE_SIZES.map((size) => (
              <FormInput
                key={size.value}
                label={size.label}
                inputMode="decimal"
                placeholder="na zapytanie"
                error={errors.prices?.[size.value]?.message}
                {...register(`prices.${size.value}`)}
              />
            ))}
          </div>
        </div>

        <Button size="lg" fullWidth type="submit" icon={Save} loading={isSubmitting}>
          Zapisz
        </Button>
      </form>
    </Modal>
  );
}
