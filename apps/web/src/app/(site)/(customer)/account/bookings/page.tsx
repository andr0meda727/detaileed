import { Suspense } from 'react';
import { MyRequestsView } from '@/features/account';

export default function MyRequestsPage() {
  return (
    // useSearchParams (the "sent" notice) needs a Suspense boundary.
    <Suspense>
      <MyRequestsView />
    </Suspense>
  );
}
