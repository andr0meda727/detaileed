
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import ClientsView from './views/ClientsView';
import InventoryView from './views/InventoryView';
import BookingsView from './views/BookingsView';
import ArchivedView from './views/ArchivedView';
import LoginView from './views/LoginView';
import { ViewType } from './types';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('supabase_token');
    if (token) setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [activeView]);

  const handleLogin = (email: string) => {
    localStorage.setItem('user', JSON.stringify({ email }));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('supabase_token');
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
