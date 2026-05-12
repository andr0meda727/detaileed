import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookingResponseDto } from '../../../types';

interface RevenueChartProps {
  bookings: BookingResponseDto[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ bookings }) => {
  const [revPeriod, setRevPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const chartData = useMemo(() => {
    const now = new Date();
    const wData = [];
    const mData = [];
    const dNames = ['Ndz', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'];

    // Weekly Data - Last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const dayBookings = bookings.filter(b => b.scheduledAt.startsWith(dateString));
      const rev = Math.round(dayBookings.reduce((sum, b) => sum + ((b.totalPrice || 0) / 100), 0) * 100) / 100;
      wData.push({ name: dNames[d.getDay()], rev, orders: dayBookings.length });
    }

    // Monthly Data - Last 4 Weeks
    for (let i = 3; i >= 0; i--) {
      const weekBookings = bookings.filter(b => {
        const bDate = new Date(b.scheduledAt);
        const diffTime = Math.abs(now.getTime() - bDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= (i * 7) && diffDays < ((i + 1) * 7);
      });
      const rev = Math.round(weekBookings.reduce((sum, b) => sum + ((b.totalPrice || 0) / 100), 0) * 100) / 100;
      mData.push({ name: `Tydz ${4 - i}`, rev, orders: weekBookings.length });
    }

    return { weekly: wData, monthly: mData };
  }, [bookings]);

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
            className={`px-5 py-2.5 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all duration-300 ${revPeriod === 'weekly' ? 'bg-green-deep text-cream-warm shadow-md' : 'text-green-deep/40 hover:text-green-deep'
              }`}
          >
            Tydzień
          </button>
          <button
            onClick={() => setRevPeriod('monthly')}
            className={`px-5 py-2.5 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all duration-300 ${revPeriod === 'monthly' ? 'bg-green-deep text-cream-warm shadow-md' : 'text-green-deep/40 hover:text-green-deep'
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
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#adb5bd', fontSize: 10, fontWeight: 700 }} />
            <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontWeight: 700 }} formatter={(value: number) => value.toFixed(2) + ' PLN'} />
            <Area type="monotone" dataKey="rev" stroke="var(--green-deep)" strokeWidth={4} fill="url(#colorEmerald)" name="Przychód" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
