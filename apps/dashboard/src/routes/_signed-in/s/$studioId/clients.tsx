import { createFileRoute } from '@tanstack/react-router';
import { ClientsView } from '@/features/clients';

export const Route = createFileRoute('/_signed-in/s/$studioId/clients')({
  component: ClientsView,
});
