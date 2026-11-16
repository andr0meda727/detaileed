import type { UseFormRegisterReturn } from 'react-hook-form';
import { FormInput } from '@detaileed/ui';

interface VehicleFieldsProps {
  brand: UseFormRegisterReturn;
  model: UseFormRegisterReturn;
  licensePlate: UseFormRegisterReturn;
  plateError?: string;
}

/** Brand, model and plate inputs; takes `register(...)` results so it fits any form that has these fields. */
export default function VehicleFields({ brand, model, licensePlate, plateError }: VehicleFieldsProps) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dane Pojazdu</p>
      <div className="grid grid-cols-2 gap-2.5">
        <FormInput placeholder="Marka (opcjonalnie)" {...brand} />
        <FormInput placeholder="Model (opcjonalnie)" {...model} />
      </div>
      <FormInput placeholder="Nr Rejestracyjny *" className="uppercase" error={plateError} {...licensePlate} />
    </div>
  );
}
