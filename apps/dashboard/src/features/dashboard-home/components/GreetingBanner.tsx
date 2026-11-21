import React from 'react';

import { Skeleton } from '@detaileed/ui';
import { formatInZone, zonedParts } from '@detaileed/domain/studioTime';
import { useStudioTimeZone } from '@/features/studios';

interface GreetingBannerProps {
  loading: boolean;
  todayCount: number;
  upcomingCount: number;
}

/** Greeting with the date and how many bookings are today and coming up. */
export const GreetingBanner: React.FC<GreetingBannerProps> = ({ loading, todayCount, upcomingCount }) => {
  const timeZone = useStudioTimeZone();
  const now = new Date();
  const { hour } = zonedParts(now, timeZone);
  const greeting = hour < 12 ? 'Dzień dobry' : hour < 18 ? 'Cześć' : 'Dobry wieczór';
  const date = formatInZone(now, timeZone, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const dateStr = date.charAt(0).toUpperCase() + date.slice(1);

  return (
    <div
      className="relative rounded-xl p-6 lg:p-8 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, var(--green-deep) 0%, var(--green-dark) 50%, #152b1a 100%)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div
        className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(237,231,216,0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(232,168,48,0.06) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <p className="text-[11px] font-bold text-cream-warm uppercase tracking-[0.4em] mb-3">{dateStr}</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white leading-none">{greeting} 👋</h2>
          <div className="text-white/40 text-[13px] font-medium mt-3 max-w-md h-5 flex items-center">
            {loading ? (
              <Skeleton width="200px" height="14px" className="bg-white/10" />
            ) : (
              <span className="">
                Masz <span className="text-cream-warm font-bold">{todayCount}</span>{' '}
                {todayCount === 1 ? 'zlecenie' : 'zleceń'} na dziś i{' '}
                <span className="text-cream-warm font-bold">{upcomingCount}</span> nadchodzących.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
