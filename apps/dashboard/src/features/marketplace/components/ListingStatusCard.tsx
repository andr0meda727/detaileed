import { Eye, EyeOff, ExternalLink, Globe, Star } from 'lucide-react';
import { Badge, Button, FormSection, useToast } from '@detaileed/ui';
import { publicStudioUrl } from '@/shared/lib/siteConfig';
import { usePublishListing, useUnpublishListing } from '@/features/marketplace/api/listing';
import type { Listing } from '@/features/marketplace/model/types';

interface ListingStatusCardProps {
  listing: Listing | null;
  isOwner: boolean;
  /** Opens the services tab (services are what customers see and book). */
  onOpenServices: () => void;
}

/** Whether customers can see the studio, its rating, and the publish switch for the owner. */
export function ListingStatusCard({ listing, isOwner, onOpenServices }: ListingStatusCardProps) {
  const { addToast } = useToast();
  const publish = usePublishListing();
  const unpublish = useUnpublishListing();
  const hasServices = (listing?.services.length ?? 0) > 0;

  return (
    <FormSection
      icon={Globe}
      title="Widoczność w Detaileed"
      actions={
        listing && (
          <Badge tone={listing.isPublished ? 'success' : 'neutral'} size="sm">
            {listing.isPublished ? 'Opublikowany' : 'Ukryty'}
          </Badge>
        )
      }
    >
      <div className="p-5 space-y-4">
        {!listing ? (
          <p className="text-sm text-slate-500">
            Klienci znajdą studio na mapie Detaileed, gdy zapiszesz profil poniżej i go opublikujesz.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-green-deep">
              <span className="flex items-center gap-1.5">
                <Star size={15} className="text-amber fill-amber" />
                {listing.averageRating === null
                  ? 'Brak opinii'
                  : `${listing.averageRating.toFixed(1).replace('.', ',')} (${listing.reviewCount} opinii)`}
              </span>
              <span>Usługi widoczne dla klientów: {listing.services.length}</span>
            </div>
            {!hasServices && (
              <p className="text-sm text-amber-700 bg-amber/10 rounded-xl p-3">
                Studio nie ma jeszcze usług, więc nie można go opublikować.{' '}
                <button type="button" onClick={onOpenServices} className="font-bold underline">
                  Dodaj usługi
                </button>
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {isOwner &&
                (listing.isPublished ? (
                  <Button
                    variant="secondary"
                    icon={EyeOff}
                    loading={unpublish.isPending}
                    onClick={() =>
                      unpublish.mutate(undefined, { onSuccess: () => addToast('Studio ukryte na mapie.', 'success') })
                    }
                  >
                    Ukryj
                  </Button>
                ) : (
                  <Button
                    icon={Eye}
                    loading={publish.isPending}
                    disabled={!hasServices}
                    onClick={() =>
                      publish.mutate(undefined, {
                        onSuccess: () => addToast('Studio jest widoczne dla klientów.', 'success'),
                      })
                    }
                  >
                    Opublikuj
                  </Button>
                ))}
              {listing.isPublished && (
                <a
                  href={publicStudioUrl(listing.studioId)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest text-green-deep hover:bg-slate-50"
                >
                  <ExternalLink size={15} /> Zobacz stronę
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </FormSection>
  );
}
