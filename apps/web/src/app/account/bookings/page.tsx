import { Suspense } from 'react';
import MyRequestsView from '@/features/account/components/MyRequestsView';

export default function MyRequestsPage() {
  return (
    // useSearchParams (the "sent" notice) needs a Suspense boundary.
    <Suspense>
      <MyRequestsView />
    </Suspense>
  );
}
