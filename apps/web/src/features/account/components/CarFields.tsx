'use client';

import type { UseFormRegisterReturn } from 'react-hook-form';
import { FormInput, Select } from '@detaileed/ui';
import { VEHICLE_SIZE_OPTIONS } from '@detaileed/domain/vehicleSize';
import type { CarValues } from '@/features/account/model/schemas';

interface CarFieldsProps {
  /** `register(...)` results, so the fields fit a car form and the request form alike. */
  fields: Record<keyof CarValues, UseFormRegisterReturn>;
  errors?: Partial<Record<keyof CarValues, { message?: string }>>;
}

/** Plate, size (it sets the price), brand and model of a car. */
export function CarFields({ fields, errors }: CarFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-x-3">
      <FormInput
        label="Nr rejestracyjny"
        className="uppercase"
        placeholder="KR 12345"
        error={errors?.licensePlate?.message}
        {...fields.licensePlate}
      />
      <Select label="Wielkość auta" options={VEHICLE_SIZE_OPTIONS} {...fields.size} />
      <FormInput label="Marka" placeholder="Volvo" error={errors?.brand?.message} {...fields.brand} />
      <FormInput label="Model" placeholder="XC90" error={errors?.model?.message} {...fields.model} />
    </div>
  );
}
