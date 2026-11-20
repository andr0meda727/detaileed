import { createFileRoute } from '@tanstack/react-router';
import { TasksView } from '@/features/bookings';

export const Route = createFileRoute('/_signed-in/s/$studioId/tasks')({
  component: TasksView,
});
