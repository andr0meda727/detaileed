import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Button, Card, CardContent, CardFooter, CardHeader, Textarea, useToast } from '@detaileed/ui';
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
    <Card>
      <CardHeader title="Profil publiczny" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-1 rounded-md border border-border bg-subtle p-4 text-sm">
            <p className="text-xs text-faint">Dane widoczne dla klientów</p>
            <p className="font-medium text-foreground">{listing?.name ?? studioName}</p>
            {listing && (
              <>
                <p className="text-muted-foreground">{address ?? 'Brak adresu'}</p>
                <p className="font-mono text-muted-foreground tabular-nums">{listing.phone ?? 'Brak telefonu'}</p>
                <p className="text-muted-foreground">
                  {listing.latitude !== null ? 'Pinezka na mapie ustawiona' : 'Brak pinezki na mapie'}
                </p>
              </>
            )}
            <button
              type="button"
              onClick={onOpenStudio}
              className="mt-1 self-start rounded-sm text-sm font-medium text-foreground underline underline-offset-4 transition-colors duration-150 hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Zmień w ustawieniach studia
            </button>
          </div>

          <fieldset disabled={readOnly}>
            <Textarea
              id="listing-description"
              label="Opis"
              rows={4}
              placeholder="Czym zajmuje się studio, co je wyróżnia…"
              error={errors.description?.message}
              {...register('description')}
            />
          </fieldset>
        </CardContent>

        {!readOnly && (
          <CardFooter>
            <Button type="submit" icon={Save} loading={save.isPending}>
              Zapisz profil
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}
