import { createFileRoute, redirect } from '@tanstack/react-router';
import { isEmployeeRole } from '@/shared/lib/studioRole';
import { TeamView } from '@/features/team';

export const Route = createFileRoute('/_signed-in/s/$studioId/team')({
  // Employees don't manage the team; the sidebar hides the link and this guards a typed URL.
  beforeLoad: ({ context, params }) => {
    if (isEmployeeRole(context.studio.role)) {
      throw redirect({ to: '/s/$studioId', params: { studioId: params.studioId } });
    }
  },
  component: TeamView,
});
