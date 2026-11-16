import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Button, Modal, FormInput, useToast } from '@detaileed/ui';
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

export default function VehicleModal({ isOpen, onClose, clientId, vehicleToEdit, onSuccess }: VehicleModalProps) {
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
    defaultValues: { brand: '', model: '', licensePlate: '' },
  });

  useEffect(() => {
    if (isOpen) {
      if (vehicleToEdit) {
        reset({
          brand: vehicleToEdit.brand || '',
          model: vehicleToEdit.model || '',
          licensePlate: vehicleToEdit.licensePlate,
        });
      } else {
        reset({ brand: '', model: '', licensePlate: '' });
      }
    }
  }, [isOpen, vehicleToEdit, reset]);

  const onSubmit = async (data: VehicleFormValues) => {
    try {
      if (vehicleToEdit) {
        await updateVehicleMut.mutateAsync({
          id: vehicleToEdit.id,
          dto: {
            clientId,
            brand: data.brand || null,
            model: data.model || null,
            licensePlate: data.licensePlate,
          },
        });
        addToast('Dane pojazdu zostały zaktualizowane.', 'success');
      } else {
        await createVehicleMut.mutateAsync({
          clientId,
          brand: data.brand || null,
          model: data.model || null,
          licensePlate: data.licensePlate,
        });
        addToast('Nowy pojazd został dodany do floty.', 'success');
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (e) {
      console.error(e);
      addToast('Wystąpił błąd podczas zapisywania pojazdu.', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={vehicleToEdit ? 'Edytuj Pojazd' : 'Nowy Pojazd'}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Marka" placeholder="BMW" error={errors.brand?.message} {...register('brand')} />
          <FormInput label="Model" placeholder="Seria 3" error={errors.model?.message} {...register('model')} />
        </div>
        <FormInput
          label="Nr Rejestracyjny *"
          placeholder="WX 12345"
          className="uppercase"
          error={errors.licensePlate?.message}
          {...register('licensePlate')}
        />

        <div className="pt-2">
          <Button size="lg" fullWidth type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span>TRWA ZAPIS...</span>
            ) : (
              <>
                <Save size={18} /> Zapisz Pojazd
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
