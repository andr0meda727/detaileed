import { Badge } from '@detaileed/ui';
import type { Booking } from '@/features/bookings/model/types';

interface BookingStatusBadgeProps {
  booking: Pick<Booking, 'status' | 'statusColor'>;
  size?: 'md' | 'lg';
  className?: string;
}

/** The booking's status name, tinted with the status colour the API sends (brand green without one). */
export default function BookingStatusBadge({ booking, size = 'md', className }: BookingStatusBadgeProps) {
  return (
    <Badge color={booking.statusColor} size={size} className={className}>
      {booking.status}
    </Badge>
  );
}
