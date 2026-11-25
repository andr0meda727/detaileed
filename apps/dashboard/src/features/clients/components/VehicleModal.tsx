import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Button, Modal, FormInput, Select, useToast } from '@detaileed/ui';
import { DEFAULT_VEHICLE_SIZE, VEHICLE_SIZE_OPTIONS } from '@detaileed/domain/vehicleSize';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';
import { toVehicleFields } from '@/features/clients/model/toClientInput';
import { vehicleFormSchema, type VehicleFormValues } from '@/features/clients/model/schemas';
import { useCreateVehicle, useUpdateVehicle } from '@/features/clients/api/clients';
import type { Vehicle } from '@/features/clients/model/types';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  vehicleToEdit?: Vehicle | null;
  onSuccess?: () => void;
}

export function VehicleModal({ isOpen, onClose, clientId, vehicleToEdit, onSuccess }: VehicleModalProps) {
  const { addToast } = useToast();
  const createVehicleMut = useCreateVehicle();
  const updateVehicleMut = useUpdateVehicle();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: { brand: '', model: '', licensePlate: '', size: DEFAULT_VEHICLE_SIZE },
  });

  useEffect(() => {
    if (isOpen) {
      if (vehicleToEdit) {
        reset({
          brand: vehicleToEdit.brand || '',
          model: vehicleToEdit.model || '',
          licensePlate: vehicleToEdit.licensePlate,
          size: vehicleToEdit.size ?? DEFAULT_VEHICLE_SIZE,
        });
      } else {
        reset({ brand: '', model: '', licensePlate: '', size: DEFAULT_VEHICLE_SIZE });
      }
    }
  }, [isOpen, vehicleToEdit, reset]);

  const onSubmit = async (data: VehicleFormValues) => {
    try {
      if (vehicleToEdit) {
        await updateVehicleMut.mutateAsync({
          id: vehicleToEdit.id,
          dto: { clientId, ...toVehicleFields(data) },
        });
        addToast('Dane pojazdu zostały zaktualizowane.', 'success');
      } else {
        await createVehicleMut.mutateAsync({ clientId, ...toVehicleFields(data) });
        addToast('Nowy pojazd został dodany do floty.', 'success');
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (e) {
      addToast(getApiErrorMessage(e, 'Wystąpił błąd podczas zapisywania pojazdu.'), 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={vehicleToEdit ? 'Edytuj pojazd' : 'Nowy pojazd'}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput label="Marka" placeholder="BMW" error={errors.brand?.message} {...register('brand')} />
          <FormInput label="Model" placeholder="Seria 3" error={errors.model?.message} {...register('model')} />
        </div>
        <FormInput
          label="Nr rejestracyjny *"
          placeholder="WX 12345"
          className="font-mono uppercase"
          error={errors.licensePlate?.message}
          {...register('licensePlate')}
        />
        <Select label="Wielkość pojazdu" options={VEHICLE_SIZE_OPTIONS} {...register('size')} />

        <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Anuluj
          </Button>
          <Button type="submit" icon={Save} loading={isSubmitting}>
            Zapisz pojazd
          </Button>
        </div>
      </form>
    </Modal>
  );
}
