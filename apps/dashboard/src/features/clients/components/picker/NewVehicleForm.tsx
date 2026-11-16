import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Button, useToast } from '@detaileed/ui';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';
import { useCreateVehicle } from '@/features/clients/api/clients';
import { vehicleFormSchema, type VehicleFormValues } from '@/features/clients/model/schemas';
import { toVehicleFields } from '@/features/clients/model/toClientInput';
import VehicleFields from '@/features/clients/components/picker/VehicleFields';
import { DEFAULT_VEHICLE_SIZE } from '@detaileed/domain/vehicleSize';

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
    defaultValues: { brand: '', model: '', licensePlate: '', size: DEFAULT_VEHICLE_SIZE },
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
        size={register('size')}
        plateError={errors.licensePlate?.message}
      />
      {errors.root && (
        <p className="text-red-500 font-bold tracking-widest uppercase text-[10px]">{errors.root.message}</p>
      )}
      <Button size="lg" fullWidth type="submit" disabled={isSubmitting} icon={Save}>
        Zapisz Pojazd
      </Button>
    </form>
  );
}
