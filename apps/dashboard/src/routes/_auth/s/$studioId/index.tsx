import { createFileRoute, useNavigate } from '@tanstack/react-router';
import Dashboard from '@/views/dashboard/Dashboard';

export const Route = createFileRoute('/_auth/s/$studioId/')({
  component: DashboardPage,
});

function DashboardPage() {
  const { studioId } = Route.useParams();
  const navigate = useNavigate();
  return (
    <Dashboard
      onNavigate={(view) =>
        void navigate({
          to: view === 'Inventory' ? '/s/$studioId/inventory' : '/s/$studioId/tasks',
          params: { studioId },
        })
      }
    />
  );
}
