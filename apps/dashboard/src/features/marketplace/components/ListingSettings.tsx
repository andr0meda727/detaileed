import { LoadingSpinner } from '@detaileed/ui';
import { useStudio } from '@/features/studios';
import { isOwnerRole } from '@/shared/lib/studioRole';
import { useListing } from '@/features/marketplace/api/listing';
import ListingStatusCard from '@/features/marketplace/components/ListingStatusCard';
import ListingForm from '@/features/marketplace/components/ListingForm';

interface ListingSettingsProps {
  onOpenServices: () => void;
}

/** Studio settings tab: the studio's public profile on the customer map and whether it is published. */
export default function ListingSettings({ onOpenServices }: ListingSettingsProps) {
  const { selectedStudio } = useStudio();
  const { data: listing, isLoading } = useListing();
  const isOwner = isOwnerRole(selectedStudio?.role);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <ListingStatusCard listing={listing ?? null} isOwner={isOwner} onOpenServices={onOpenServices} />
      <ListingForm
        // A fresh form once the first save creates the listing.
        key={listing ? 'saved' : 'new'}
        listing={listing ?? null}
        studio={{ name: selectedStudio?.name ?? '', address: selectedStudio?.address }}
        readOnly={!isOwner}
      />
    </div>
  );
}
