import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { getSession, needsPasswordSetup } from '@/app/auth';

/** Pathless layout for everything that needs a signed-in user. */
export const Route = createFileRoute('/_signed-in')({
  beforeLoad: async ({ location }) => {
    const session = await getSession();
    if (!session) throw redirect({ to: '/login', search: { redirect: location.href } });
    if (needsPasswordSetup(session)) throw redirect({ to: '/set-password' });
    return { session };
  },
  component: Outlet,
});
