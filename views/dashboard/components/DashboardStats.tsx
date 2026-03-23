import React from 'react';
import { DollarSign, Clipboard, Users, CheckCircle2 } from 'lucide-react';

interface DashboardStatsProps {
 todayRevenue: number;
 activeCount: number;
 clientsCount: number;
 completedCount: number;
 todayBookingsCount: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ 
 todayRevenue, 
 activeCount, 
 clientsCount, 
 completedCount, 
 todayBookingsCount 
}) => {
 const stats = [
 { label: 'Przychód Dziś', value: `${todayRevenue.toLocaleString('pl-PL')} zł`, icon: DollarSign, accent: 'from-[#102C26] to-[#1A3D33]', bg: 'bg-[#F7E7CE]/20', iconBg: 'bg-[#102C26]', trend: '+12%' },
 { label: 'Aktywne Zlecenia', value: activeCount, icon: Clipboard, accent: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', iconBg: 'bg-blue-500', trend: `${todayBookingsCount} dziś` },
 { label: 'Baza Klientów', value: clientsCount, icon: Users, accent: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', iconBg: 'bg-violet-500', trend: 'z API' },
 { label: 'Ukończone', value: completedCount, icon: CheckCircle2, accent: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', iconBg: 'bg-amber-500', trend: 'z API' },
 ];

 return (
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
 {stats.map((card, i) => (
 <div key={i} className="bg-white rounded-xl lg:rounded-xl p-5 lg:p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
 <div className="flex items-start justify-between mb-4">
 <div className={`w-10 h-10 ${card.iconBg} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
 <card.icon size={18} className="text-white" strokeWidth={2.5} />
 </div>
 <span className="text-xs font-semibold text-[#102C26] bg-[#F7E7CE]/30 px-2.5 py-1 rounded-lg tracking-wider">{card.trend}</span>
 </div>
 <h3 className="text-2xl lg:text-3xl font-semibold text-[#102C26] font-mono leading-none">{card.value}</h3>
 <p className="text-xs font-semibold text-slate-400 tracking-wide mt-2">{card.label}</p>
 </div>
 ))}
 </div>
 );
};

export default DashboardStats;
