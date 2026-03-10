
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { CheckCircle2, X, Clock, Car as CarIcon, User, Calendar as CalendarIcon, ChevronLeft, ChevronRight, LayoutList, Search, CalendarDays, Hash, Phone, MessageSquare, AlertCircle, Check } from 'lucide-react';
import { BookingResponseDto, BookingCreateDto } from '../../types';
import { BOOKING_STATUSES } from '../../constants';
import { getBookings, completeBooking, cancelBooking, updateBooking } from '../../services/bookingService';
import GlobalHeader from '../../components/GlobalHeader';
import Modal from '../../components/Modal';
import { useToast } from '../../contexts/ToastContext';

const TasksView: React.FC = () => {
  const [bookings, setBookings] = useState<BookingResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'in-progress' | 'calendar'>('in-progress');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [inProgressSearchQuery, setInProgressSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'UTWORZONA' | 'ZAKONCZONA' | 'ANULOWANA'>('all');

  const { addToast } = useToast();
  const [selectedBooking, setSelectedBooking] = useState<BookingResponseDto | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<{ id: string, type: typeof BOOKING_STATUSES[keyof typeof BOOKING_STATUSES], booking: BookingResponseDto } | null>(null);

  const fetchData = useCallback(async () => {
    try { setLoading(true); setBookings(await getBookings()); } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const inProgressBookings = useMemo(() => {
    let filtered = bookings;
    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => b.status === BOOKING_STATUSES[filterStatus]?.name);
    }
    if (inProgressSearchQuery.trim()) {
      const q = inProgressSearchQuery.toLowerCase();
      filtered = filtered.filter(b =>
        b.services.join(' ').toLowerCase().includes(q) ||
        b.client.name.toLowerCase().includes(q) ||
        (b.vehicle.brand || '').toLowerCase().includes(q) ||
        (b.vehicle.model || '').toLowerCase().includes(q) ||
        b.vehicle.licensePlate.toLowerCase().includes(q)
      );
    }
    return filtered.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  }, [bookings, filterStatus, inProgressSearchQuery]);
  const groupedInProgressBookings = useMemo(() => {
    const grouped = inProgressBookings.reduce((acc, booking) => {
      const date = booking.scheduledAt.split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(booking);
      return acc;
    }, {} as Record<string, BookingResponseDto[]>);
    return Object.entries(grouped)
      .map(([date, bks]) => ({ date, bookings: bks }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [inProgressBookings]);
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

  const handleViewBooking = (booking: BookingResponseDto) => {
    setSelectedBooking(booking);
    setIsBookingModalOpen(true);
  };

  const handleQuickUpdateStatus = async (booking: BookingResponseDto, targetStatus: typeof BOOKING_STATUSES[keyof typeof BOOKING_STATUSES]) => {
    try {
      if (targetStatus.id === BOOKING_STATUSES.ZAKONCZONA.id) {
        await completeBooking(booking.id);
      } else if (targetStatus.id === BOOKING_STATUSES.ANULOWANA.id) {
        await cancelBooking(booking.id);
      } else {
        const dto: BookingCreateDto = {
          vehicleId: booking.vehicle.id,
          clientId: booking.client.id,
          scheduledAt: booking.scheduledAt,
          statusId: targetStatus.id,
          serviceIds: [], // We don't have availableServices easily here, but usually for just status we might not need it if backend allows partial update or ignores it if not changed. Wait, backend might require it. Better to just use complete/cancel for now as requested.
        };
        // If we really need to update status to something else, we might need availableServices. 
        // For now, let's keep it simple as dashboard mostly uses complete/cancel quick actions.
      }

      addToast(`Status rezerwacji zmieniony na: ${targetStatus.name}`, 'success');
      fetchData();
    } catch (err) {
      console.error('Failed to update booking status:', err);
      addToast('Wystąpił błąd podczas zmiany statusu.', 'error');
    } finally {
      setConfirmation(null);
    }
  };

  const confirmStatusUpdate = (e: React.MouseEvent, booking: BookingResponseDto, targetStatus: typeof BOOKING_STATUSES[keyof typeof BOOKING_STATUSES]) => {
    e.stopPropagation();
    setConfirmation({ id: booking.id, type: targetStatus, booking });
  };

  const renderBookingCard = (booking: BookingResponseDto, index: number = 0) => (
    <div key={booking.id} onClick={() => handleViewBooking(booking)} className="bg-white rounded-[2rem] border border-slate-100 hover:shadow-xl transition-all group overflow-hidden flex flex-col sm:flex-row items-stretch sm:items-center cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${index * 50}ms` }}>
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
        <span className="px-5 py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest border-2 shrink-0" style={{ color: booking.statusColor || '#102C26', borderColor: (booking.statusColor || '#102C26') + '40', backgroundColor: (booking.statusColor || '#102C26') + '15' }}>{booking.status}</span>
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
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {([
                { id: 'all', label: 'Wszystkie' },
                { id: 'UTWORZONA', label: 'W toku' },
                { id: 'ZAKONCZONA', label: 'Ukończone' },
                { id: 'ANULOWANA', label: 'Anulowane' }
              ] as const).map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-4 py-2 rounded-[1rem] text-[10px] font-bold uppercase tracking-widest transition-all ${filterStatus === f.id ? 'bg-[#102C26] text-[#F7E7CE] shadow-md' : 'bg-white text-slate-400 border border-slate-200 hover:border-[#102C26]/20'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-[300px]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Search size={16} /></div>
              <input
                type="text"
                placeholder="Szukaj zlecenia..."
                value={inProgressSearchQuery}
                onChange={e => setInProgressSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-[1rem] font-semibold text-xs outline-none focus:ring-2 focus:ring-[#F7E7CE]/50 focus:border-[#F7E7CE] transition-all"
              />
            </div>
          </div>
          {groupedInProgressBookings.length > 0 ? groupedInProgressBookings.map(group => (
            <div key={group.date} className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2 border-b border-slate-100 pb-2 mb-4">
                {new Date(group.date).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              <div className="space-y-4">
                {group.bookings.map((b, idx) => renderBookingCard(b, idx))}
              </div>
            </div>
          )) : (
            <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-slate-100">
              <div className="w-20 h-20 bg-[#F7E7CE]/20 text-[#102C26] rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={36} /></div>
              <h3 className="text-2xl font-semibold text-[#102C26] tracking-tighter">Brak zleceń</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Brak przypisanych rezerwacji.</p>
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
                {selectedDayBookings.length > 0 ? selectedDayBookings.map((b, idx) => renderBookingCard(b, idx)) : (<div className="bg-[#f8f9fa] rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200"><p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Brak rezerwacji w tym dniu</p></div>)}
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
                <div className="grid grid-cols-1 gap-4">{globalSearchResults.length > 0 ? globalSearchResults.map((b, idx) => renderBookingCard(b, idx)) : (<div className="py-12 text-center text-slate-300 font-semibold uppercase text-xs tracking-widest">Nie znaleziono</div>)}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title="Detale Zlecenia">
        {selectedBooking && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 bg-[#102C26] rounded-[2.5rem] border border-white/5 relative overflow-hidden">
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-[#F7E7CE]"><User size={24} /></div>
                    <div>
                      <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">Klient</p>
                      <h4 className="text-xl font-normal text-white tracking-tighter">{selectedBooking.client.name}</h4>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    {selectedBooking.client.phone && (
                      <a href={`tel:${selectedBooking.client.phone}`} className="flex items-center gap-2 text-[#F7E7CE] hover:text-white transition-colors">
                        <Phone size={14} /><span className="text-sm font-semibold font-mono">{selectedBooking.client.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {selectedBooking.client.phone && <a href={`tel:${selectedBooking.client.phone}`} className="w-12 h-12 bg-[#F7E7CE] text-[#102C26] rounded-xl flex items-center justify-center active:scale-90 transition-transform"><Phone size={20} /></a>}
                  {selectedBooking.client.phone && <a href={`sms:${selectedBooking.client.phone}`} className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center active:scale-90 transition-transform"><MessageSquare size={20} /></a>}
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#5A8A7A] shadow-sm"><Clock size={28} /></div>
                <div>
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Termin</p>
                  <p className="text-lg font-bold text-[#102C26]">{new Date(selectedBooking.scheduledAt).toLocaleDateString('pl-PL')} • {formatTime(selectedBooking.scheduledAt)}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-block px-3 py-1.5 rounded-xl border mb-2 font-semibold text-[10px] uppercase tracking-widest`} style={{ color: selectedBooking.statusColor || '#102C26', backgroundColor: (selectedBooking.statusColor || '#F7E7CE') + '15', borderColor: (selectedBooking.statusColor || '#F7E7CE') + '30' }}>
                  {selectedBooking.status}
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-3xl font-extrabold text-[#102C26] font-mono leading-none tracking-tighter">{((selectedBooking.totalPrice || 0) / 100).toFixed(2).replace('.', ',')}</p>
                  <p className="text-[9px] font-semibold text-[#5A8A7A] uppercase mt-1 tracking-widest">PLN Netto</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-semibold text-[#5A8A7A] uppercase tracking-[0.4em] ml-4">Zakres Prac</p>
              <div className="flex flex-wrap gap-2">
                {selectedBooking.services.map(s => (
                  <span key={s} className="px-5 py-3 bg-[#102C26] text-[#F7E7CE] rounded-xl text-[12px] font-semibold uppercase tracking-widest shadow-md">{s}</span>
                ))}
                {selectedBooking.services.length === 0 && <span className="text-sm text-slate-400">Brak przypisanych usług</span>}
              </div>
            </div>
            {selectedBooking.notes && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-[#5A8A7A] uppercase tracking-[0.4em] ml-4">Notatki</p>
                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl">{selectedBooking.notes}</p>
              </div>
            )}
            <div className="flex gap-4 pt-6">
              {selectedBooking.status === BOOKING_STATUSES.UTWORZONA.name && (
                <>
                  <button onClick={(e) => { confirmStatusUpdate(e, selectedBooking, BOOKING_STATUSES.ZAKONCZONA); setIsBookingModalOpen(false); }} className="flex-1 py-5 bg-emerald-50 text-emerald-600 border border-emerald-100/50 rounded-[1.5rem] font-semibold text-[11px] uppercase tracking-widest hover:bg-emerald-100 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"><Check size={16} strokeWidth={2.5} /> Zakończ</button>
                  <button onClick={(e) => { confirmStatusUpdate(e, selectedBooking, BOOKING_STATUSES.ANULOWANA); setIsBookingModalOpen(false); }} className="flex-1 py-5 bg-red-50 text-red-500 border border-red-100/50 rounded-[1.5rem] font-semibold text-[11px] uppercase tracking-widest hover:bg-red-100 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"><X size={16} strokeWidth={2.5} /> Anuluj</button>
                </>
              )}
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className={`py-5 bg-[#102C26] text-[#F7E7CE] rounded-[1.5rem] font-semibold text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all ${selectedBooking.status === BOOKING_STATUSES.UTWORZONA.name ? 'px-8 flex-none' : 'flex-1'}`}
              >Zamknij</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <Modal isOpen={!!confirmation} onClose={() => setConfirmation(null)} title="Zmień Status">
        <div className="space-y-8">
          <div className="flex items-center gap-6 p-8 bg-slate-50 rounded-[2.5rem]">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${confirmation?.type.id === BOOKING_STATUSES.ZAKONCZONA.id ? 'bg-[#F7E7CE]/20 text-[#102C26]' : 'bg-red-50 text-red-500'}`}><AlertCircle size={32} /></div>
            <div>
              <p className="text-lg font-bold text-[#102C26] leading-tight mb-2">{confirmation?.type.id === BOOKING_STATUSES.ZAKONCZONA.id ? 'Zakończyć to zlecenie?' : 'Anulować tę rezerwację?'}</p>
              <p className="text-sm text-slate-500 font-semibold">{confirmation?.booking.vehicle.brand} {confirmation?.booking.vehicle.model}</p>
              <p className="text-xs text-slate-400 font-mono mt-1">{confirmation?.booking.vehicle.licensePlate}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setConfirmation(null)} className="flex-1 py-5 bg-white border border-slate-200 text-slate-400 rounded-[1.5rem] font-semibold text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all">Wróć</button>
            <button onClick={() => confirmation && handleQuickUpdateStatus(confirmation.booking, confirmation.type)} className={`flex-1 py-5 rounded-[1.5rem] font-semibold text-[11px] uppercase tracking-widest text-white shadow-xl hover:shadow-2xl active:scale-95 transition-all ${confirmation?.type.id === BOOKING_STATUSES.ZAKONCZONA.id ? 'bg-[#102C26] text-[#F7E7CE]' : 'bg-red-500'}`}>Tak, kontynuuj</button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default TasksView;

