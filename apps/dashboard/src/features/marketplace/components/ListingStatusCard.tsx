import { Eye, EyeOff, ExternalLink, Star } from 'lucide-react';
import { Alert, Badge, Button, Card, CardContent, CardHeader, useToast } from '@detaileed/ui';
import { publicStudioUrl } from '@/shared/lib/siteConfig';
import { usePublishListing, useUnpublishListing } from '@/features/marketplace/api/listing';
import type { Listing } from '@/features/marketplace/model/types';

interface ListingStatusCardProps {
  listing: Listing | null;
  isOwner: boolean;
  /** Opens the services tab (services are what customers see and book). */
  onOpenServices: () => void;
  /** Opens the studio tab, where the address and pin are set. */
  onOpenStudio: () => void;
}

/** Whether customers can see the studio, its rating, and the publish switch for the owner. */
export function ListingStatusCard({ listing, isOwner, onOpenServices, onOpenStudio }: ListingStatusCardProps) {
  const { addToast } = useToast();
  const publish = usePublishListing();
  const unpublish = useUnpublishListing();
  const hasServices = (listing?.services.length ?? 0) > 0;
  const hasDetails = listing?.hasCompleteDetails ?? false;

  return (
    <Card>
      <CardHeader
        title="Widoczność w Detaileed"
        actions={
          listing && (
            <Badge tone={listing.isPublished ? 'success' : 'neutral'}>
              {listing.isPublished ? 'Opublikowany' : 'Ukryty'}
            </Badge>
          )
        }
      />
      <CardContent className="flex flex-col gap-4">
        {!listing ? (
          <p className="text-sm text-muted-foreground">
            Klienci znajdą studio na mapie Detaileed, gdy zapiszesz profil poniżej i go opublikujesz.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground">
              <span className="flex items-center gap-1.5">
                <Star size={16} strokeWidth={1.75} className="fill-star text-star" aria-hidden />
                {listing.averageRating === null
                  ? 'Brak opinii'
                  : `${listing.averageRating.toFixed(1).replace('.', ',')} (${listing.reviewCount} opinii)`}
              </span>
              <span className="text-muted-foreground">
                Usługi widoczne dla klientów:{' '}
                <span className="font-mono text-foreground tabular-nums">{listing.services.length}</span>
              </span>
            </div>
            {!hasServices && (
              <Alert
                tone="warning"
                action={
                  <Button size="sm" variant="secondary" onClick={onOpenServices}>
                    Dodaj usługi
                  </Button>
                }
              >
                Studio nie ma jeszcze usług, więc nie można go opublikować.
              </Alert>
            )}
            {!hasDetails && (
              <Alert
                tone="warning"
                action={
                  <Button size="sm" variant="secondary" onClick={onOpenStudio}>
                    Uzupełnij dane studia
                  </Button>
                }
              >
                Studio nie ma jeszcze adresu, miasta lub pinezki na mapie, więc klienci by go nie znaleźli.
              </Alert>
            )}
            <div className="flex flex-wrap gap-2">
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
                    disabled={!hasServices || !hasDetails}
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
                <Button asChild variant="ghost" icon={ExternalLink}>
                  <a href={publicStudioUrl(listing.studioId)} target="_blank" rel="noreferrer">
                    Zobacz stronę
                  </a>
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
