import { createFileRoute } from '@tanstack/react-router';
import ClientsView from '@/views/clients/ClientsView';

export const Route = createFileRoute('/_auth/s/$studioId/clients')({
  component: ClientsView,
});
