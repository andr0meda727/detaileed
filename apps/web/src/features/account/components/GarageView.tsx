'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Car, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import type { GarageVehicleDto } from '@detaileed/api-client';
import { Button, EmptyState, FormSection, Skeleton, useToast } from '@detaileed/ui';
import { vehicleSizeLabel } from '@detaileed/domain/vehicleSize';
import { useAddVehicle, useDeleteVehicle, useGarage, useUpdateVehicle } from '@/features/account/api/me';
import { carSchema, emptyCar, toCarRequest, type CarValues } from '@/features/account/model/schemas';
import { garageErrorMessage } from '@/features/account/model/errors';
import CarFields from '@/features/account/components/CarFields';

const MAX_CARS = 10;

function CarForm({ car, onDone }: { car: GarageVehicleDto | null; onDone: () => void }) {
  const { addToast } = useToast();
  const add = useAddVehicle();
  const update = useUpdateVehicle();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CarValues>({
    resolver: zodResolver(carSchema),
    defaultValues: car
      ? { licensePlate: car.licensePlate, brand: car.brand ?? '', model: car.model ?? '', size: car.size }
      : emptyCar,
  });
  const options = {
    onSuccess: () => {
      addToast(car ? 'Zapisano auto.' : 'Dodano auto.', 'success');
      onDone();
    },
    onError: (err: unknown) => setError('root', { message: garageErrorMessage(err) }),
  };
  const onSubmit = (values: CarValues) =>
    car
      ? update.mutate({ id: car.id, body: toCarRequest(values) }, options)
      : add.mutate(toCarRequest(values), options);

  return (
    <form className="space-y-2" onSubmit={handleSubmit(onSubmit)} noValidate>
      <CarFields
        fields={{
          licensePlate: register('licensePlate'),
          brand: register('brand'),
          model: register('model'),
          size: register('size'),
        }}
        errors={errors}
      />
      {errors.root && (
        <p role="alert" className="text-sm text-red-600">
          {errors.root.message}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" icon={Save} loading={add.isPending || update.isPending}>
          Zapisz
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Anuluj
        </Button>
      </div>
    </form>
  );
}

/** The customer's saved cars (at most ten): pick one when sending a request instead of typing it again. */
export default function GarageView() {
  const { addToast } = useToast();
  const garage = useGarage();
  const remove = useDeleteVehicle();
  // Which form is open: a new car, a car being edited, or none.
  const [editing, setEditing] = useState<GarageVehicleDto | 'new' | null>(null);
  const cars = garage.data ?? [];

  if (garage.isLoading) return <Skeleton width="100%" height="200px" className="rounded-2xl" />;

  return (
    <FormSection icon={Car} title={`Moje auta (${cars.length}/${MAX_CARS})`}>
      <div className="p-5 space-y-3">
        {cars.length === 0 && editing === null && (
          <EmptyState message="Nie masz zapisanych aut. Dodaj auto, aby szybciej wysyłać zapytania." icon={Car} />
        )}
        {cars.map((car) =>
          editing !== 'new' && editing?.id === car.id ? (
            <CarForm key={car.id} car={car} onDone={() => setEditing(null)} />
          ) : (
            <div key={car.id} className="flex items-center gap-3 p-3 rounded-xl border border-green-deep/10">
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{[car.brand, car.model].filter(Boolean).join(' ') || 'Auto'}</p>
                <p className="text-sm text-green-light">
                  <span className="font-mono">{car.licensePlate}</span> · {vehicleSizeLabel(car.size)}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Edytuj ${car.licensePlate}`}
                onClick={() => setEditing(car)}
                className="p-2 rounded-xl hover:bg-cream"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                aria-label={`Usuń ${car.licensePlate}`}
                onClick={() => remove.mutate(car.id, { onSuccess: () => addToast('Usunięto auto.', 'success') })}
                className="p-2 rounded-xl hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ),
        )}
        {editing === 'new' ? (
          <CarForm car={null} onDone={() => setEditing(null)} />
        ) : (
          cars.length < MAX_CARS && (
            <Button variant="secondary" icon={Plus} onClick={() => setEditing('new')}>
              Dodaj auto
            </Button>
          )
        )}
      </div>
    </FormSection>
  );
}
