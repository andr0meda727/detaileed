import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { getSession } from '@/app/auth';
import { studiosQueryKey } from '@/features/studios';
import { AcceptInvitationView } from '@/features/auth';

export const Route = createFileRoute('/(auth)/accept-invitation')({
  validateSearch: z.object({ token: z.string().catch('') }),
  // Re-runs on every auth change (see app/App.tsx), so this follows sign-in from another tab too.
  beforeLoad: async () => ({ session: await getSession() }),
  component: AcceptInvitationPage,
});

function AcceptInvitationPage() {
  const { token } = Route.useSearch();
  const { session } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return (
    <AcceptInvitationView
      token={token}
      isSignedIn={Boolean(session)}
      onSuccess={async () => {
        // The user just joined a studio, so the cached list is out of date.
        await queryClient.invalidateQueries({ queryKey: studiosQueryKey });
        await navigate({ to: '/', replace: true });
      }}
      onRequireLogin={() =>
        void navigate({ to: '/login', search: { redirect: `/accept-invitation?token=${encodeURIComponent(token)}` } })
      }
    />
  );
}
