import { createFileRoute } from '@tanstack/react-router';
import ReportsView from '@/views/reports/ReportsView';

export const Route = createFileRoute('/_auth/s/$studioId/reports')({
  component: ReportsView,
});
