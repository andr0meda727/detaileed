import { createFileRoute } from '@tanstack/react-router';
import { ArchivedView } from '@/features/bookings';

export const Route = createFileRoute('/_signed-in/s/$studioId/archived')({
  component: ArchivedView,
});
