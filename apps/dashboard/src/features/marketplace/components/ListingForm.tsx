import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Save } from 'lucide-react';
import { Button, FormSection, useToast } from '@detaileed/ui';
import { useSaveListing } from '@/features/marketplace/api/listing';
import { listingFormSchema, type ListingFormInput, type ListingFormValues } from '@/features/marketplace/model/schemas';
import { listingAddress, listingFormDefaults, toListingInput } from '@/features/marketplace/model/listingForm';
import type { Listing } from '@/features/marketplace/model/types';

interface ListingFormProps {
  listing: Listing | null;
  /** The studio's name, shown before the first save creates the profile. */
  studioName: string;
  /** Owners edit; other members see the profile read-only. */
  readOnly: boolean;
  /** Opens the studio settings, where the name, phone, address and pin are edited. */
  onOpenStudio: () => void;
}

/**
 * The public profile: the description the owner writes here, and the studio's name, phone, address and pin as
 * customers see them (copied from the studio settings).
 */
export function ListingForm({ listing, studioName, readOnly, onOpenStudio }: ListingFormProps) {
  const { addToast } = useToast();
  const save = useSaveListing();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ListingFormInput, unknown, ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: listingFormDefaults(listing),
  });

  const onSubmit = (values: ListingFormValues) =>
    save.mutate(toListingInput(values), {
      onSuccess: () =>
        addToast(listing ? 'Zapisano profil.' : 'Zapisano profil. Teraz możesz go opublikować.', 'success'),
    });

  const address = listing && listingAddress(listing);

  return (
    <FormSection icon={MapPin} title="Profil publiczny">
      <form className="p-5 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="rounded-xl bg-slate-50 p-4 space-y-1 text-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dane widoczne dla klientów</p>
          <p className="font-bold text-green-deep">{listing?.name ?? studioName}</p>
          {listing && (
            <>
              <p className="text-slate-500">{address ?? 'Brak adresu'}</p>
              <p className="text-slate-500">{listing.phone ?? 'Brak telefonu'}</p>
              <p className="text-slate-500">
                {listing.latitude !== null ? 'Pinezka na mapie ustawiona' : 'Brak pinezki na mapie'}
              </p>
            </>
          )}
          <button type="button" onClick={onOpenStudio} className="pt-1 text-xs font-bold text-green-deep underline">
            Zmień w ustawieniach studia
          </button>
        </div>

        <fieldset disabled={readOnly} className="flex flex-col gap-1.5">
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
        </fieldset>

        {!readOnly && (
          <Button size="lg" fullWidth type="submit" icon={Save} loading={save.isPending}>
            Zapisz profil
          </Button>
        )}
      </form>
    </FormSection>
  );
}
