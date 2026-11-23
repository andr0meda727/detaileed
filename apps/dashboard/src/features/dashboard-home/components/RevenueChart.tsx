import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, SegmentedControl, Stat } from '@detaileed/ui';
import type { Booking } from '@/features/bookings';
import { useStudioTimeZone } from '@/features/studios';
import { todayInZone } from '@detaileed/domain/studioTime';
import { revenueSeries } from '@/features/dashboard-home/model/revenue';

interface RevenueChartProps {
  bookings: Booking[];
}

type Period = 'weekly' | 'monthly';

const PERIODS = [
  { value: 'weekly', label: 'Tydzień' },
  { value: 'monthly', label: 'Miesiąc' },
] as const;

// Colours come from the theme tokens, so the chart follows the light and dark themes by itself.
const tick = { fill: 'var(--faint)', fontSize: 12 };
const tooltipStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--foreground)',
  fontSize: 13,
};

/** Revenue of completed bookings per day of the last week or per week of the last month. */
export const RevenueChart: React.FC<RevenueChartProps> = ({ bookings }) => {
  const [period, setPeriod] = useState<Period>('weekly');

  const timeZone = useStudioTimeZone();
  const chartData = useMemo(() => revenueSeries(bookings, timeZone, todayInZone(timeZone)), [bookings, timeZone]);
  const data = period === 'weekly' ? chartData.weekly : chartData.monthly;
  const total = data.reduce((s, d) => s + d.rev, 0);

  return (
    <Card>
      <CardHeader
        title="Finanse studia"
        actions={
          <SegmentedControl
            aria-label="Okres przychodu"
            size="sm"
            options={PERIODS}
            value={period}
            onValueChange={setPeriod}
          />
        }
      />
      <CardContent className="flex flex-col gap-4">
        <Stat
          label={period === 'weekly' ? 'Przychód z 7 dni' : 'Przychód z 4 tygodni'}
          value={`${total.toLocaleString('pl-PL')} zł`}
        />
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={tick} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: 'var(--muted-foreground)' }}
                itemStyle={{ color: 'var(--foreground)' }}
                cursor={{ stroke: 'var(--border-strong)' }}
                formatter={(value) => Number(value ?? 0).toFixed(2) + ' zł'}
              />
              <Area
                type="monotone"
                dataKey="rev"
                stroke="var(--foreground)"
                strokeWidth={2}
                fill="var(--foreground)"
                fillOpacity={0.06}
                activeDot={{ r: 4, fill: 'var(--foreground)', stroke: 'var(--surface)', strokeWidth: 2 }}
                name="Przychód"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
