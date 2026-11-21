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
    <div className="space-y-1">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dane Pojazdu</p>
      <div className="grid grid-cols-2 gap-2.5">
        <FormInput placeholder="Marka (opcjonalnie)" {...brand} />
        <FormInput placeholder="Model (opcjonalnie)" {...model} />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <FormInput placeholder="Nr Rejestracyjny *" className="uppercase" error={plateError} {...licensePlate} />
        <Select aria-label="Wielkość pojazdu" options={VEHICLE_SIZE_OPTIONS} {...size} />
      </div>
    </div>
  );
}
