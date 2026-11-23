'use client';

import type { GarageVehicleDto } from '@detaileed/api-client';
import { LicensePlate, RadioCardGroup } from '@detaileed/ui';
import { NEW_CAR } from '@/features/booking/model/requestForm';

interface CarChoiceProps {
  garage: GarageVehicleDto[];
  /** A garage car's id, NEW_CAR, or '' before choosing. */
  value: string;
  onChange: (value: string) => void;
  /** Id of the error line under the choice. */
  errorId?: string;
  invalid?: boolean;
}

/** The customer's garage cars and "another car", as radio cards. */
export function CarChoice({ garage, value, onChange, errorId, invalid }: CarChoiceProps) {
  const options = [
    ...garage.map((v) => ({
      value: v.id,
      label: [v.brand, v.model].filter(Boolean).join(' ') || 'Auto',
      trailing: v.licensePlate ? <LicensePlate plate={v.licensePlate} /> : undefined,
    })),
    { value: NEW_CAR, label: 'Inne auto' },
  ];
  return (
    <RadioCardGroup
      aria-label="Auto"
      aria-describedby={errorId}
      aria-invalid={invalid || undefined}
      options={options}
      value={value}
      onValueChange={onChange}
      columns={2}
    />
  );
}
