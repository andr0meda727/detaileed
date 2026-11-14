import React from 'react';
import type { Booking } from '@/features/bookings/model/types';

interface BookingStatusBadgeProps {
  booking: Pick<Booking, 'status' | 'statusColor'>;
  size?: 'md' | 'lg';
  className?: string;
}

/** The booking's status name, tinted with the status colour the API sends. */
const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ booking, size = 'md', className = '' }) => {
  const color = booking.statusColor || 'var(--green-deep)';
  const shape =
    size === 'lg'
      ? 'inline-block px-5 py-2.5 rounded-2xl border-2 text-[11px]'
      : 'px-4 py-2 rounded-full border text-[10px]';
  return (
    <span
      className={`${shape} font-bold uppercase tracking-widest ${className}`}
      style={{
        color,
        borderColor: color + (size === 'lg' ? '40' : '35'),
        backgroundColor: color + (size === 'lg' ? '15' : '10'),
      }}
    >
      {booking.status}
    </span>
  );
};

export default BookingStatusBadge;
