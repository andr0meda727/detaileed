import { createFileRoute } from '@tanstack/react-router';
import ArchivedView from '@/views/archived/ArchivedView';

export const Route = createFileRoute('/_auth/s/$studioId/archived')({
  component: ArchivedView,
});
