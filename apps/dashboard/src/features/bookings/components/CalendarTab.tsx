import React, { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Booking } from '@/features/bookings/model/types';
import { BOOKING_STATUSES, type BookingStatus } from '@/features/bookings/model/statuses';
import { byScheduledAt, monthGrid } from '@/features/bookings/model/filters';
import BookingCard from '@/features/bookings/components/BookingCard';
import { Skeleton } from '@detaileed/ui';

interface TabProps {
  /** Bookings the schedule shows (see visibleBookings). */
  bookings: Booking[];
  loading: boolean;
  onOpen: (booking: Booking) => void;
  onRequestStatusChange: (booking: Booking, status: BookingStatus) => void;
}

interface CalendarTabProps extends TabProps {
  /** YYYY-MM-DD of the day whose bookings are listed. */
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

/** Month grid with booking dots, and the bookings of the selected day. */
const CalendarTab: React.FC<CalendarTabProps> = ({
  bookings,
  loading,
  selectedDate,
  onSelectDate: setSelectedDate,
  onOpen,
  onRequestStatusChange,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarDays = useMemo(() => monthGrid(currentMonth), [currentMonth]);
  const selectedDayBookings = useMemo(
    () => bookings.filter((b) => b.scheduledAt.startsWith(selectedDate)).sort(byScheduledAt),
    [bookings, selectedDate],
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col xl:flex-row gap-10">
        <div className="w-full xl:w-[420px] floating-card-static p-7 shrink-0">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-sans font-bold text-green-deep capitalize">
              {currentMonth.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-green-deep/40 hover:text-green-deep hover:bg-green-pale/30 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-green-deep/40 hover:text-green-deep hover:bg-green-pale/30 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1.5 mb-3">
            {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map((d) => (
              <div
                key={d}
                className="text-center text-[9px] font-bold text-green-deep/25 uppercase tracking-widest py-2"
              >
                {d}
              </div>
            ))}
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`e-${idx}`} />;
              const ds = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSel = ds === selectedDate;
              const hasB = bookings.some(
                (b) =>
                  b.scheduledAt.startsWith(ds) &&
                  b.status !== BOOKING_STATUSES.ANULOWANA.name &&
                  b.status !== BOOKING_STATUSES.ZAKONCZONA.name,
              );
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(ds)}
                  className={`relative aspect-square rounded-[0.65rem] flex flex-col items-center justify-center text-sm font-semibold transition-all duration-200 ${
                    isSel
                      ? 'bg-green-deep text-cream-warm shadow-lg scale-105 z-10'
                      : 'hover:bg-green-pale/30 text-green-deep/70'
                  }`}
                >
                  {day}
                  {hasB && (
                    <div
                      className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${isSel ? 'bg-amber' : 'bg-green-light'}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex-1 space-y-6">
          <div className="bg-green-deep rounded-2xl p-8 flex items-center justify-between gap-4 border border-white/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-cream-warm/10 blur-[60px] rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <p className="text-[10px] font-semibold text-cream-warm uppercase tracking-[0.4em] mb-2">Wybrana Data</p>
              <h4 className="text-3xl font-extrabold text-white tracking-tighter capitalize leading-none">
                {new Date(selectedDate).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}
              </h4>
            </div>
            <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
              <CalendarIcon size={24} color="#ffffff" strokeWidth={2} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              [1, 2].map((i) => (
                <div key={i} className="floating-card-static flex flex-col sm:flex-row items-center h-24 bg-white/50">
                  <div className="w-24 border-r pr-6 flex items-center justify-center shrink-0 border-slate-100">
                    <Skeleton width="40px" height="20px" />
                  </div>
                  <div className="flex-1 p-6 space-y-2">
                    <Skeleton width="40%" height="16px" />
                    <Skeleton width="20%" height="10px" />
                  </div>
                </div>
              ))
            ) : (
              <>
                {selectedDayBookings.length > 0 ? (
                  selectedDayBookings.map((b, idx) => (
                    <BookingCard
                      key={b.id}
                      booking={b}
                      index={idx}
                      onOpen={onOpen}
                      onRequestStatusChange={onRequestStatusChange}
                    />
                  ))
                ) : (
                  <div className="bg-[#f8f9fa] rounded-2xl p-16 text-center border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
                      Brak rezerwacji w tym dniu
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarTab;
