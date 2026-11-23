import type { UseFormRegisterReturn } from 'react-hook-form';
import { FormInput, Select } from '@detaileed/ui';
import { VEHICLE_SIZE_OPTIONS } from '@detaileed/domain/vehicleSize';

interface VehicleFieldsProps {
  brand: UseFormRegisterReturn;
  model: UseFormRegisterReturn;
  licensePlate: UseFormRegisterReturn;
  size: UseFormRegisterReturn;
  plateError?: string;
}

/** Brand, model, plate and size inputs; takes `register(...)` results so it fits any form that has these fields. */
export function VehicleFields({ brand, model, licensePlate, size, plateError }: VehicleFieldsProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Dane pojazdu</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <FormInput aria-label="Marka" placeholder="Marka (opcjonalnie)" {...brand} />
        <FormInput aria-label="Model" placeholder="Model (opcjonalnie)" {...model} />
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <FormInput
          aria-label="Nr rejestracyjny"
          placeholder="Nr rejestracyjny *"
          className="font-mono uppercase"
          error={plateError}
          {...licensePlate}
        />
        <Select aria-label="Wielkość pojazdu" options={VEHICLE_SIZE_OPTIONS} {...size} />
      </div>
    </div>
  );
}
