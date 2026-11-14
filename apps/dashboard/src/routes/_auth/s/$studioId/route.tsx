import { useState } from 'react';
import { Outlet, createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { activateStudio, forgetActiveStudio } from '@/features/studios/model/activeStudio';
import { MobileMenuContext } from '@/app/mobileMenu';
import Sidebar from '@/app/layout/Sidebar';
import { StudioScope } from '@/features/studios/model/StudioContext';
import { studiosQueryOptions } from '@/features/studios/api/studios';
import supabase from '@/shared/lib/supabase';
import type { StudioDto } from '@/types';

/** Layout of every screen inside a studio. The studio comes from the URL. */
export const Route = createFileRoute('/_auth/s/$studioId')({
  beforeLoad: async ({ context, params }) => {
    const find = (studios: StudioDto[]) => studios.find((s) => s.studioId === params.studioId);
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
      <MobileMenuContext.Provider value={() => setIsSidebarOpen(true)}>
        <div className="min-h-screen flex bg-cream selection:bg-amber-light/30 selection:text-green-deep">
          <Sidebar
            studioId={studio.studioId}
            onLogout={handleLogout}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            userEmail={session.user.email ?? null}
          />
          <main className="flex-1 transition-all duration-300 lg:ml-72 p-4 sm:p-8 lg:p-12 overflow-y-auto">
            <div className="max-w-7xl mx-auto pb-24 pt-2 lg:pt-0">
              <Outlet />
            </div>
          </main>
        </div>
      </MobileMenuContext.Provider>
    </StudioScope>
  );
}
