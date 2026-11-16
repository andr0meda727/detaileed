import { Skeleton } from '@detaileed/ui';

export default function StudioLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6" aria-busy="true">
      <Skeleton width="60%" height="48px" />
      <Skeleton width="40%" height="20px" />
      <Skeleton width="100%" height="320px" className="rounded-2xl" />
    </div>
  );
}
