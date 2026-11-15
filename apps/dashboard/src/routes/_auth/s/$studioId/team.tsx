import { createFileRoute, redirect } from '@tanstack/react-router';
import { isEmployeeRole } from '@/shared/lib/studioRole';
import TeamView from '@/features/team/components/TeamView';

export const Route = createFileRoute('/_auth/s/$studioId/team')({
  // Employees don't manage the team; the sidebar hides the link and this guards a typed URL.
  beforeLoad: ({ context, params }) => {
    if (isEmployeeRole(context.studio.role)) {
      throw redirect({ to: '/s/$studioId', params: { studioId: params.studioId } });
    }
  },
  component: TeamView,
});
