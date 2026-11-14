import { createFileRoute } from '@tanstack/react-router';
import Dashboard from '@/views/dashboard/Dashboard';

export const Route = createFileRoute('/_auth/s/$studioId/')({
  component: Dashboard,
});
