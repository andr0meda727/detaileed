import { createFileRoute } from '@tanstack/react-router';
import ArchivedView from '@/features/bookings/components/ArchivedView';

export const Route = createFileRoute('/_auth/s/$studioId/archived')({
  component: ArchivedView,
});
