import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { STUDIOS_QUERY_KEY } from '@/features/studios/api/studios';
import AcceptInvitationView from '@/features/auth/components/AcceptInvitationView';

export const Route = createFileRoute('/accept-invitation')({
  validateSearch: z.object({ token: z.string().catch('') }),
  component: AcceptInvitationPage,
});

function AcceptInvitationPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return (
    <AcceptInvitationView
      token={token}
      onSuccess={async () => {
        // The user just joined a studio, so the cached list is out of date.
        await queryClient.invalidateQueries({ queryKey: [STUDIOS_QUERY_KEY] });
        await navigate({ to: '/', replace: true });
      }}
      onRequireLogin={() =>
        void navigate({ to: '/login', search: { redirect: `/accept-invitation?token=${encodeURIComponent(token)}` } })
      }
    />
  );
}
