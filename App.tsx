import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import ClientsView from './views/ClientsView';
import InventoryView from './views/InventoryView';
import BookingsView from './views/BookingsView';
import ArchivedView from './views/ArchivedView';
import LoginView from './views/LoginView';
import SetPasswordView from './views/SetPasswordView';
import { ViewType } from './types';
import supabase from './utils/supabase';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  useEffect(() => {
    // Check for invite/recovery links in URL hash
    const hash = window.location.hash;
    if (hash && (hash.includes('type=invite') || hash.includes('type=recovery'))) {
      setIsSettingPassword(true);
      setIsLoading(false);
      return;
    }

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setIsLoading(false);
    });

    // Listen for auth state changes (handles token refresh automatically)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [activeView]);

  const handleLogin = (_email: string) => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
  };

  const onOpenMenu = () => setIsSidebarOpen(true);

  const renderView = () => {
    const commonProps = { onOpenMenu };
    switch (activeView) {
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

  if (isSettingPassword) {
    return (
      <SetPasswordView
        onSuccess={() => {
          setIsSettingPassword(false);
          setIsLoggedIn(true);
          window.history.replaceState(null, '', window.location.pathname);
        }}
      />
    );
  }

  if (!isLoggedIn) return <LoginView onLogin={handleLogin} />;

  return (
    <div className="min-h-screen flex bg-[#FDF8F0] selection:bg-[#F7E7CE]/30 selection:text-[#102C26]">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className={`flex-1 transition-all duration-300 ${isLoggedIn ? 'lg:ml-80' : ''} p-4 sm:p-8 lg:p-12 overflow-y-auto`}>
        <div className="max-w-7xl mx-auto pb-24 pt-2 lg:pt-0">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;