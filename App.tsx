import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { User } from '@supabase/supabase-js';

import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import ClientsView from './views/ClientsView';
import InventoryView from './views/InventoryView';
import BookingsView from './views/BookingsView';
import ArchivedView from './views/ArchivedView';
import LoginView from './views/LoginView';
import SetPasswordView from './views/SetPasswordView';
import AcceptInvitationView from './views/AcceptInvitationView';
import StudioSelectView from './views/StudioSelectView';
import StudioSettingsView from './views/StudioSettingsView';
import UserSettingsView from './views/UserSettingsView';

import { ViewType, StudioDto } from './types';
import supabase from './utils/supabase';
import { StudioProvider, useStudio } from './contexts/StudioContext';

const AppInner: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [invitationToken, setInvitationToken] = useState<string | null>(null);

  const { selectedStudio, setSelectedStudio } = useStudio();

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
      const hash = window.location.hash;
      if (hash && (hash.includes('type=invite') || hash.includes('type=recovery'))) {
        setIsSettingPassword(true);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      setCurrentUser(session?.user || null);
      if (event === 'PASSWORD_RECOVERY') setIsSettingPassword(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { setIsSidebarOpen(false); }, [activeView]);

  const handleLogin = (_email: string) => setIsLoggedIn(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
      case 'Studios': return <StudioSelectView onSelect={handleStudioSelect} onOpenMenu={onOpenMenu} />;
      case 'StudioSettings': return <StudioSettingsView {...commonProps} />;
      case 'UserSettings': return <UserSettingsView {...commonProps} />;
      case 'Dashboard': return <Dashboard onNavigate={setActiveView} {...commonProps} />;
      case 'Clients': return <ClientsView {...commonProps} />;
      case 'Inventory': return <InventoryView {...commonProps} />;
      case 'Tasks': return <BookingsView {...commonProps} />;
      case 'Archived': return <ArchivedView {...commonProps} />;
      default: return <Dashboard onNavigate={setActiveView} {...commonProps} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F0]">
        <div className="w-12 h-12 border-4 border-[#102C26] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const needsPassword = currentUser?.user_metadata?.needs_password === true;

  if (isSettingPassword || needsPassword) {
    return (
      <SetPasswordView onSuccess={async () => {
        setIsSettingPassword(false);
        setIsLoggedIn(true);
        await supabase.auth.refreshSession();
        window.history.replaceState(null, '', window.location.pathname);
      }} />
    );
  }

  if (invitationToken) {
    return (
      <AcceptInvitationView
        token={invitationToken}
        onSuccess={() => { setInvitationToken(null); window.history.replaceState(null, '', '/'); }}
      />
    );
  }

  if (!isLoggedIn) return <LoginView onLogin={handleLogin} />;

  if (!selectedStudio && activeView !== 'Studios') {
    return <StudioSelectView onSelect={handleStudioSelect} onOpenMenu={onOpenMenu} />;
  }

  return (
    <div className="min-h-screen flex bg-[#FDF8F0] selection:bg-[#F7E7CE]/30 selection:text-[#102C26]">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userEmail={currentUser?.email ?? null}
      />

      <main className={`flex-1 transition-all duration-300 lg:ml-72 ${isFullscreenView ? '' : 'p-4 sm:p-8 lg:p-12'} overflow-y-auto`}>

        <div className={isFullscreenView ? '' : 'max-w-7xl mx-auto pb-24 pt-2 lg:pt-0'}>
          {renderView()}
        </div>
      </main>
    </div>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <StudioProvider>
      <AppInner />
    </StudioProvider>
  </QueryClientProvider>
);


export default App;