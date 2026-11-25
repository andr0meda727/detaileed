import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { Button, FormInput, useToast } from '@detaileed/ui';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';
import { useCreateClient } from '@/features/clients/api/clients';
import { newClientWithVehicleSchema, type NewClientWithVehicleValues } from '@/features/clients/model/schemas';
import { toNewClientInput } from '@/features/clients/model/toClientInput';
import type { Client } from '@/features/clients/model/types';
import { VehicleFields } from '@/features/clients/components/picker/VehicleFields';
import { DEFAULT_VEHICLE_SIZE } from '@detaileed/domain/vehicleSize';

interface NewClientWithVehicleFormProps {
  submitLabel: string;
  /** Called with the created client; its `vehicles[0]` is the new vehicle. */
  onCreated: (client: Client) => void;
}

const emptyValues: NewClientWithVehicleValues = {
  name: '',
  phone: '',
  email: '',
  nip: '',
  vehicle: { brand: '', model: '', licensePlate: '', size: DEFAULT_VEHICLE_SIZE },
};

/**
 * Creates a client together with their first vehicle. It is not a `<form>` element, so it can sit inside
 * another form (the booking form); its button validates and submits it on its own.
 */
export function NewClientWithVehicleForm({ submitLabel, onCreated }: NewClientWithVehicleFormProps) {
  const { addToast } = useToast();
  const createClient = useCreateClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewClientWithVehicleValues>({
    resolver: zodResolver(newClientWithVehicleSchema),
    defaultValues: emptyValues,
  });

  const onValid = async (values: NewClientWithVehicleValues) => {
    try {
      onCreated(await createClient.mutateAsync(toNewClientInput(values)));
    } catch (err) {
      addToast(getApiErrorMessage(err, 'Wystąpił błąd podczas tworzenia klienta.'), 'error');
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Dane klienta</p>
        <FormInput
          aria-label="Imię i nazwisko"
          placeholder="Imię i nazwisko *"
          error={errors.name?.message}
          {...register('name')}
        />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <FormInput
            type="tel"
            aria-label="Telefon"
            placeholder="Telefon *"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <FormInput
            type="email"
            aria-label="Email"
            placeholder="Email (opcjonalnie)"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>
        <FormInput aria-label="NIP" placeholder="NIP (opcjonalnie)" error={errors.nip?.message} {...register('nip')} />
      </div>
      <div className="border-t border-border pt-3">
        <VehicleFields
          brand={register('vehicle.brand')}
          model={register('vehicle.model')}
          licensePlate={register('vehicle.licensePlate')}
          size={register('vehicle.size')}
          plateError={errors.vehicle?.licensePlate?.message}
        />
      </div>
      <Button fullWidth loading={isSubmitting} onClick={handleSubmit(onValid)} icon={UserPlus}>
        {submitLabel}
      </Button>
    </div>
  );
}
