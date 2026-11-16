import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Booking } from '@/features/bookings';
import { useStudioTimeZone } from '@/features/studios';
import { todayInZone } from '@detaileed/domain/studioTime';
import { revenueSeries } from '@/features/dashboard-home/model/revenue';

interface RevenueChartProps {
  bookings: Booking[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ bookings }) => {
  const [revPeriod, setRevPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const timeZone = useStudioTimeZone();
  const chartData = useMemo(() => revenueSeries(bookings, timeZone, todayInZone(timeZone)), [bookings, timeZone]);

  return (
    <div className="floating-card-static p-6 lg:p-8">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] font-semibold text-green-light/60 uppercase tracking-wide mb-1">Finanse Studia</p>
          <h3 className="text-3xl lg:text-4xl font-extrabold text-green-deep leading-none">
            {revPeriod === 'weekly'
              ? chartData.weekly.reduce((s, d) => s + d.rev, 0).toLocaleString('pl-PL')
              : chartData.monthly.reduce((s, d) => s + d.rev, 0).toLocaleString('pl-PL')}
            <span className="text-[15px] font-bold text-green-light/60 ml-2">PLN</span>
          </h3>
        </div>
        <div
          className="flex p-1.5 rounded-lg h-fit shrink-0"
          style={{ background: 'rgba(26,46,30,0.04)', border: '1px solid rgba(26,46,30,0.07)' }}
        >
          <button
            onClick={() => setRevPeriod('weekly')}
            className={`px-5 py-2.5 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all duration-300 ${
              revPeriod === 'weekly'
                ? 'bg-green-deep text-cream-warm shadow-md'
                : 'text-green-deep/40 hover:text-green-deep'
            }`}
          >
            Tydzień
          </button>
          <button
            onClick={() => setRevPeriod('monthly')}
            className={`px-5 py-2.5 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all duration-300 ${
              revPeriod === 'monthly'
                ? 'bg-green-deep text-cream-warm shadow-md'
                : 'text-green-deep/40 hover:text-green-deep'
            }`}
          >
            Miesiąc
          </button>
        </div>
      </div>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revPeriod === 'weekly' ? chartData.weekly : chartData.monthly}>
            <defs>
              <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--green-deep)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--green-deep)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f3f5" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#adb5bd', fontSize: 10, fontWeight: 700 }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '1rem',
                border: 'none',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                fontWeight: 700,
              }}
              formatter={(value) => Number(value ?? 0).toFixed(2) + ' PLN'}
            />
            <Area
              type="monotone"
              dataKey="rev"
              stroke="var(--green-deep)"
              strokeWidth={4}
              fill="url(#colorEmerald)"
              name="Przychód"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
