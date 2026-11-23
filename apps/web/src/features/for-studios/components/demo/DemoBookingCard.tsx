import { User } from 'lucide-react';
import { Badge, LicensePlate } from '@detaileed/ui';
import type { DemoBooking } from '../../model/demoData';
import { dayMonthOf, timeOf } from '../../model/demoFormat';
import { DemoBookingMenu } from './DashboardBookings';

/** One booking in the demo's list, as the dashboard's booking card: date, vehicle, services, client and status. */
export function DemoBookingCard({ booking }: { booking: DemoBooking }) {
  const { vehicle } = booking;
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition-colors duration-150 hover:bg-subtle sm:flex-row sm:items-center sm:gap-5">
      <div className="flex shrink-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 sm:w-28 sm:flex-col">
        <span className="font-mono text-sm font-medium text-foreground tabular-nums">
          {dayMonthOf(booking.scheduledAt)}
        </span>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {timeOf(booking.scheduledAt)}–{timeOf(booking.endsAt)}
        </span>
        <span className="text-xs text-faint">{booking.bay}</span>
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <LicensePlate plate={vehicle.licensePlate} />
          <h5 className="truncate text-sm font-medium text-foreground">
            {vehicle.brand} {vehicle.model}
          </h5>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <div className="flex flex-wrap gap-1">
            {booking.services.map((service) => (
              <span key={service} className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                {service}
              </span>
            ))}
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <User size={12} strokeWidth={1.75} aria-hidden />
            {booking.client.name}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-end gap-2">
        <Badge color={booking.statusColor}>{booking.status}</Badge>
        {booking.completedAt === null && <DemoBookingMenu />}
      </div>
    </div>
  );
}
