import { Skeleton } from '@detaileed/ui';

export default function StudioLoading() {
  return (
    <div className="mx-auto w-full max-w-[1160px] space-y-6 px-4 py-8 sm:px-6 sm:py-12" aria-busy="true">
      <Skeleton width="60%" height="48px" />
      <Skeleton width="40%" height="20px" />
      <Skeleton width="100%" height="320px" className="rounded-lg" />
    </div>
  );
}
