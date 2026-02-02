
import React from 'react';
import { 
  History, 
  Users, 
  Package, 
  LayoutDashboard, 
  CalendarClock,
  LogOut,
  Zap,
  X,
  Sparkles
} from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onLogout, isOpen, onClose }) => {
  const menuItems = [
    { id: 'Dashboard', icon: LayoutDashboard, label: 'Panel Główny' },
    { id: 'Tasks', icon: CalendarClock, label: 'Rezerwacje' },
    { id: 'Clients', icon: Users, label: 'Klienci (CRM)' },
    { id: 'Inventory', icon: Package, label: 'Magazyn' },
    { id: 'Archived', icon: History, label: 'Archiwum Zleceń' },
    { id: 'AI', icon: Sparkles, label: 'Ekspert AI' },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-80 bg-[#0a0c10] flex flex-col p-8 sm:p-10 border-r border-white/5 shadow-2xl transition-transform duration-500 ease-in-out
    lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {/* Overlay dla mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#0a0c10]/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300" 
          onClick={onClose}
        />
      )}

      <div className={sidebarClasses}>
        {/* Przycisk zamknięcia na mobile */}
        <button onClick={onClose} className="lg:hidden absolute top-8 right-8 text-white/20 hover:text-[#5dcbb6] transition-colors">
          <X size={24} strokeWidth={3} />
        </button>

        <div className="mb-16">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveView('Dashboard')}>
            <div className="w-12 h-12 bg-[#5dcbb6] rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(93,203,182,0.2)] transition-transform group-hover:rotate-12 duration-300">
              <Zap className="text-[#0a0c10]" size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-[1000] text-white tracking-tighter leading-none italic uppercase">DetailFlow</h1>
              <span className="text-[8px] font-black text-[#5dcbb6] uppercase tracking-[0.4em] mt-1 block">Studio OS</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ViewType)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group whitespace-nowrap ${
                activeView === item.id 
                  ? 'bg-white/10 text-[#5dcbb6] shadow-xl border border-white/5' 
                  : 'text-white/30 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon 
                size={20} 
                strokeWidth={activeView === item.id ? 2.5 : 2}
                className={activeView === item.id ? 'text-[#5dcbb6]' : 'text-white/10 group-hover:text-[#5dcbb6] transition-colors'} 
              />
              <span className="font-black text-[11px] tracking-[0.15em] uppercase">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-6 py-4 text-white/20 hover:text-red-400 transition-all font-black text-[10px] uppercase tracking-[0.2em] group"
          >
            <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
              <LogOut size={18} />
            </div>
            <span>Wyloguj</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
