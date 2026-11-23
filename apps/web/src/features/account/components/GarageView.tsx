'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Car, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import type { GarageVehicleDto } from '@detaileed/api-client';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  LicensePlate,
  Skeleton,
  useToast,
} from '@detaileed/ui';
import { vehicleSizeLabel } from '@detaileed/domain/vehicleSize';
import { useAddVehicle, useDeleteVehicle, useGarage, useUpdateVehicle } from '@/features/account/api/me';
import { carSchema, emptyCar, toCarRequest, type CarValues } from '@/features/account/model/schemas';
import { garageErrorMessage } from '@/features/account/model/errors';
import { CarFields } from '@/features/account/components/CarFields';

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
    <form className="space-y-3 rounded-lg border border-border p-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <CarFields
        fields={{
          licensePlate: register('licensePlate'),
          brand: register('brand'),
          model: register('model'),
          size: register('size'),
        }}
        errors={errors}
      />
      {errors.root && <Alert tone="danger">{errors.root.message}</Alert>}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onDone}>
          Anuluj
        </Button>
        <Button type="submit" icon={Save} loading={add.isPending || update.isPending}>
          Zapisz
        </Button>
      </div>
    </form>
  );
}

/** The customer's saved cars (at most ten): pick one when sending a request instead of typing it again. */
export function GarageView() {
  const { addToast } = useToast();
  const garage = useGarage();
  const remove = useDeleteVehicle();
  // Which form is open: a new car, a car being edited, or none.
  const [editing, setEditing] = useState<GarageVehicleDto | 'new' | null>(null);
  const cars = garage.data ?? [];

  if (garage.isLoading) return <Skeleton width="100%" height="200px" className="rounded-lg" />;

  return (
    <Card>
      <CardHeader
        title={`Moje auta (${cars.length}/${MAX_CARS})`}
        description="Wybierz zapisane auto przy zapytaniu, zamiast wpisywać je od nowa."
        actions={
          editing !== 'new' &&
          cars.length < MAX_CARS && (
            <Button variant="secondary" size="sm" icon={Plus} onClick={() => setEditing('new')}>
              Dodaj auto
            </Button>
          )
        }
      />
      <CardContent className="space-y-3">
        {cars.length === 0 && editing === null && (
          <EmptyState message="Nie masz zapisanych aut. Dodaj auto, aby szybciej wysyłać zapytania." icon={Car} />
        )}
        {cars.map((car) =>
          editing !== 'new' && editing?.id === car.id ? (
            <CarForm key={car.id} car={car} onDone={() => setEditing(null)} />
          ) : (
            <div key={car.id} className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate font-medium">{[car.brand, car.model].filter(Boolean).join(' ') || 'Auto'}</p>
                <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <LicensePlate plate={car.licensePlate} />
                  {vehicleSizeLabel(car.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={Pencil}
                aria-label={`Edytuj ${car.licensePlate}`}
                onClick={() => setEditing(car)}
              />
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                aria-label={`Usuń ${car.licensePlate}`}
                onClick={() => remove.mutate(car.id, { onSuccess: () => addToast('Usunięto auto.', 'success') })}
              />
            </div>
          ),
        )}
        {editing === 'new' && <CarForm car={null} onDone={() => setEditing(null)} />}
      </CardContent>
    </Card>
  );
}
