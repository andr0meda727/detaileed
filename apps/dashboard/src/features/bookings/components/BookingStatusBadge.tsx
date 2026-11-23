import { Badge } from '@detaileed/ui';
import type { Booking } from '@/features/bookings/model/types';
import { bookingStatusTone } from '@/features/bookings/model/statuses';

interface BookingStatusBadgeProps {
  booking: Pick<Booking, 'status' | 'statusColor'>;
  size?: 'md' | 'lg';
  className?: string;
}

/**
 * The booking's status name as a toned pill (Utworzona info, Zakończona success, Anulowana danger). A status the
 * app doesn't know gets a neutral pill with the API's status colour on its dot.
 */
export function BookingStatusBadge({ booking, size = 'md', className }: BookingStatusBadgeProps) {
  const tone = bookingStatusTone(booking.status);
  return (
    <Badge tone={tone ?? 'neutral'} color={tone ? undefined : booking.statusColor} size={size} className={className}>
      {booking.status}
    </Badge>
  );
}
