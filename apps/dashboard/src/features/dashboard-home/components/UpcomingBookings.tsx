import React from 'react';
import { ChevronRight } from 'lucide-react';
import { type Booking } from '@/features/bookings';
import { formatPln } from '@/shared/lib/money';
import { Skeleton } from '@detaileed/ui';
import { dayInZone } from '@/shared/lib/studioTime';
import { useStudioTimeZone } from '@/features/studios';
interface UpcomingBookingsProps {
  bookings: Booking[];
  loading: boolean;
  onOpen: (booking: Booking) => void;
  onShowAll: () => void;
}

/** The next bookings after today, with a link to the full schedule. */
const UpcomingBookings: React.FC<UpcomingBookingsProps> = ({
  bookings: upcomingBookings,
  loading,
  onOpen: handleViewBooking,
  onShowAll,
}) => {
  const timeZone = useStudioTimeZone();
  return (
    <div className="floating-card-static p-6 lg:p-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-lg lg:text-xl font-sans font-bold text-green-deep">Nadchodzące</h4>
            <p className="text-[11px] font-semibold text-green-light/60 uppercase tracking-wide mt-1">
              następne {upcomingBookings.length} rezerwacji
            </p>
          </div>
          <button
            onClick={() => onShowAll()}
            className="text-[9px] font-semibold text-green-light uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
          >
            Wszystkie <ChevronRight size={13} />
          </button>
        </div>
        <div className="space-y-2">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl flex items-center gap-5"
                  style={{ background: 'rgba(26,46,30,0.03)', border: '1px solid rgba(26,46,30,0.05)' }}
                >
                  <div
                    className="text-center shrink-0 min-w-[50px] border-r pr-4"
                    style={{ borderColor: 'rgba(26,46,30,0.08)' }}
                  >
                    <Skeleton width="30px" height="24px" className="mx-auto mb-1 rounded-md" />
                    <Skeleton width="24px" height="10px" className="mx-auto" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton width="100px" height="16px" className="rounded-md" />
                    <Skeleton width="60%" height="12px" className="rounded-md" />
                  </div>
                  <div className="text-right shrink-0">
                    <Skeleton width="60px" height="20px" className="rounded-md" />
                  </div>
                </div>
              ))
            : upcomingBookings.slice(0, 4).map((booking) => {
                const [, month, day] = dayInZone(booking.scheduledAt, timeZone).split('-');
                const monthIdx = Number(month) - 1;
                return (
                  <div
                    key={booking.id}
                    onClick={() => handleViewBooking(booking)}
                    className="p-4 rounded-xl flex items-center gap-5 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.07)]"
                    style={{ background: 'rgba(26,46,30,0.03)', border: '1px solid rgba(26,46,30,0.05)' }}
                  >
                    <div
                      className="text-center shrink-0 min-w-[50px] border-r pr-4"
                      style={{ borderColor: 'rgba(26,46,30,0.08)' }}
                    >
                      <p className="text-xl font-bold text-green-deep font-mono leading-none">{day}</p>
                      <p className="text-[8px] font-bold text-green-light/60 uppercase tracking-wider">
                        {['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'][monthIdx]}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-bold text-green-deep truncate">
                        {booking.vehicle.brand} {booking.vehicle.model}
                      </h5>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {booking.services.length > 0 ? (
                          booking.services.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded-sm text-[8px] font-bold uppercase tracking-widest bg-amber text-green-deep shadow-xs"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-[8px] font-bold text-green-deep/30 uppercase tracking-widest">
                            Brak usług
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-bold text-green-deep font-mono">
                        {formatPln(booking.totalPrice)} <span className="text-[9px] text-green-deep/35">zł</span>
                      </p>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
};

export default UpcomingBookings;
