import { Link, Outlet, createRootRouteWithContext, useRouter, type ErrorComponentProps } from '@tanstack/react-router';
import type { RouterContext } from '@/app/router';
import { RouterDevtools } from '@/app/RouterDevtools';
import { getApiErrorMessage } from '@/utils/errorHandler';

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
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="w-12 h-12 border-4 border-green-deep border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function CenteredMessage({ title, text, action }: { title: string; text: string; action: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-cream p-6 text-center">
      <h1 className="text-3xl font-serif text-green-deep">{title}</h1>
      <p className="text-slate-500 max-w-md">{text}</p>
      {action}
    </div>
  );
}

const BUTTON_CLASS = 'px-5 py-2.5 bg-green-deep text-cream-warm rounded-xl text-sm font-bold';

function NotFound() {
  return (
    <CenteredMessage
      title="Nie znaleziono strony"
      text="Ten adres nie istnieje."
      action={
        <Link to="/" className={BUTTON_CLASS}>
          Wróć do panelu
        </Link>
      }
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
        <button
          onClick={() => {
            reset();
            void router.invalidate();
          }}
          className={BUTTON_CLASS}
        >
          Spróbuj ponownie
        </button>
      }
    />
  );
}
