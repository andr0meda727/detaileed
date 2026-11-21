import React, { useState } from 'react';
import { Calendar, X, Check, UserCheck, MoreHorizontal } from 'lucide-react';
import { BOOKING_STATUSES, type Booking, type BookingStatus } from '@/features/bookings';

import { Skeleton } from '@detaileed/ui';
import { timeInZone } from '@detaileed/domain/studioTime';
import { useStudioTimeZone } from '@/features/studios';
interface TodayScheduleProps {
  bookings: Booking[];
  loading: boolean;
  onOpen: (booking: Booking) => void;
  onRequestStatusChange: (booking: Booking, status: BookingStatus) => void;
}

/** Today's bookings with quick complete/cancel actions. */
export const TodaySchedule: React.FC<TodayScheduleProps> = ({
  bookings: todayBookings,
  loading: showLoading,
  onOpen: handleViewBooking,
  onRequestStatusChange: requestStatusChange,
}) => {
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const timeZone = useStudioTimeZone();
  const formatBookingTime = (iso: string) => timeInZone(iso, timeZone);

  return (
    <div className="floating-card-static p-6 lg:p-7 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-xl font-sans font-bold text-green-deep">Dzisiejszy Grafik</h4>
          <p className="text-[11px] font-semibold text-green-light/60 uppercase tracking-wide mt-1 h-3 flex items-center">
            {showLoading ? (
              <Skeleton width="120px" height="10px" />
            ) : (
              <span className="">
                {todayBookings.length} {todayBookings.length === 1 ? 'zlecenie' : 'zleceń'} zaplanowanych
              </span>
            )}
          </p>
        </div>
        <div className="w-10 h-10 bg-green-deep text-cream-warm rounded-[0.875rem] flex items-center justify-center shadow-lg shrink-0">
          <Calendar size={17} />
        </div>
      </div>
      <div className="space-y-3">
        {showLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="p-4 sm:p-5 rounded-xl flex items-center gap-6 bg-slate-50 border border-slate-100">
              <div className="w-20 border-r pr-6 shrink-0 border-slate-200 flex flex-col items-center justify-center gap-2">
                <Skeleton width="40px" height="14px" className="rounded-sm" />
                <Skeleton width="54px" height="18px" className="rounded-md" />
              </div>
              <div className="flex-1 flex flex-col justify-center gap-2">
                <Skeleton width="60%" height="18px" className="rounded-lg" />
                <Skeleton width="40%" height="12px" className="rounded-md" />
              </div>
            </div>
          ))
        ) : (
          <>
            {todayBookings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: 'rgba(26,46,30,0.05)' }}
                >
                  <Calendar size={24} className="text-green-deep/20" />
                </div>
                <p className="text-base font-semibold text-green-deep/25">Brak zleceń na dziś</p>
                <p className="text-xs text-green-deep/20 mt-1 font-medium">Dodaj nową rezerwację klikając + powyżej</p>
              </div>
            )}
            {todayBookings.map((booking) => {
              const time = formatBookingTime(booking.scheduledAt);
              return (
                <div
                  key={booking.id}
                  onClick={() => handleViewBooking(booking)}
                  className={`p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 cursor-pointer group transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.08)] ${activeDropdownId === booking.id ? 'relative z-50' : 'relative z-10'}`}
                  style={{ background: 'rgba(26,46,30,0.03)', border: '1px solid rgba(26,46,30,0.05)' }}
                >
                  <div
                    className="flex items-center justify-between sm:flex-col sm:justify-center sm:min-w-[90px] sm:border-r sm:pr-6 shrink-0"
                    style={{ borderColor: 'rgba(26,46,30,0.08)' }}
                  >
                    <span className="text-xl font-bold text-green-deep font-mono">{time}</span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border mt-1.5"
                      style={{
                        color: booking.statusColor || 'var(--green-deep)',
                        borderColor: (booking.statusColor || 'var(--green-deep)') + '40',
                        backgroundColor: (booking.statusColor || 'var(--green-deep)') + '12',
                      }}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-lg font-sans font-bold text-green-deep truncate">
                      {booking.vehicle.brand} {booking.vehicle.model}
                    </h5>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
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
                        <span className="text-[10px] font-bold text-green-deep/30 uppercase tracking-widest mt-0.5">
                          Brak usług
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] font-semibold text-green-light mt-1">
                      <UserCheck size={10} className="inline mr-1" />
                      {booking.client.name}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    {booking.status === BOOKING_STATUSES.UTWORZONA.name && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownId(activeDropdownId === booking.id ? null : booking.id);
                          }}
                          title="Więcej akcji"
                          className="w-11 h-11 flex items-center justify-center rounded-xl bg-white text-slate-500 hover:bg-slate-50 hover:text-green-deep transition-all active:scale-95 border border-slate-200 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]"
                        >
                          <MoreHorizontal size={22} strokeWidth={2.5} />
                        </button>
                        {activeDropdownId === booking.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownId(null);
                              }}
                            />
                            <div
                              className="absolute right-0 top-12 z-50 w-48 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 py-1.5 animate-zoom-in"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => {
                                  setActiveDropdownId(null);
                                  e.stopPropagation();
                                  requestStatusChange(booking, BOOKING_STATUSES.ZAKONCZONA);
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
                                  setActiveDropdownId(null);
                                  e.stopPropagation();
                                  requestStatusChange(booking, BOOKING_STATUSES.ANULOWANA);
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
                    <div className="bg-green-deep text-cream-warm px-4 py-2.5 rounded-xl font-mono text-[15px] font-bold tracking-wider uppercase shadow-md">
                      {booking.vehicle.licensePlate}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
