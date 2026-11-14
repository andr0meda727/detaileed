import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { clearPasswordSetup, getSession } from '@/app/auth';
import supabase from '@/shared/lib/supabase';
import SetPasswordView from '@/views/auth/SetPasswordView';

export const Route = createFileRoute('/set-password')({
  beforeLoad: async () => {
    if (!(await getSession())) throw redirect({ to: '/login' });
  },
  component: SetPasswordPage,
});

function SetPasswordPage() {
  const navigate = useNavigate();
  return (
    <SetPasswordView
      onSuccess={async () => {
        clearPasswordSetup();
        await supabase.auth.refreshSession();
        await navigate({ href: '/', replace: true });
      }}
    />
  );
}
