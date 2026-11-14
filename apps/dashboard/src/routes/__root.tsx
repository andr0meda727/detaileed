import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import type { RouterContext } from '@/app/router';
import { RouterDevtools } from '@/app/RouterDevtools';

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <Outlet />
      <RouterDevtools />
    </>
  );
}
