import { createFileRoute } from '@tanstack/react-router';
import { ArchivedView } from '@/features/bookings';

export const Route = createFileRoute('/_auth/s/$studioId/archived')({
  component: ArchivedView,
});
