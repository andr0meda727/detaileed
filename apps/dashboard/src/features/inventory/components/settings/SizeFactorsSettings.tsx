import { useState } from 'react';
import { Save, Scaling } from 'lucide-react';
import { Button, FormInput, FormSection, Skeleton, useToast } from '@detaileed/ui';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';
import { VEHICLE_SIZES } from '@detaileed/domain/vehicleSize';
import { useSaveSizeFactors, useSizeFactors } from '@/features/inventory/api/ledger';
import type { SizeFactors } from '@/features/inventory/model/ledger';

const KEYS = { Small: 'small', Medium: 'medium', Large: 'large', XL: 'xl' } as const;
const FACTOR = /^\d+([.,]\d{1,2})?$/;
const toText = (n: number) => String(n).replace('.', ',');

function Form({ factors, canEdit }: { factors: SizeFactors; canEdit: boolean }) {
  const { addToast } = useToast();
  const save = useSaveSizeFactors();
  const [values, setValues] = useState({
    small: toText(factors.small),
    medium: toText(factors.medium),
    large: toText(factors.large),
    xl: toText(factors.xl),
  });
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const parsed = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, FACTOR.test(v.trim()) ? Number(v.trim().replace(',', '.')) : NaN]),
    ) as unknown as SizeFactors;
    if (Object.values(parsed).some((n) => !(n > 0 && n <= 5))) {
      setError('Podaj mnożniki od 0,01 do 5, np. 1,3');
      return;
    }
    setError(null);
    save.mutate(parsed, {
      onSuccess: () => addToast('Zapisano mnożniki materiałów.', 'success'),
      onError: (err) => setError(getApiErrorMessage(err, 'Nie udało się zapisać mnożników.')),
    });
  };

  return (
    <div className="p-5 space-y-3">
      <p className="text-sm text-slate-500">
        Ile razy więcej materiału zużywa auto danej wielkości niż średnie (np. SUV 1,3). Osobno od czasu wizyty.
      </p>
      <fieldset disabled={!canEdit} className="grid grid-cols-2 sm:grid-cols-4 gap-x-4">
        {VEHICLE_SIZES.map((size) => {
          const key = KEYS[size.value];
          return (
            <FormInput
              key={key}
              label={size.short}
              inputMode="decimal"
              value={values[key]}
              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
            />
          );
        })}
      </fieldset>
      {error && (
        <p role="alert" className="text-xs font-bold text-red-500">
          {error}
        </p>
      )}
      {canEdit && (
        <Button icon={Save} loading={save.isPending} onClick={submit}>
          Zapisz mnożniki
        </Button>
      )}
    </div>
  );
}

/** How much more material each car size uses than a Medium one (owners edit). */
export default function SizeFactorsSettings({ canEdit }: { canEdit: boolean }) {
  const { data, isLoading } = useSizeFactors();
  return (
    <FormSection icon={Scaling} title="Zużycie materiałów wg wielkości auta">
      {isLoading || !data ? (
        <div className="p-5">
          <Skeleton width="100%" height="64px" className="rounded-xl" />
        </div>
      ) : (
        <Form factors={data} canEdit={canEdit} />
      )}
    </FormSection>
  );
}
