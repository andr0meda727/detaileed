import { lazy, Suspense } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Save } from 'lucide-react';
import { Button, FormInput, FormSection, Skeleton, useToast } from '@detaileed/ui';
import { MAP_STYLE_URL } from '@/shared/lib/siteConfig';
import { useSaveListing } from '@/features/marketplace/api/listing';
import { listingFormSchema, type ListingFormInput, type ListingFormValues } from '@/features/marketplace/model/schemas';
import { listingFormDefaults, toListingInput } from '@/features/marketplace/model/listingForm';
import type { Listing } from '@/features/marketplace/model/types';

// MapLibre is large; load it only when this form is shown.
const MapPicker = lazy(() => import('@detaileed/ui/map').then((m) => ({ default: m.MapPicker })));

interface ListingFormProps {
  listing: Listing | null;
  studio: { name: string; address?: string | null };
  /** Owners edit; other members see the profile read-only. */
  readOnly: boolean;
}

/** The public profile: name, description, address, phone and the pin customers see on the map. */
export default function ListingForm({ listing, studio, readOnly }: ListingFormProps) {
  const { addToast } = useToast();
  const save = useSaveListing();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ListingFormInput, unknown, ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: listingFormDefaults(listing, studio),
  });

  const onSubmit = (values: ListingFormValues) =>
    save.mutate(toListingInput(values), {
      onSuccess: () =>
        addToast(listing ? 'Zapisano profil.' : 'Zapisano profil. Teraz możesz go opublikować.', 'success'),
    });

  return (
    <FormSection icon={MapPin} title="Profil publiczny">
      <form className="p-5 space-y-2" onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={readOnly} className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <FormInput label="Nazwa na mapie" error={errors.name?.message} {...register('name')} />
            <FormInput
              label="Telefon dla klientów"
              placeholder="500 600 700"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <FormInput
              label="Adres"
              placeholder="ul. Długa 1"
              error={errors.address?.message}
              {...register('address')}
            />
            <FormInput label="Miasto" placeholder="Kraków" error={errors.city?.message} {...register('city')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="listing-description"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1"
            >
              Opis
            </label>
            <textarea
              id="listing-description"
              rows={4}
              placeholder="Czym zajmuje się studio, co je wyróżnia…"
              className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-hidden font-semibold text-sm focus:border-cream-warm/50"
              {...register('description')}
            />
            <p className="h-4 px-1 text-[10px] font-bold text-red-500 uppercase tracking-widest">
              {errors.description?.message}
            </p>
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
              <Suspense fallback={<Skeleton width="100%" height="320px" className="rounded-2xl" />}>
                <MapPicker value={field.value} onChange={field.onChange} readOnly={readOnly} styleUrl={MAP_STYLE_URL} />
              </Suspense>
            )}
          />
          <p className="h-4 px-1 text-[10px] font-bold text-red-500 uppercase tracking-widest">
            {errors.location?.message}
          </p>
        </div>

        {!readOnly && (
          <Button size="lg" fullWidth type="submit" icon={Save} loading={save.isPending}>
            Zapisz profil
          </Button>
        )}
      </form>
    </FormSection>
  );
}
