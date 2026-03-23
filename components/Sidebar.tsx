import React, { useState } from 'react';
import {
 History, Users, Package, LayoutDashboard, CalendarClock,
 LogOut, Layers, X, Building2, ChevronDown, Settings,
 Wrench, UserCircle, LucideIcon, FileBarChart2, ChevronRight
} from 'lucide-react';
import { ViewType } from '../types';
import { useStudio } from '../contexts/StudioContext';

interface SidebarProps {
 activeView: ViewType;
 setActiveView: (view: ViewType) => void;
 onLogout: () => void;
 isOpen?: boolean;
 onClose?: () => void;
 userEmail?: string | null;
}

interface NavBtnProps {
 id: string;
 icon: LucideIcon;
 label: string;
 activeView: ViewType;
 setActiveView: (v: ViewType) => void;
 indent?: boolean;
}

const NavBtn: React.FC<NavBtnProps> = ({ id, icon: Icon, label, activeView, setActiveView, indent = false }) => {
 const active = activeView === id;
 return (
 <button
 onClick={() => setActiveView(id as ViewType)}
 className={`
 w-full flex items-center gap-3 rounded-lg transition-all duration-150 group
 ${indent ? 'px-3 py-2' : 'px-3 py-2.5'}
 ${active
 ? 'bg-white/15 text-white'
 : 'text-white/60 hover:text-white hover:bg-white/5'
 }
 `}
 >
 <Icon
 size={18}
 strokeWidth={active ? 2 : 1.5}
 className={active ? 'text-[#F7E7CE] shrink-0' : 'text-white/40 shrink-0 group-hover:text-white/70 transition-colors'}
 />
 <span className={`text-[13px] ${active ? 'font-semibold' : 'font-medium'} whitespace-nowrap`}>{label}</span>
 </button>
 );
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onLogout, isOpen, onClose, userEmail }) => {
 const { selectedStudio } = useStudio();
 const [settingsOpen, setSettingsOpen] = useState(false);

 const menuItems: { id: string; icon: LucideIcon; label: string }[] = [
 { id: 'Dashboard', icon: LayoutDashboard, label: 'Panel główny' },
 { id: 'Tasks', icon: CalendarClock, label: 'Rezerwacje' },
 { id: 'Clients', icon: Users, label: 'Klienci (CRM)' },
 { id: 'Inventory', icon: Package, label: 'Magazyn' },
 { id: 'Reports', icon: FileBarChart2, label: 'Raporty' },
 { id: 'Archived', icon: History, label: 'Archiwum zleceń' },
 ];

 const settingsItems: { id: string; icon: LucideIcon; label: string }[] = [
 { id: 'StudioSettings', icon: Wrench, label: 'Ustawienia studia' },
 { id: 'UserSettings', icon: UserCircle, label: 'Moje konto' },
 ];

 const isSettingsActive = activeView === 'StudioSettings' || activeView === 'UserSettings';

 React.useEffect(() => {
 if (isSettingsActive) setSettingsOpen(true);
 }, [isSettingsActive]);

 return (
 <>
 {isOpen && (
 <div className="fixed inset-0 bg-[#102C26]/60 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
 )}

 <div className={`
 fixed inset-y-0 left-0 z-50 w-64 bg-[#102C26] flex flex-col
 border-r border-white/5 transition-transform duration-300 ease-out
 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
 `}>
 <button onClick={onClose} className="lg:hidden absolute top-5 right-5 text-white/40 hover:text-white transition-colors z-10">
 <X size={18} />
 </button>

 <div className="flex flex-col flex-1 overflow-y-auto px-4 pt-6 pb-4">

 {/* Logo */}
 <div className="flex items-center gap-3 cursor-pointer group mb-6 px-1" onClick={() => setActiveView('Dashboard')}>
 <div className="w-9 h-9 bg-[#F7E7CE] rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 duration-200 shrink-0">
 <Layers className="text-[#102C26]" size={18} strokeWidth={2} />
 </div>
 <div>
 <h1 className="text-sm font-bold text-white leading-none">DetailFlow</h1>
 <span className="text-sm font-medium text-[#F7E7CE]/60 mt-0.5 block">Studio OS</span>
 </div>
 </div>

 {/* Studio switcher */}
 <button
 onClick={() => setActiveView('Studios')}
 className={`
 w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border mb-5 transition-all duration-150 group
 ${activeView === 'Studios'
 ? 'bg-white/15 border-white/15 text-white'
 : 'bg-white/[0.03] border-white/8 text-white/60 hover:text-white hover:bg-white/5 hover:border-white/12'
 }
 `}
 >
 <Building2
 size={16}
 className={activeView === 'Studios' ? 'text-[#F7E7CE] shrink-0' : 'text-white/35 shrink-0 group-hover:text-white/60 transition-colors'}
 />
 <span className="flex-1 text-left text-[13px] font-medium truncate">
 {selectedStudio ? selectedStudio.name : 'Moje studia'}
 </span>
 <ChevronRight size={14} className="opacity-40 shrink-0" />
 </button>

 {/* Main nav */}
 <p className="text-sm font-medium text-white/30 tracking-wider px-3 mb-2">Menu</p>
 <nav className="space-y-0.5 flex-1">
 {menuItems.map(item => (
 <NavBtn
 key={item.id}
 id={item.id}
 icon={item.icon}
 label={item.label}
 activeView={activeView}
 setActiveView={setActiveView}
 />
 ))}
 </nav>
      </div>

      <div className="px-4 pb-6">
        <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-xl border border-white/5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#F7E7CE]/15 flex items-center justify-center shrink-0">
              <span className="text-[#F7E7CE] font-semibold">{userEmail?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="min-w-0 pr-2 hidden lg:block">
              <p className="text-[11px] font-medium text-white/40 truncate leading-tight mb-0.5">Zalogowano</p>
              <p className="text-xs font-semibold text-white/80 truncate leading-tight">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setActiveView('StudioSettings')}
              className={`p-2 rounded-lg transition-colors ${activeView === 'StudioSettings' || activeView === 'UserSettings' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              title="Ustawienia"
            >
              <Settings size={16} />
            </button>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Wyloguj"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
);
};

export default Sidebar;
