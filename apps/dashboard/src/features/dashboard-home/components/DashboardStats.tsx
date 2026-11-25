import React from 'react';
import { Card, cn, Skeleton, Stat } from '@detaileed/ui';

/** Dividers between the cells: a 2×2 grid on phones and tablets, one row from `lg`. */
const cellBorders = ['border-r border-b lg:border-b-0', 'border-b lg:border-r lg:border-b-0', 'border-r', ''];

export interface DashboardStatsProps {
  todayRevenue: number;
  activeCount: number;
  clientsCount: number;
  completedCount: number;
  todayBookingsCount: number;
  loading?: boolean;
}

/** The four key figures of the studio, side by side in one card (two by two on phones). */
export const DashboardStats: React.FC<DashboardStatsProps> = ({
  todayRevenue,
  activeCount,
  clientsCount,
  completedCount,
  todayBookingsCount,
  loading,
}) => {
  const stats = [
    { label: 'Przychód dziś', value: `${todayRevenue.toLocaleString('pl-PL')} zł`, hint: 'z zakończonych wizyt' },
    { label: 'Aktywne zlecenia', value: activeCount, hint: `${todayBookingsCount} dziś` },
    { label: 'Baza klientów', value: clientsCount, hint: 'aktywni' },
    { label: 'Ukończone', value: completedCount, hint: 'łącznie' },
  ];

  return (
    <Card role="group" aria-label="Podsumowanie" className="grid grid-cols-2 overflow-hidden lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Stat
          key={stat.label}
          className={cn('border-border px-5 py-4', cellBorders[i])}
          label={stat.label}
          value={loading ? <Skeleton width="96px" height="28px" /> : stat.value}
          hint={stat.hint}
        />
      ))}
    </Card>
  );
};
