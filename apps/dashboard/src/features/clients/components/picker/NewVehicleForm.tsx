import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useToast } from '@detaileed/ui';
import { getApiErrorMessage } from '@/shared/lib/errorHandler';
import { useCreateVehicle } from '@/features/clients/api/clients';
import { vehicleFormSchema, type VehicleFormValues } from '@/features/clients/model/schemas';
import { toVehicleFields } from '@/features/clients/model/toClientInput';
import VehicleFields from '@/features/clients/components/picker/VehicleFields';

interface NewVehicleFormProps {
  /** Owner of the new vehicle; submitting without one shows an error. */
  clientId: string | null;
  onCreated: () => void;
}

/** Adds a vehicle to an existing client. */
export default function NewVehicleForm({ clientId, onCreated }: NewVehicleFormProps) {
  const { addToast } = useToast();
  const createVehicle = useCreateVehicle();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: { brand: '', model: '', licensePlate: '' },
  });

  const onValid = async (values: VehicleFormValues) => {
    if (!clientId) {
      setError('root', { message: 'Wybierz istniejącego klienta lub dodaj nowego.' });
      return;
    }
    try {
      await createVehicle.mutateAsync({ clientId, ...toVehicleFields(values) });
      onCreated();
    } catch (err) {
      addToast(getApiErrorMessage(err, 'Wystąpił błąd podczas dodawania pojazdu.'), 'error');
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onValid)}>
      <VehicleFields
        brand={register('brand')}
        model={register('model')}
        licensePlate={register('licensePlate')}
        plateError={errors.licensePlate?.message}
      />
      {errors.root && (
        <p className="text-red-500 font-bold tracking-widest uppercase text-[10px]">{errors.root.message}</p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-green-deep text-cream-warm rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] shadow-xl active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
      >
        <Save size={16} /> Zapisz Pojazd
      </button>
    </form>
  );
}
