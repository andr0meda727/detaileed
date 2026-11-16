import React, { useState } from 'react';
import { Check, MoreHorizontal, User, X } from 'lucide-react';
import type { Booking } from '@/features/bookings/model/types';
import { BOOKING_STATUSES, type BookingStatus } from '@/features/bookings/model/statuses';
import { formatBookingDay, formatBookingTime } from '@/features/bookings/model/format';
import BookingStatusBadge from '@/features/bookings/components/BookingStatusBadge';

interface BookingCardProps {
  booking: Booking;
  /** Position in the list, for the staggered fade-in. */
  index?: number;
  onOpen: (booking: Booking) => void;
  onRequestStatusChange: (booking: Booking, status: BookingStatus) => void;
}

/** One booking in a list: date, vehicle, services, client and the complete/cancel menu. */
const BookingCard: React.FC<BookingCardProps> = ({ booking, index = 0, onOpen, onRequestStatusChange }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div
      onClick={() => onOpen(booking)}
      className={`floating-card flex flex-col sm:flex-row items-stretch cursor-pointer ${menuOpen ? 'relative z-50' : 'relative z-10'}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Date/Time column */}
      <div
        className="p-5 sm:p-6 flex flex-col items-center justify-center min-w-[110px] shrink-0 rounded-t-2xl sm:rounded-t-none sm:rounded-l-2xl"
        style={{ borderRight: '1px solid rgba(26,46,30,0.05)', background: 'rgba(26,46,30,0.02)' }}
      >
        <span className="text-2xl font-bold text-green-deep font-mono leading-none">
          {formatBookingDay(booking.scheduledAt)}
        </span>
        <span className="text-[10px] font-semibold text-green-deep/35 font-mono tracking-widest mt-2">
          {formatBookingTime(booking.scheduledAt)}
        </span>
      </div>
      {/* Content */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-green-deep text-cream-warm px-4 py-1.5 rounded-lg font-mono text-[13px] font-bold tracking-widest shadow-xs">
            {booking.vehicle.licensePlate}
          </span>
          <h4 className="font-sans font-bold text-green-deep text-base tracking-tight truncate">
            {booking.vehicle.brand} {booking.vehicle.model}
          </h4>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <div className="flex flex-wrap gap-1.5">
            {booking.services.length > 0 ? (
              booking.services.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-amber text-green-deep shadow-xs"
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="text-[11px] font-semibold text-green-deep/30 uppercase tracking-wide">Brak usług</span>
            )}
          </div>
          <span className="text-[11px] font-semibold text-green-light/70">
            <User size={10} className="inline mr-1" />
            {booking.client.name}
          </span>
        </div>
      </div>
      {/* Status + quick actions */}
      <div
        className="px-5 sm:px-6 py-4 flex items-center justify-end gap-3 sm:shrink-0 rounded-b-2xl sm:rounded-b-none sm:rounded-r-2xl"
        style={{ borderTop: '1px solid rgba(26,46,30,0.04)', background: 'rgba(26,46,30,0.01)' }}
      >
        {booking.status === BOOKING_STATUSES.UTWORZONA.name && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              title="Więcej akcji"
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-white text-slate-500 hover:bg-slate-50 hover:text-green-deep transition-all active:scale-95 border border-slate-200 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]"
            >
              <MoreHorizontal size={22} strokeWidth={2.5} />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                  }}
                />
                <div
                  className="absolute right-0 top-12 z-50 w-48 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 py-1.5 animate-zoom-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      setMenuOpen(false);
                      e.stopPropagation();
                      onRequestStatusChange(booking, BOOKING_STATUSES.ZAKONCZONA);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-green-50 transition-colors text-[12px] font-bold text-green-deep"
                  >
                    <div className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                      <Check size={14} strokeWidth={2.5} />
                    </div>
                    Zakończ zlecenie
                  </button>
                  <button
                    onClick={(e) => {
                      setMenuOpen(false);
                      e.stopPropagation();
                      onRequestStatusChange(booking, BOOKING_STATUSES.ANULOWANA);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-red-50 transition-colors text-[12px] font-bold text-red-500"
                  >
                    <div className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                      <X size={14} strokeWidth={2.5} />
                    </div>
                    Anuluj zlecenie
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        <BookingStatusBadge booking={booking} />
      </div>
    </div>
  );
};

export default BookingCard;
