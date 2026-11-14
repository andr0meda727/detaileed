import { createFileRoute } from '@tanstack/react-router';
import ClientsView from '@/features/clients/components/ClientsView';

export const Route = createFileRoute('/_auth/s/$studioId/clients')({
  component: ClientsView,
});
