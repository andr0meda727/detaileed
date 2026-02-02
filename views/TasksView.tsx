
import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  X, 
  Clock, 
  Car as CarIcon, 
  User, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  LayoutList,
  Search,
  CalendarDays,
  Hash
} from 'lucide-react';
import { INITIAL_BOOKINGS, INITIAL_CLIENTS } from '../constants';
import { Booking, BookingStatus } from '../types';
import GlobalHeader from '../components/GlobalHeader';

const TasksView: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [activeTab, setActiveTab] = useState<'in-progress' | 'calendar'>('in-progress');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  const updateStatus = (id: string, newStatus: BookingStatus) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  const matchesSearch = (booking: Booking, query: string) => {
    if (!query) return true;
    const q = query.toLowerCase();
    const client = INITIAL_CLIENTS.find(c => c.vehicles.some(v => v.id === booking.vehicleId));
    const vehicle = client?.vehicles.find(v => v.id === booking.vehicleId);
    
    return (
      booking.serviceName.toLowerCase().includes(q) ||
      client?.name.toLowerCase().includes(q) ||
      vehicle?.make.toLowerCase().includes(q) ||
      vehicle?.model.toLowerCase().includes(q) ||
      vehicle?.licensePlate.toLowerCase().includes(q)
    );
  };

  const inProgressBookings = useMemo(() => {
    return bookings
      .filter(b => (b.status === 'Oczekująca' || b.status === 'Zatwierdzona'))
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }, [bookings]);

  const selectedDayBookings = useMemo(() => {
    return bookings
      .filter(b => b.date === selectedDate)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [bookings, selectedDate]);

  const globalSearchResults = useMemo(() => {
    if (!searchQuery) return [];
    return bookings.filter(b => matchesSearch(b, searchQuery))
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }, [bookings, searchQuery]);

  // Logika kalendarza
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days = [];
    const totalDays = daysInMonth(year, month);
    const startDay = (firstDayOfMonth(year, month) + 6) % 7;

    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);
    
    return days;
  }, [currentMonth]);

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const renderBookingCard = (booking: Booking, isCompact = false) => {
    const client = INITIAL_CLIENTS.find(c => c.vehicles.some(v => v.id === booking.vehicleId));
    const vehicle = client?.vehicles.find(v => v.id === booking.vehicleId);
    const isActive = booking.status === 'Oczekująca' || booking.status === 'Zatwierdzona';
    
    const dateParts = booking.date.split('-');
    const formattedDate = `${dateParts[2]}.${dateParts[1]}`;

    return (
      <div key={booking.id} className="bg-white rounded-[2rem] border border-slate-100 hover:shadow-xl transition-all group overflow-hidden flex flex-col sm:flex-row items-stretch sm:items-center">
        {/* DATA - GŁÓWNY PUNKT */}
        <div className="bg-[#f8f9fa] sm:bg-transparent sm:border-r border-slate-100 p-6 flex flex-col items-center justify-center min-w-[120px]">
           <span className="text-3xl font-[1000] text-[#0b2826] tracking-tighter leading-none italic">{formattedDate}</span>
           <span className="text-[10px] font-black text-slate-400 font-mono tracking-widest mt-2">{booking.time}</span>
        </div>

        {/* INFO POJAZD / USŁUGA */}
        <div className="flex-1 p-6 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 bg-[#0a0c10] text-[#5dcbb6] rounded-lg font-mono text-[9px] font-black tracking-widest uppercase">
              {vehicle?.licensePlate}
            </span>
            <h4 className="font-[900] text-[#0b2826] italic text-lg tracking-tighter truncate">
              {vehicle?.make} {vehicle?.model}
            </h4>
          </div>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
               <Hash size={12} className="text-[#5dcbb6]" />
               {booking.serviceName}
            </div>
            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
               <User size={12} />
               {client?.name}
            </div>
          </div>
        </div>

        {/* STATUS I AKCJE */}
        <div className="p-6 flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-50 bg-[#fafafa] sm:bg-transparent">
          <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0 ${
            booking.status === 'Ukończona' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' :
            booking.status === 'Anulowana' ? 'bg-red-50 text-red-500 border-red-100' :
            'bg-white text-slate-400 border-slate-200'
          }`}>
            {booking.status === 'Zatwierdzona' ? 'Aktywna' : booking.status}
          </span>

          <div className="flex gap-2">
            {isActive && (
              <>
                <button 
                  onClick={() => updateStatus(booking.id, 'Ukończona')}
                  className="p-3 bg-[#0a0c10] text-[#5dcbb6] rounded-xl hover:scale-110 transition-transform shadow-lg"
                  title="Ukończ"
                >
                  <CheckCircle2 size={16} />
                </button>
                <button 
                  onClick={() => updateStatus(booking.id, 'Anulowana')}
                  className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-100"
                  title="Anuluj"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <GlobalHeader title="Harmonogram" subtitle="Studio DetailFlow" />

      {/* Wybór Widoku */}
      <div className="flex p-1.5 bg-white border border-slate-200 rounded-[2.5rem] w-full md:w-[480px] shadow-sm">
        <button 
          onClick={() => setActiveTab('in-progress')}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[2.2rem] text-[11px] font-[900] uppercase tracking-widest transition-all ${
            activeTab === 'in-progress' ? 'bg-[#0a0c10] text-[#5dcbb6] shadow-2xl' : 'text-slate-400 hover:bg-slate-50'
          }`}
        >
          <LayoutList size={18} /> Zlecenia w toku
        </button>
        <button 
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[2.2rem] text-[11px] font-[900] uppercase tracking-widest transition-all ${
            activeTab === 'calendar' ? 'bg-[#0a0c10] text-[#5dcbb6] shadow-2xl' : 'text-slate-400 hover:bg-slate-50'
          }`}
        >
          <CalendarDays size={18} /> Kalendarz
        </button>
      </div>

      {activeTab === 'in-progress' ? (
        <div className="space-y-4">
          {inProgressBookings.length > 0 ? (
            inProgressBookings.map(b => renderBookingCard(b))
          ) : (
            <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-slate-100">
               <div className="w-20 h-20 bg-emerald-50 text-[#5dcbb6] rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle2 size={36} />
               </div>
               <h3 className="text-2xl font-black text-[#0b2826] tracking-tighter italic">Brak aktywnych zleceń</h3>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Wszystkie rezerwacje zostały ukończone lub anulowane.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          {/* SEKCJA KALENDARZA I LISTY DNIA */}
          <div className="flex flex-col xl:flex-row gap-10">
            {/* Widget Kalendarza */}
            <div className="w-full xl:w-[450px] bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 shrink-0">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black text-[#0b2826] italic capitalize tracking-tighter">
                  {currentMonth.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => changeMonth(-1)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all text-slate-400"><ChevronLeft size={18}/></button>
                  <button onClick={() => changeMonth(1)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all text-slate-400"><ChevronRight size={18}/></button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map(d => (
                  <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest py-3">{d}</div>
                ))}
                {calendarDays.map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} />;
                  
                  const dateString = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = dateString === selectedDate;
                  const dayBookings = bookings.filter(b => b.date === dateString);
                  const hasBookings = dayBookings.length > 0;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateString)}
                      className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center text-sm font-black transition-all ${
                        isSelected 
                          ? 'bg-[#0a0c10] text-[#5dcbb6] shadow-xl scale-110 z-10' 
                          : 'hover:bg-emerald-50 text-slate-600'
                      }`}
                    >
                      {day}
                      {hasBookings && (
                        <div className={`w-1.5 h-1.5 rounded-full absolute bottom-2 ${isSelected ? 'bg-[#5dcbb6]' : 'bg-[#5dcbb6] ring-4 ring-emerald-50'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lista na wybrany dzień */}
            <div className="flex-1 space-y-6">
              <div className="bg-[#0b2826] rounded-[2.5rem] p-8 flex items-center justify-between gap-4 border border-white/5 overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-[#5dcbb6]/10 blur-[60px] rounded-full -mr-16 -mt-16"></div>
                 <div className="relative z-10">
                    <p className="text-[10px] font-black text-[#5dcbb6] uppercase tracking-[0.4em] mb-2">Wybrana Data</p>
                    <h4 className="text-3xl font-[1000] text-white italic tracking-tighter capitalize leading-none">
                      {new Date(selectedDate).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}
                    </h4>
                 </div>
                 <CalendarIcon size={32} className="text-white/10 shrink-0" />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {selectedDayBookings.length > 0 ? (
                  selectedDayBookings.map(b => renderBookingCard(b))
                ) : (
                  <div className="bg-[#f8f9fa] rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Brak rezerwacji w tym dniu</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* GLOBALNA WYSZUKIWARKA NA DOLE */}
          <div className="space-y-6 pt-10 border-t border-slate-200">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-black text-[#0b2826] tracking-tighter italic">Wyszukiwarka Miesięczna</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Przeszukaj wszystkie rezerwacje w systemie</p>
                </div>
                <div className="relative w-full md:w-[400px]">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search size={20} />
                  </div>
                  <input 
                    type="text"
                    placeholder="Numer tablicy, klient, model..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#5dcbb6]/10 focus:border-[#5dcbb6] transition-all"
                  />
                </div>
             </div>

             {searchQuery && (
               <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-inner">
                  <div className="mb-6 flex items-center justify-between border-b border-slate-50 pb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       Wyniki dla: "{searchQuery}"
                    </span>
                    <span className="text-[10px] font-black text-[#5dcbb6] uppercase tracking-widest">
                       Znaleziono: {globalSearchResults.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {globalSearchResults.length > 0 ? (
                      globalSearchResults.map(b => renderBookingCard(b))
                    ) : (
                      <div className="py-12 text-center text-slate-300 font-black uppercase text-xs tracking-widest">
                        Nie znaleziono dopasowań
                      </div>
                    )}
                  </div>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksView;
