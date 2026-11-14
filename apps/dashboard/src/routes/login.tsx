import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { z } from 'zod';
import { getSession, safeRedirect } from '@/app/auth';
import { LoginView } from '@/features/auth';

export const Route = createFileRoute('/login')({
  validateSearch: z.object({ redirect: z.string().optional() }),
  beforeLoad: async ({ search }) => {
    if (await getSession()) throw redirect({ href: safeRedirect(search.redirect) });
  },
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  // Re-running beforeLoad sends the now signed-in user on to `redirect`.
  return <LoginView onLogin={() => void router.invalidate()} />;
}
