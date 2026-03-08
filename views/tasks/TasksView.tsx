
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { CheckCircle2, X, Clock, Car as CarIcon, User, Calendar as CalendarIcon, ChevronLeft, ChevronRight, LayoutList, Search, CalendarDays, Hash } from 'lucide-react';
import { BookingResponseDto } from '../../types';
import { getBookings } from '../../services/bookingService';
import GlobalHeader from '../../components/GlobalHeader';

const TasksView: React.FC = () => {
  const [bookings, setBookings] = useState<BookingResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'in-progress' | 'calendar'>('in-progress');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    try { setLoading(true); setBookings(await getBookings({ isCompleted: false })); } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const inProgressBookings = useMemo(() => bookings.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)), [bookings]);
  const selectedDayBookings = useMemo(() => bookings.filter(b => b.scheduledAt.startsWith(selectedDate)).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)), [bookings, selectedDate]);

  const globalSearchResults = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return bookings.filter(b => b.services.join(' ').toLowerCase().includes(q) || b.client.name.toLowerCase().includes(q) || (b.vehicle.brand || '').toLowerCase().includes(q) || (b.vehicle.model || '').toLowerCase().includes(q) || b.vehicle.licensePlate.toLowerCase().includes(q));
  }, [bookings, searchQuery]);

  const calendarDays = useMemo(() => {
    const y = currentMonth.getFullYear(); const m = currentMonth.getMonth();
    const total = new Date(y, m + 1, 0).getDate(); const start = (new Date(y, m, 1).getDay() + 6) % 7;
    const d: (number | null)[] = []; for (let i = 0; i < start; i++) d.push(null); for (let i = 1; i <= total; i++) d.push(i);
    return d;
  }, [currentMonth]);

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  const formatDateShort = (iso: string) => { const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`; };

  const renderBookingCard = (booking: BookingResponseDto) => (
    <div key={booking.id} className="bg-white rounded-[2rem] border border-slate-100 hover:shadow-xl transition-all group overflow-hidden flex flex-col sm:flex-row items-stretch sm:items-center">
      <div className="bg-[#f8f9fa] sm:bg-transparent sm:border-r border-slate-100 p-6 flex flex-col items-center justify-center min-w-[120px]">
        <span className="text-3xl font-extrabold text-[#102C26] tracking-tighter leading-none">{formatDateShort(booking.scheduledAt)}</span>
        <span className="text-[10px] font-semibold text-slate-400 font-mono tracking-widest mt-2">{formatTime(booking.scheduledAt)}</span>
      </div>
      <div className="flex-1 p-6 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 bg-[#102C26] text-[#F7E7CE] rounded-lg font-mono text-[9px] font-semibold tracking-widest uppercase">{booking.vehicle.licensePlate}</span>
          <h4 className="font-bold text-[#102C26] text-lg tracking-tighter truncate">{booking.vehicle.brand} {booking.vehicle.model}</h4>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-wider"><Hash size={12} className="text-[#5A8A7A]" />{booking.services.join(', ') || 'Brak usĹ‚ug'}</div>
          <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest"><User size={12} />{booking.client.name}</div>
        </div>
      </div>
      <div className="p-6 flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-50 bg-[#fafafa] sm:bg-transparent">
        <span className="px-4 py-2 rounded-full text-[9px] font-semibold uppercase tracking-widest border shrink-0" style={{ color: booking.statusColor || '#102C26', borderColor: (booking.statusColor || '#102C26') + '30', backgroundColor: (booking.statusColor || '#102C26') + '10' }}>{booking.status}</span>
      </div>
    </div>
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-[#102C26] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <GlobalHeader title="Harmonogram" subtitle="Studio DetailFlow" />

      <div className="flex p-1.5 bg-white border border-slate-200 rounded-[2.5rem] w-full md:w-[480px] shadow-sm">
        <button onClick={() => setActiveTab('in-progress')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[2.2rem] text-[11px] font-bold uppercase tracking-widest transition-all ${activeTab === 'in-progress' ? 'bg-[#102C26] text-[#F7E7CE] shadow-2xl' : 'text-slate-400 hover:bg-slate-50'}`}><LayoutList size={18} /> Zlecenia w toku</button>
        <button onClick={() => setActiveTab('calendar')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[2.2rem] text-[11px] font-bold uppercase tracking-widest transition-all ${activeTab === 'calendar' ? 'bg-[#102C26] text-[#F7E7CE] shadow-2xl' : 'text-slate-400 hover:bg-slate-50'}`}><CalendarDays size={18} /> Kalendarz</button>
      </div>

      {activeTab === 'in-progress' ? (
        <div className="space-y-4">
          {inProgressBookings.length > 0 ? inProgressBookings.map(b => renderBookingCard(b)) : (
            <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-slate-100">
              <div className="w-20 h-20 bg-[#F7E7CE]/20 text-[#102C26] rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={36} /></div>
              <h3 className="text-2xl font-semibold text-[#102C26] tracking-tighter">Brak aktywnych zleceĹ„</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Wszystkie rezerwacje zostaĹ‚y ukoĹ„czone.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          <div className="flex flex-col xl:flex-row gap-10">
            <div className="w-full xl:w-[450px] bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 shrink-0">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-semibold text-[#102C26] capitalize tracking-tighter">{currentMonth.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}</h3>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all text-slate-400"><ChevronLeft size={18} /></button>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all text-slate-400"><ChevronRight size={18} /></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Pn', 'Wt', 'Ĺšr', 'Cz', 'Pt', 'So', 'Nd'].map(d => (<div key={d} className="text-center text-[10px] font-semibold text-slate-300 uppercase tracking-widest py-3">{d}</div>))}
                {calendarDays.map((day, idx) => {
                  if (!day) return <div key={`e-${idx}`} />;
                  const ds = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSel = ds === selectedDate;
                  const hasB = bookings.some(b => b.scheduledAt.startsWith(ds));
                  return (<button key={day} onClick={() => setSelectedDate(ds)} className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center text-sm font-semibold transition-all ${isSel ? 'bg-[#102C26] text-[#F7E7CE] shadow-xl scale-110 z-10' : 'hover:bg-[#F7E7CE]/20 text-slate-600'}`}>{day}{hasB && <div className={`w-1.5 h-1.5 rounded-full absolute bottom-2 ${isSel ? 'bg-[#F7E7CE]' : 'bg-[#5A8A7A] ring-4 ring-[#F7E7CE]/20'}`} />}</button>);
                })}
              </div>
            </div>
            <div className="flex-1 space-y-6">
              <div className="bg-[#102C26] rounded-[2.5rem] p-8 flex items-center justify-between gap-4 border border-white/5 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#F7E7CE]/10 blur-[60px] rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10"><p className="text-[10px] font-semibold text-[#F7E7CE] uppercase tracking-[0.4em] mb-2">Wybrana Data</p><h4 className="text-3xl font-extrabold text-white tracking-tighter capitalize leading-none">{new Date(selectedDate).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}</h4></div>
                <CalendarIcon size={32} className="text-white/10 shrink-0" />
              </div>
              <div className="grid grid-cols-1 gap-4">
                {selectedDayBookings.length > 0 ? selectedDayBookings.map(b => renderBookingCard(b)) : (<div className="bg-[#f8f9fa] rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200"><p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Brak rezerwacji w tym dniu</p></div>)}
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-10 border-t border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div><h3 className="text-2xl font-semibold text-[#102C26] tracking-tighter">Wyszukiwarka</h3><p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Przeszukaj wszystkie rezerwacje</p></div>
              <div className="relative w-full md:w-[400px]"><div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"><Search size={20} /></div><input type="text" placeholder="Tablica, klient, model..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-[#F7E7CE]/20 focus:border-[#F7E7CE] transition-all" /></div>
            </div>
            {searchQuery && (
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-inner">
                <div className="mb-6 flex items-center justify-between border-b border-slate-50 pb-4">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Wyniki dla: "{searchQuery}"</span>
                  <span className="text-[10px] font-semibold text-[#5A8A7A] uppercase tracking-widest">Znaleziono: {globalSearchResults.length}</span>
                </div>
                <div className="grid grid-cols-1 gap-4">{globalSearchResults.length > 0 ? globalSearchResults.map(b => renderBookingCard(b)) : (<div className="py-12 text-center text-slate-300 font-semibold uppercase text-xs tracking-widest">Nie znaleziono</div>)}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksView;

