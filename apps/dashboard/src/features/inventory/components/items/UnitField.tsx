import { FormInput, SegmentedControl } from '@detaileed/ui';
import { DEFAULT_UNITS } from '@/features/inventory/model/itemForm';

interface UnitFieldProps {
  value: string;
  onChange: (unit: string) => void;
  error?: string;
}

const OPTIONS = DEFAULT_UNITS.map((unit) => ({ value: unit, label: unit }));

/** Preset units side by side plus a text field for any other unit; both edit the same value. */
export function UnitField({ value, onChange, error }: UnitFieldProps) {
  const isPreset = DEFAULT_UNITS.includes(value);
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-[13px] font-medium text-foreground">Jednostka</legend>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <SegmentedControl
          aria-label="Gotowe jednostki"
          options={OPTIONS}
          value={isPreset ? value : ''}
          onValueChange={onChange}
          className="self-start font-mono"
        />
        <FormInput
          aria-label="Własna jednostka"
          value={isPreset ? '' : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Inna, np. opak."
          error={error}
        />
      </div>
    </fieldset>
  );
}
