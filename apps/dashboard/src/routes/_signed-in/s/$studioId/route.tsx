import { useState } from 'react';
import { Outlet, createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { activateStudio, forgetActiveStudio, StudioScope, studiosQueryOptions } from '@/features/studios';
import { TopBar } from '@/app/layout/TopBar';
import { Sidebar } from '@/app/layout/Sidebar';
import { supabase } from '@/shared/lib/supabase';
import type { Studio } from '@/features/studios';

/** Layout of every screen inside a studio. The studio comes from the URL. */
export const Route = createFileRoute('/_signed-in/s/$studioId')({
  beforeLoad: async ({ context, params }) => {
    const find = (studios: Studio[]) => studios.find((s) => s.studioId === params.studioId);
    // A studio created or joined a moment ago may be missing from the cached list, so refetch once.
    const studio =
      find(await context.queryClient.ensureQueryData(studiosQueryOptions)) ??
      find(await context.queryClient.fetchQuery({ ...studiosQueryOptions, staleTime: 0 }));
    if (!studio) throw redirect({ to: '/studios' });
    activateStudio(studio, context.queryClient);
    return { studio };
  },
  component: StudioLayout,
});

function StudioLayout() {
  const { studio, session } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    forgetActiveStudio();
    // Remove data left behind by the old localStorage API cache.
    Object.keys(localStorage)
      .filter((key) => key.startsWith('df_api_cache_'))
      .forEach((key) => localStorage.removeItem(key));
    queryClient.clear();
    await navigate({ to: '/login' });
  };

  return (
    <StudioScope studio={studio}>
      <div className="min-h-screen bg-background text-foreground">
        <Sidebar
          studioId={studio.studioId}
          onLogout={handleLogout}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          userEmail={session.user.email ?? null}
        />
        <div className="min-w-0 lg:ml-60">
          <TopBar studioName={studio.name} onOpenMenu={() => setIsSidebarOpen(true)} />
          <main className="mx-auto w-full max-w-[1180px] p-4 pb-24 sm:p-7 sm:pb-24">
            <Outlet />
          </main>
        </div>
      </div>
    </StudioScope>
  );
}
