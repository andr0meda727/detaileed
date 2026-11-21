import { lazy, Suspense } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Save } from 'lucide-react';
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
      <form className="p-5 space-y-2" onSubmit={handleSubmit(onSubmit)}>
        <p className="text-sm text-slate-500 pb-2">
          Te dane widzą też klienci w profilu publicznym studia, więc zmieniasz je tylko tutaj.
        </p>
        <fieldset disabled={readOnly} className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <FormInput label="Nazwa studia" error={errors.name?.message} {...register('name')} />
            <FormInput label="Telefon" placeholder="500 600 700" error={errors.phone?.message} {...register('phone')} />
            <FormInput
              label="E-mail"
              type="email"
              placeholder="kontakt@studio.pl"
              error={errors.email?.message}
              {...register('email')}
            />
            <FormInput
              label="Adres"
              placeholder="ul. Długa 1"
              error={errors.address?.message}
              {...register('address')}
            />
            <FormInput label="Miasto" placeholder="Kraków" error={errors.city?.message} {...register('city')} />
          </div>
        </fieldset>

        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
            Lokalizacja {readOnly ? '' : '(kliknij mapę lub przeciągnij pinezkę)'}
          </p>
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <>
                <Suspense fallback={<Skeleton width="100%" height="320px" className="rounded-2xl" />}>
                  <MapPicker
                    value={field.value}
                    onChange={field.onChange}
                    readOnly={readOnly}
                    styleUrl={MAP_STYLE_URL}
                  />
                </Suspense>
                {!readOnly && field.value && (
                  <button
                    type="button"
                    onClick={() => field.onChange(null)}
                    className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500"
                  >
                    Usuń pinezkę
                  </button>
                )}
              </>
            )}
          />
          <p className="h-4 px-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Bez adresu, miasta i pinezki nie opublikujesz profilu na mapie.
          </p>
        </div>

        {!readOnly && (
          <Button size="lg" fullWidth type="submit" icon={Save} loading={save.isPending} disabled={!isDirty}>
            Zapisz dane studia
          </Button>
        )}
      </form>
    </FormSection>
  );
}
