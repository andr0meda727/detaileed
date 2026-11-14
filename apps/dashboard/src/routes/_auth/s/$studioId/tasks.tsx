import { createFileRoute } from '@tanstack/react-router';
import TasksView from '@/features/bookings/components/TasksView';

export const Route = createFileRoute('/_auth/s/$studioId/tasks')({
  component: TasksView,
});
