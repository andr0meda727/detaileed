import { createFileRoute, redirect } from '@tanstack/react-router';
import { getLastStudioId } from '@/features/studios/model/activeStudio';

/** `/` reopens the last studio, or asks the user to pick one. */
export const Route = createFileRoute('/_auth/')({
  beforeLoad: () => {
    const studioId = getLastStudioId();
    throw studioId ? redirect({ to: '/s/$studioId', params: { studioId } }) : redirect({ to: '/studios' });
  },
});
