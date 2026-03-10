import React from 'react';
import { BookingResponseDto } from '../../../types';

interface BookingListProps {
  bookings: BookingResponseDto[];
  onBookingClick: (booking: BookingResponseDto) => void;
}

const BookingList: React.FC<BookingListProps> = ({ bookings, onBookingClick }) => {
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  const formatDateShort = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const renderBookingCard = (booking: BookingResponseDto, index: number = 0) => {
    return (
      <div
        key={booking.id}
        onClick={() => onBookingClick(booking)}
        className="bg-white rounded-[2rem] border border-slate-100 hover:shadow-xl transition-all flex flex-col sm:flex-row items-stretch cursor-pointer p-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="w-24 sm:border-r border-slate-100 flex flex-col items-center justify-center shrink-0">
          <span className="text-2xl font-extrabold text-[#102C26] font-mono">{formatTime(booking.scheduledAt)}</span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{formatDateShort(booking.scheduledAt)}</span>
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-[#102C26] text-[#F7E7CE] px-3 py-1 rounded-lg font-mono text-[10px] font-semibold">{booking.vehicle.licensePlate}</span>
            <h4 className="text-lg font-bold text-[#102C26] truncate">{booking.vehicle.brand} {booking.vehicle.model}</h4>
          </div>
          <p className="text-xs font-bold text-slate-500 truncate">{booking.services?.join(', ') || 'Brak usług'}</p>
        </div>
        <div className="flex flex-col items-end justify-center shrink-0">
          <p className="text-xl font-extrabold text-[#102C26] font-mono leading-none">{((booking.totalPrice || 0) / 100).toFixed(2).replace('.', ',')} PLN</p>
          <span className="px-3 py-1.5 rounded-xl border-2 text-[10px] font-bold uppercase tracking-widest mt-2" style={{ color: booking.statusColor || '#102C26', borderColor: (booking.statusColor || '#102C26') + '40', backgroundColor: (booking.statusColor || '#102C26') + '15' }}>{booking.status}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {bookings.length > 0 ? (
        bookings.map((b, i) => renderBookingCard(b, i))
      ) : (
        <div className="p-10 lg:p-16 text-center bg-white border border-slate-100 rounded-[2rem]">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Brak rezerwacji</p>
        </div>
      )}
    </div>
  );
};

export default BookingList;
