import { Skeleton } from '@detaileed/ui';

/** Placeholder in the shape of a `BookingCard` while bookings load. */
export function BookingCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:gap-5">
      <div className="flex shrink-0 gap-2 sm:w-24 sm:flex-col sm:gap-1.5">
        <Skeleton width="44px" height="16px" />
        <Skeleton width="72px" height="12px" />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton width="72px" height="20px" />
          <Skeleton width="120px" height="16px" />
        </div>
        <Skeleton width="45%" height="12px" />
      </div>
      <Skeleton width="84px" height="22px" className="rounded-full" />
    </div>
  );
}
