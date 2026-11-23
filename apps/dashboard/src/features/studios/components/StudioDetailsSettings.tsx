import { lazy, Suspense } from 'react';
import { Controller, useForm, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, MapPinOff, Save } from 'lucide-react';
import { Button, FormInput, FormSection, LoadingSpinner, Skeleton, useToast } from '@detaileed/ui';
import { MAP_STYLE_URL } from '@/shared/lib/siteConfig';
import { isOwnerRole } from '@/shared/lib/studioRole';
import { useStudio } from '@/features/studios/model/StudioContext';
import { useSaveStudioDetails, useStudioDetails } from '@/features/studios/api/studios';
import {
  studioDetailsFormDefaults,
  studioDetailsSchema,
  toStudioDetailsInput,
  type StudioDetails,
  type StudioDetailsFormInput,
  type StudioDetailsFormValues,
} from '@/features/studios/model/studioDetailsForm';

// MapLibre is large; load it only when this form is shown.
const MapPicker = lazy(() => import('@detaileed/ui/map').then((m) => ({ default: m.MapPicker })));

/**
 * The studio's name, contact details, address and pin. They are the studio's one set of details: the public
 * profile customers see copies them. Owners edit; other members see them read-only.
 */
export function StudioDetailsSettings() {
  const { selectedStudio } = useStudio();
  const { data: details, isLoading } = useStudioDetails();

  if (isLoading || !details) return <LoadingSpinner />;

  // A fresh form per studio, so switching studios doesn't keep the previous one's values.
  return <StudioDetailsForm key={details.studioId} details={details} readOnly={!isOwnerRole(selectedStudio?.role)} />;
}

function StudioDetailsForm({ details, readOnly }: { details: StudioDetails; readOnly: boolean }) {
  const { addToast } = useToast();
  const save = useSaveStudioDetails();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<StudioDetailsFormInput, unknown, StudioDetailsFormValues>({
    resolver: zodResolver(studioDetailsSchema),
    defaultValues: studioDetailsFormDefaults(details),
  });

  const onSubmit = (values: StudioDetailsFormValues) =>
    save.mutate(toStudioDetailsInput(values), {
      onSuccess: () => {
        reset(values);
        addToast('Zapisano dane studia.', 'success');
      },
    });

  return (
    <FormSection icon={Building2} title="Dane studia">
      <form className="flex flex-col gap-4 p-5" onSubmit={handleSubmit(onSubmit)}>
        <p className="text-sm text-muted-foreground">
          Te dane widzą też klienci w profilu publicznym studia, więc zmieniasz je tylko tutaj.
        </p>
        <fieldset disabled={readOnly} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormInput label="Nazwa studia" error={errors.name?.message} {...register('name')} />
          <FormInput label="Telefon" placeholder="500 600 700" error={errors.phone?.message} {...register('phone')} />
          <FormInput
            label="E-mail"
            type="email"
            placeholder="kontakt@studio.pl"
            error={errors.email?.message}
            {...register('email')}
          />
          <FormInput label="Adres" placeholder="ul. Długa 1" error={errors.address?.message} {...register('address')} />
          <FormInput label="Miasto" placeholder="Kraków" error={errors.city?.message} {...register('city')} />
        </fieldset>

        <StudioLocationField control={control} readOnly={readOnly} />

        {!readOnly && (
          <div className="flex justify-end">
            <Button type="submit" icon={Save} loading={save.isPending} disabled={!isDirty}>
              Zapisz dane studia
            </Button>
          </div>
        )}
      </form>
    </FormSection>
  );
}

/** The pin on the map, with a button that clears it. */
function StudioLocationField({
  control,
  readOnly,
}: {
  control: Control<StudioDetailsFormInput, unknown, StudioDetailsFormValues>;
  readOnly: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <p className="text-sm font-medium text-foreground">Lokalizacja</p>
        {!readOnly && <p className="text-xs text-faint">Kliknij mapę lub przeciągnij pinezkę</p>}
      </div>
      <Controller
        name="location"
        control={control}
        render={({ field }) => (
          <>
            <Suspense fallback={<Skeleton width="100%" height="320px" className="rounded-lg" />}>
              <MapPicker value={field.value} onChange={field.onChange} readOnly={readOnly} styleUrl={MAP_STYLE_URL} />
            </Suspense>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Bez adresu, miasta i pinezki nie opublikujesz profilu na mapie.
              </p>
              {!readOnly && field.value && (
                <Button variant="ghost" size="sm" icon={MapPinOff} onClick={() => field.onChange(null)}>
                  Usuń pinezkę
                </Button>
              )}
            </div>
          </>
        )}
      />
    </div>
  );
}
