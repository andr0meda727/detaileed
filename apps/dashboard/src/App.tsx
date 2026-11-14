import React, { useState, useEffect } from 'react';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { User } from '@supabase/supabase-js';

import Sidebar from './components/Sidebar';
import Dashboard from './views/dashboard/Dashboard';
import ClientsView from './views/clients/ClientsView';
import InventoryView from './views/inventory/InventoryView';
import ReportsView from './views/reports/ReportsView';
import LoginView from './views/auth/LoginView';
import SetPasswordView from './views/auth/SetPasswordView';
import AcceptInvitationView from './views/auth/AcceptInvitationView';
import StudioSelectView from './views/settings/StudioSelectView';
import StudioSettingsView from './views/settings/StudioSettingsView';
import UserSettingsView from './views/settings/UserSettingsView';
import TasksView from './views/tasks/TasksView';
import TeamView from './views/team/TeamView';

import { ViewType, StudioDto } from './types';
import supabase from './utils/supabase';
import { StudioProvider, useStudio } from './contexts/StudioContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { createQueryClient } from './shared/queryClient';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './app/router';
import { subscribeToAuthChanges } from './app/auth';

export const LegacyApp: React.FC = () => {
  const queryClient = useQueryClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Pobieramy synchronicznie przed ucięciem go przez auth object
  const [isSettingPassword, setIsSettingPassword] = useState(() => {
    const hash = window.location.hash;
    return Boolean(
      hash && (hash.includes('type=invite') || hash.includes('type=recovery') || hash.includes('type=signup')),
    );
  });

  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [forceLogin, setForceLogin] = useState(false);

  const { selectedStudio, setSelectedStudio, clearSelectedStudio } = useStudio();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (window.location.pathname === '/accept-invitation' && token) {
      setInvitationToken(token);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setCurrentUser(session?.user || null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      setCurrentUser(session?.user || null);
      if (event === 'PASSWORD_RECOVERY') setIsSettingPassword(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [activeView]);

  const handleLogin = (_email: string) => setIsLoggedIn(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();

    // Clear selected studio
    if (clearSelectedStudio) {
      clearSelectedStudio();
    } else {
      setSelectedStudio(null);
    }

    // Remove data left behind by the old localStorage API cache.
    Object.keys(localStorage)
      .filter((key) => key.startsWith('df_api_cache_'))
      .forEach((key) => localStorage.removeItem(key));

    queryClient.clear(); // Clear react-query cache

    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const onOpenMenu = () => setIsSidebarOpen(true);

  const handleStudioSelect = (studio: StudioDto) => {
    setSelectedStudio(studio);
    setActiveView('Dashboard');
  };

  const isFullscreenView = activeView === 'Studios';

  const renderView = () => {
    const commonProps = { onOpenMenu };
    switch (activeView) {
      case 'Studios':
        return <StudioSelectView onSelect={handleStudioSelect} onOpenMenu={onOpenMenu} />;
      case 'StudioSettings':
        return <StudioSettingsView {...commonProps} />;
      case 'UserSettings':
        return <UserSettingsView {...commonProps} />;
      case 'Dashboard':
        return <Dashboard onNavigate={setActiveView} {...commonProps} />;
      case 'Clients':
        return <ClientsView {...commonProps} />;
      case 'Inventory':
        return <InventoryView {...commonProps} />;
      case 'Tasks':
        return <TasksView {...commonProps} />;
      case 'Team':
        return <TeamView {...commonProps} />;
      case 'Reports':
        return <ReportsView {...commonProps} />;
      default:
        return <Dashboard onNavigate={setActiveView} {...commonProps} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-12 h-12 border-4 border-green-deep border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const needsPassword = currentUser?.user_metadata?.needs_password === true;

  if (isSettingPassword || needsPassword) {
    return (
      <SetPasswordView
        onSuccess={async () => {
          setIsSettingPassword(false);
          setIsLoggedIn(true);
          await supabase.auth.refreshSession();
          window.history.replaceState(null, '', window.location.pathname);
        }}
      />
    );
  }

  if (forceLogin && !isLoggedIn) {
    return (
      <div className="relative">
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={() => setForceLogin(false)}
            className="px-5 py-2 bg-white text-slate-500 rounded-xl shadow-sm text-xs font-bold uppercase tracking-widest hover:text-green-deep transition-all"
          >
            Powrót do zaproszenia
          </button>
        </div>
        <LoginView onLogin={handleLogin} />
      </div>
    );
  }

  if (invitationToken) {
    return (
      <AcceptInvitationView
        token={invitationToken}
        onSuccess={() => {
          setInvitationToken(null);
          setForceLogin(false);
          window.history.replaceState(null, '', '/');
        }}
        onRequireLogin={() => setForceLogin(true)}
      />
    );
  }

  if (!isLoggedIn) return <LoginView onLogin={handleLogin} />;

  if (!selectedStudio && activeView !== 'Studios') {
    return <StudioSelectView onSelect={handleStudioSelect} onOpenMenu={onOpenMenu} />;
  }

  return (
    <div className="min-h-screen flex bg-cream selection:bg-amber-light/30 selection:text-green-deep">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userEmail={currentUser?.email ?? null}
      />

      <main
        className={`flex-1 transition-all duration-300 lg:ml-72 ${isFullscreenView ? '' : 'p-4 sm:p-8 lg:p-12'} overflow-y-auto`}
      >
        <div className={isFullscreenView ? '' : 'max-w-7xl mx-auto pb-24 pt-2 lg:pt-0'}>{renderView()}</div>
      </main>
    </div>
  );
};

const AppRouter: React.FC = () => {
  const queryClient = useQueryClient();
  // Route guards read the session in beforeLoad; re-run them whenever it changes.
  useEffect(() => subscribeToAuthChanges(() => void router.invalidate()), []);
  return <RouterProvider router={router} context={{ queryClient }} />;
};

const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  const [queryClient] = useState(() => createQueryClient((message) => addToast(message, 'error')));
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

const App: React.FC = () => (
  <ToastProvider>
    <QueryProvider>
      <StudioProvider>
        <AppRouter />
      </StudioProvider>
    </QueryProvider>
  </ToastProvider>
);

export default App;
