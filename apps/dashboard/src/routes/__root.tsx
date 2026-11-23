import type { ReactNode } from 'react';
import {
  Outlet,
  createRootRouteWithContext,
  useNavigate,
  useRouter,
  type ErrorComponentProps,
} from '@tanstack/react-router';
import { RotateCw } from 'lucide-react';
import { Button, LoadingSpinner, Logo } from '@detaileed/ui';
import type { RouterContext } from '@/app/router';
import { RouterDevtools } from '@/app/RouterDevtools';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  pendingComponent: FullPageSpinner,
  notFoundComponent: NotFound,
  errorComponent: RouteError,
});

function RootLayout() {
  return (
    <>
      <Outlet />
      <RouterDevtools />
    </>
  );
}

function FullPageSpinner() {
  return <LoadingSpinner fullPage size={24} />;
}

function CenteredMessage({ title, text, action }: { title: string; text: string; action: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 text-center text-foreground">
      <Logo size={28} />
      <div className="flex max-w-md flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
      {action}
    </main>
  );
}

function NotFound() {
  const navigate = useNavigate();
  return (
    <CenteredMessage
      title="Nie znaleziono strony"
      text="Ten adres nie istnieje."
      action={<Button onClick={() => void navigate({ to: '/' })}>Wróć do panelu</Button>}
    />
  );
}

function RouteError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <CenteredMessage
      title="Coś poszło nie tak"
      text={getApiErrorMessage(error)}
      action={
        <Button
          icon={RotateCw}
          onClick={() => {
            reset();
            void router.invalidate();
          }}
        >
          Spróbuj ponownie
        </Button>
      }
    />
  );
}
