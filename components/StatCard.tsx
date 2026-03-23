
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
 label: string;
 value: string | number;
 trend?: string;
 icon: LucideIcon;
 color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, trend, icon: Icon, color }) => {
 return (
 <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
 <div className="flex justify-between items-start">
 <div>
 <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
 <h3 className="text-2xl font-semibold text-[#102C26]">{value}</h3>
 {trend && (
 <p className="text-xs mt-2 font-medium text-green-600 bg-green-50 inline-block px-2 py-0.5 rounded-full">
 {trend}
 </p>
 )}
 </div>
 <div className={`p-2.5 rounded-lg ${color} bg-opacity-10`}>
 <Icon className={color.replace('bg-', 'text-')} size={20} />
 </div>
 </div>
 </div>
 );
};

export default StatCard;
