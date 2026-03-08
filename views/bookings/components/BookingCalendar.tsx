import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BookingResponseDto } from '../../../types';

interface BookingCalendarProps {
  currentMonth: Date;
  selectedDate: string;
  bookings: BookingResponseDto[];
  onMonthChange: (date: Date) => void;
  onDateChange: (date: string) => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ 
  currentMonth, 
  selectedDate, 
  bookings, 
  onMonthChange, 
  onDateChange 
}) => {
  const mainCalendarDays = useMemo(() => {
    const y = currentMonth.getFullYear(); 
    const m = currentMonth.getMonth();
    const total = new Date(y, m + 1, 0).getDate(); 
    const start = (new Date(y, m, 1).getDay() + 6) % 7;
    const d: (number | null)[] = []; 
    for (let i = 0; i < start; i++) d.push(null); 
    for (let i = 1; i <= total; i++) d.push(i);
    return d;
  }, [currentMonth]);

  return (
    <div className="w-full xl:w-[380px] bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-slate-100 shrink-0 h-fit">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg lg:text-xl font-extrabold text-[#102C26] capitalize tracking-tighter">
          {currentMonth.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-1">
          <button 
            onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} 
            className="p-1.5 bg-slate-50 rounded-xl text-slate-400 hover:text-[#102C26] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} 
            className="p-1.5 bg-slate-50 rounded-xl text-slate-400 hover:text-[#102C26] transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 lg:gap-2">
        {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map(d => (
          <div key={d} className="text-center text-[9px] font-semibold text-slate-300 uppercase pb-2 lg:pb-4">{d}</div>
        ))}
        {mainCalendarDays.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = dateStr === selectedDate;
          const hasB = bookings.some(b => b.scheduledAt.startsWith(dateStr));
          return (
            <button 
              key={day} 
              onClick={() => onDateChange(dateStr)} 
              className={`relative aspect-[4/3] sm:aspect-square rounded-xl flex items-center justify-center text-xs font-semibold transition-all ${
                isSelected 
                  ? 'bg-[#102C26] text-[#F7E7CE] shadow-lg' 
                  : 'hover:bg-[#F7E7CE]/30 text-slate-600'
              }`}
            >
              {day} 
              {hasB && <div className="w-1 h-1 rounded-full absolute bottom-1 lg:bottom-1.5 bg-[#F7E7CE]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BookingCalendar;
