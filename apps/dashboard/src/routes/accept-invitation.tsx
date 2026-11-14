import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import AcceptInvitationView from '@/views/auth/AcceptInvitationView';

export const Route = createFileRoute('/accept-invitation')({
  validateSearch: z.object({ token: z.string().catch('') }),
  component: AcceptInvitationPage,
});

function AcceptInvitationPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  return (
    <AcceptInvitationView
      token={token}
      onSuccess={() => void navigate({ href: '/', replace: true })}
      onRequireLogin={() =>
        void navigate({ to: '/login', search: { redirect: `/accept-invitation?token=${encodeURIComponent(token)}` } })
      }
    />
  );
}
