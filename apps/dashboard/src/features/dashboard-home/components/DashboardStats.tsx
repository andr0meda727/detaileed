import React from 'react';
import { DollarSign, Clipboard, Users, CheckCircle2 } from 'lucide-react';
import Skeleton from '@/shared/ui/Skeleton';

export interface DashboardStatsProps {
  todayRevenue: number;
  activeCount: number;
  clientsCount: number;
  completedCount: number;
  todayBookingsCount: number;
  loading?: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  todayRevenue,
  activeCount,
  clientsCount,
  completedCount,
  todayBookingsCount,
  loading,
}) => {
  const stats = [
    {
      label: 'Przychód Dziś',
      value: `${todayRevenue.toLocaleString('pl-PL')} zł`,
      icon: DollarSign,
      iconBg: 'bg-green-deep',
      iconColor: 'text-cream-warm',
      trend: '+12%',
      trendStyle: 'bg-green-pale/40 text-green-light',
    },
    {
      label: 'Aktywne Zlecenia',
      value: activeCount,
      icon: Clipboard,
      iconBg: 'bg-amber',
      iconColor: 'text-green-deep',
      trend: `${todayBookingsCount} dziś`,
      trendStyle: 'bg-amber/15 text-amber',
    },
    {
      label: 'Baza Klientów',
      value: clientsCount,
      icon: Users,
      iconBg: 'bg-green-mid',
      iconColor: 'text-cream-warm',
      trend: 'aktywni',
      trendStyle: 'bg-green-pale/40 text-green-light',
    },
    {
      label: 'Ukończone',
      value: completedCount,
      icon: CheckCircle2,
      iconBg: 'bg-green-light',
      iconColor: 'text-white',
      trend: 'łącznie',
      trendStyle: 'bg-green-pale/40 text-green-light',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
      {stats.map((card, i) => (
        <div key={i} className="floating-card-static p-5 lg:p-6" style={{ animationDelay: `${i * 60}ms` }}>
          <div className="flex items-start justify-between mb-4">
            <div className={`w-11 h-11 ${card.iconBg} rounded-[0.875rem] flex items-center justify-center shadow-md`}>
              <card.icon size={18} className={card.iconColor} strokeWidth={2.5} />
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${card.trendStyle}`}>{card.trend}</span>
          </div>
          <h3 className="text-3xl lg:text-4xl font-extrabold text-green-deep leading-none flex items-baseline">
            {loading ? (
              <Skeleton width="100px" height="32px" className="rounded-lg" />
            ) : (
              <span className="">{card.value}</span>
            )}
          </h3>
          <p className="text-[12px] font-semibold text-green-deep/45 uppercase tracking-wide mt-2">{card.label}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
