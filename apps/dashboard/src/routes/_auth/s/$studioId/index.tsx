import { createFileRoute } from '@tanstack/react-router';
import { Dashboard } from '@/features/dashboard-home';

export const Route = createFileRoute('/_auth/s/$studioId/')({
  component: Dashboard,
});
