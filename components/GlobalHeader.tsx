
import React from 'react';
import { Plus, UserPlus, Menu } from 'lucide-react';

interface GlobalHeaderProps {
 title: string;
 subtitle: string;
 onAddBooking?: () => void;
 onAddClient?: () => void;
 onOpenMenu?: () => void;
}

const GlobalHeader: React.FC<GlobalHeaderProps> = ({ title, subtitle, onAddBooking, onAddClient, onOpenMenu }) => {
 return (
 <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 lg:mb-8">
 <div className="space-y-1">
 <div className="flex items-center gap-3">
 {onOpenMenu && (
 <button
 onClick={onOpenMenu}
 className="lg:hidden p-2 bg-[#102C26] text-[#F7E7CE] rounded-lg active:scale-95 transition-all"
 >
 <Menu size={18} strokeWidth={2} />
 </button>
 )}
 <h1 className="text-2xl sm:text-3xl font-semibold text-[#102C26] leading-tight">{title}</h1>
 </div>
 <p className="text-sm text-[#5A8A7A] font-medium">{subtitle}</p>
 </div>

 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
 {onAddBooking && (
 <button
 onClick={onAddBooking}
 className="flex items-center justify-center gap-2 bg-[#102C26] text-[#F7E7CE] px-4 py-2.5 rounded-lg font-medium text-sm shadow-sm hover:bg-[#1A3D33] transition-colors group"
 >
 <Plus size={16} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform" />
 <span className="whitespace-nowrap">Dodaj rezerwację</span>
 </button>
 )}
 {onAddClient && (
 <button
 onClick={onAddClient}
 className="flex items-center justify-center gap-2 bg-white text-[#102C26] border border-slate-200 px-4 py-2.5 rounded-lg font-medium text-sm shadow-sm hover:border-[#F7E7CE] hover:bg-[#FDF8F0] transition-colors group"
 >
 <UserPlus size={16} strokeWidth={2} />
 <span className="whitespace-nowrap">Nowy klient</span>
 </button>
 )}
 </div>
 </header>
 );
};

export default GlobalHeader;
