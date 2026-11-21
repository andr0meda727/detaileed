import { createFileRoute } from '@tanstack/react-router';
import { Dashboard } from '@/features/dashboard-home';

export const Route = createFileRoute('/_signed-in/s/$studioId/')({
  component: Dashboard,
});
