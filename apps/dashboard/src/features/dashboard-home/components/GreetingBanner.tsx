import React from 'react';
import { Plus, UserPlus } from 'lucide-react';

import { Button, PageHeader, Skeleton } from '@detaileed/ui';
import { formatInZone, zonedParts } from '@detaileed/domain/studioTime';
import { useStudioTimeZone } from '@/features/studios';

interface GreetingBannerProps {
  loading: boolean;
  todayCount: number;
  upcomingCount: number;
  onAddBooking: () => void;
  onAddClient: () => void;
}

/** The page header of the home screen: a greeting, the date with today's and upcoming bookings, and quick actions. */
export const GreetingBanner: React.FC<GreetingBannerProps> = ({
  loading,
  todayCount,
  upcomingCount,
  onAddBooking,
  onAddClient,
}) => {
  const timeZone = useStudioTimeZone();
  const now = new Date();
  const { hour } = zonedParts(now, timeZone);
  const greeting = hour < 12 ? 'Dzień dobry' : hour < 18 ? 'Cześć' : 'Dobry wieczór';
  const date = formatInZone(now, timeZone, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const dateStr = date.charAt(0).toUpperCase() + date.slice(1);

  return (
    <PageHeader
      title={greeting}
      description={
        <span className="flex flex-wrap items-center gap-x-1.5">
          <span>{dateStr}</span>
          <span aria-hidden className="text-faint">
            ·
          </span>
          {loading ? (
            <Skeleton width="200px" height="14px" />
          ) : (
            <span>
              Masz {todayCount} {todayCount === 1 ? 'zlecenie' : 'zleceń'} na dziś i {upcomingCount} nadchodzących.
            </span>
          )}
        </span>
      }
      actions={
        <>
          <Button variant="secondary" icon={UserPlus} onClick={onAddClient}>
            Nowy klient
          </Button>
          <Button icon={Plus} onClick={onAddBooking}>
            Nowa rezerwacja
          </Button>
        </>
      }
    />
  );
};
