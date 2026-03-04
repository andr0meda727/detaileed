
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Wallet, Check, X, CheckCircle2, Plus, UserPlus, Calendar, Clock, Car as CarIcon, Edit2, Save, Search,
  Hash, Briefcase, ChevronLeft, ChevronRight, User, LayoutList, CalendarDays, Phone, Mail, XCircle, AlertCircle, MessageSquare
} from 'lucide-react';
import { PREDEFINED_SERVICES } from '../constants';
import { BookingResponseDto, BookingCreateDto, ClientResponseDto, VehicleInfoDto, CreateClientDto } from '../types';
import { getBookings, createBooking } from '../services/bookingService';
import { getClients, createClient } from '../services/clientService';
import GlobalHeader from '../components/GlobalHeader';

const Modal = ({ isOpen, onClose, title, children }: React.PropsWithChildren<{ isOpen: boolean, onClose: () => void, title: string }>) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#102C26]/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[95vh]">
        <div className="p-8 sm:p-10 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="text-2xl sm:text-3xl font-[1000] text-[#102C26] tracking-tighter italic leading-none">{title}</h3>
          <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"><X size={20} /></button>
        </div>
        <div className="p-8 sm:p-10 overflow-y-auto flex-1 custom-scrollbar">{children}</div>
      </div>
    </div>,
    document.body
  );
};

const BookingsView: React.FC<{ onOpenMenu?: () => void }> = ({ onOpenMenu }) => {
  const [bookings, setBookings] = useState<BookingResponseDto[]>([]);
  const [clients, setClients] = useState<ClientResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('calendar');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingResponseDto | null>(null);

  // Form states
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<{ client: ClientResponseDto, vehicle: VehicleInfoDto } | null>(null);
  const [priceInput, setPriceInput] = useState('0,00');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState('08:00');
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const bPromise = getBookings(undefined, (c) => { setBookings(c); setLoading(false); });
      const cPromise = getClients(undefined, (c) => { setClients(c); setLoading(false); });
      const [b, c] = await Promise.all([bPromise, cPromise]);
      setBookings(b);
      setClients(c);
    } catch (err) { console.error('Failed to fetch bookings:', err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const selectedDayBookings = useMemo(() => {
    return bookings.filter(b => b.scheduledAt.startsWith(selectedDate)).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  }, [bookings, selectedDate]);

  const filteredClientResults = useMemo(() => {
    if (!clientSearch.trim()) return [];
    const query = clientSearch.toLowerCase();
    const results: { client: ClientResponseDto, vehicle: VehicleInfoDto }[] = [];
    clients.forEach(client => {
      client.vehicles.forEach(vehicle => {
        if (client.name.toLowerCase().includes(query) || (vehicle.brand || '').toLowerCase().includes(query) ||
          (vehicle.model || '').toLowerCase().includes(query) || vehicle.licensePlate.toLowerCase().includes(query)) {
          results.push({ client, vehicle });
        }
      });
    });
    return results.slice(0, 5);
  }, [clientSearch, clients]);

  const handleOpenNewBooking = () => {
    setSelectedBooking(null); setSelectedServices([]); setSelectedVehicle(null); setClientSearch('');
    setPriceInput('0,00'); setFormDate(selectedDate); setFormTime('08:00');
    setIsBookingModalOpen(true);
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    try {
      const dto: BookingCreateDto = {
        vehicleId: selectedVehicle.vehicle.id,
        clientId: selectedVehicle.client.id,
        scheduledAt: new Date(`${formDate}T${formTime}`).toISOString(),
        price: parseFloat(priceInput.replace(',', '.')),
        notes: null,
      };
      await createBooking(dto);
      setIsBookingModalOpen(false);
      fetchData();
    } catch (err) { console.error('Failed to create booking:', err); }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createClient({ name: newClientName, phone: newClientPhone || null, email: newClientEmail || null, nip: null });
      setIsClientModalOpen(false); setNewClientName(''); setNewClientPhone(''); setNewClientEmail('');
      fetchData();
    } catch (err) { console.error('Failed to create client:', err); }
  };

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  const formatDateShort = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const renderBookingCard = (booking: BookingResponseDto) => {
    return (
      <div key={booking.id} onClick={() => { setSelectedBooking(booking); setIsBookingModalOpen(true); }} className="bg-white rounded-[2rem] border border-slate-100 hover:shadow-xl transition-all flex flex-col sm:flex-row items-stretch cursor-pointer p-4 gap-4">
        <div className="w-24 sm:border-r border-slate-100 flex flex-col items-center justify-center shrink-0">
          <span className="text-2xl font-[1000] text-[#102C26] italic font-mono">{formatTime(booking.scheduledAt)}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDateShort(booking.scheduledAt)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-[#102C26] text-[#F7E7CE] px-3 py-1 rounded-lg font-mono text-[10px] font-black">{booking.vehicle.licensePlate}</span>
            <h4 className="text-lg font-[900] text-[#102C26] italic truncate">{booking.vehicle.brand} {booking.vehicle.model}</h4>
          </div>
          <p className="text-xs font-bold text-slate-500 truncate">{booking.services.join(', ') || 'Brak usług'}</p>
        </div>
        <div className="flex flex-col items-end justify-center shrink-0">
          <p className="text-xl font-[1000] text-[#102C26] font-mono leading-none">{(booking.totalPrice || 0).toFixed(2).replace('.', ',')}</p>
          <span className="text-[9px] font-black uppercase mt-1" style={{ color: booking.statusColor || '#102C26' }}>{booking.status}</span>
        </div>
      </div>
    );
  };

  const mainCalendarDays = useMemo(() => {
    const y = currentMonth.getFullYear(); const m = currentMonth.getMonth();
    const total = new Date(y, m + 1, 0).getDate(); const start = (new Date(y, m, 1).getDay() + 6) % 7;
    const d: (number | null)[] = []; for (let i = 0; i < start; i++) d.push(null); for (let i = 1; i <= total; i++) d.push(i);
    return d;
  }, [currentMonth]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-[#102C26] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <GlobalHeader title="Rezerwacje" subtitle="Studio DetailFlow OS" onAddBooking={handleOpenNewBooking} onAddClient={() => setIsClientModalOpen(true)} onOpenMenu={onOpenMenu} />

      <div className="flex p-1 bg-white border border-slate-200 rounded-[2.5rem] w-full sm:w-[350px]">
        <button onClick={() => setActiveTab('list')} className={`flex-1 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-[#102C26] text-[#F7E7CE]' : 'text-slate-400'}`}>Lista</button>
        <button onClick={() => setActiveTab('calendar')} className={`flex-1 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'calendar' ? 'bg-[#102C26] text-[#F7E7CE]' : 'text-slate-400'}`}>Kalendarz</button>
      </div>

      {activeTab === 'list' ? (
        <div className="space-y-4">{bookings.map(renderBookingCard)}</div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-8">
          <div className="w-full xl:w-[400px] bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 shrink-0 h-fit">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-[1000] text-[#102C26] italic capitalize tracking-tighter">{currentMonth.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}</h3>
              <div className="flex gap-1">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 bg-slate-50 rounded-xl text-slate-400"><ChevronLeft size={16} /></button>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 bg-slate-50 rounded-xl text-slate-400"><ChevronRight size={16} /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map(d => (<div key={d} className="text-center text-[9px] font-black text-slate-300 uppercase pb-4">{d}</div>))}
              {mainCalendarDays.map((day, idx) => {
                if (!day) return <div key={idx} />;
                const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = dateStr === selectedDate;
                const hasB = bookings.some(b => b.scheduledAt.startsWith(dateStr));
                return (
                  <button key={day} onClick={() => setSelectedDate(dateStr)} className={`relative aspect-square rounded-xl flex items-center justify-center text-xs font-black transition-all ${isSelected ? 'bg-[#102C26] text-[#F7E7CE] shadow-xl' : 'hover:bg-[#F7E7CE]/30 text-slate-600'}`}>
                    {day} {hasB && <div className="w-1 h-1 rounded-full absolute bottom-1.5 bg-[#F7E7CE]" />}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="bg-[#102C26] rounded-3xl p-6 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-[#F7E7CE] uppercase tracking-widest mb-1">Wybrana Data</p>
                <h4 className="text-xl font-[1000] text-white italic tracking-tighter capitalize">{new Date(selectedDate).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}</h4>
              </div>
              <Calendar size={24} className="text-white/10" />
            </div>
            {selectedDayBookings.length > 0 ? selectedDayBookings.map(renderBookingCard) : (<div className="p-16 text-center bg-white border border-slate-100 rounded-3xl"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brak rezerwacji</p></div>)}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title={selectedBooking ? 'Szczegóły Rezerwacji' : 'Nowa Rezerwacja'}>
        {selectedBooking ? (
          <div className="space-y-6">
            <div className="p-6 bg-[#102C26] rounded-3xl text-[#F7E7CE]">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Klient</p>
              <h4 className="text-xl font-black italic">{selectedBooking.client.name}</h4>
              {selectedBooking.client.phone && <p className="text-xs font-mono mt-2">{selectedBooking.client.phone}</p>}
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
              <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-400 uppercase">Pojazd</span><span className="text-sm font-black text-[#102C26]">{selectedBooking.vehicle.brand} {selectedBooking.vehicle.model} • {selectedBooking.vehicle.licensePlate}</span></div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-4"><span className="text-xs font-bold text-slate-400 uppercase">Termin</span><span className="text-sm font-black text-[#102C26]">{new Date(selectedBooking.scheduledAt).toLocaleDateString('pl-PL')} • {formatTime(selectedBooking.scheduledAt)}</span></div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-4"><span className="text-xs font-bold text-slate-400 uppercase">Usługi</span><span className="text-sm font-black text-[#102C26]">{selectedBooking.services.join(', ') || '—'}</span></div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-4"><span className="text-xs font-bold text-slate-400 uppercase">Cena</span><span className="text-xl font-black text-[#102C26] font-mono">{(selectedBooking.totalPrice || 0).toFixed(2)} PLN</span></div>
              {selectedBooking.notes && <div className="border-t border-slate-200 pt-4"><span className="text-xs font-bold text-slate-400 uppercase">Notatki</span><p className="text-sm text-slate-600 mt-1">{selectedBooking.notes}</p></div>}
            </div>
            <button onClick={() => { setSelectedBooking(null); setIsBookingModalOpen(false); }} className="w-full py-5 bg-[#102C26] text-[#F7E7CE] rounded-2xl font-black text-[10px] uppercase tracking-widest">Zamknij</button>
          </div>
        ) : (
          <form onSubmit={handleCreateBooking} className="space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-[#5A8A7A] uppercase tracking-widest ml-4">Klient i Pojazd</label>
              <div className="relative">
                <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Szukaj tablicy lub nazwiska..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none" />
              </div>
              {clientSearch.trim() && filteredClientResults.map(res => (
                <button key={res.vehicle.id} type="button" onClick={() => { setSelectedVehicle(res); setClientSearch(''); }} className="w-full p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-[#F7E7CE] transition-all">
                  <div className="text-left"><h5 className="font-black text-[#102C26] text-sm italic">{res.vehicle.brand} {res.vehicle.model}</h5><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{res.client.name}</p></div>
                  <div className="bg-[#102C26] text-[#F7E7CE] px-3 py-1.5 rounded-xl font-mono text-[11px] font-black tracking-widest">{res.vehicle.licensePlate}</div>
                </button>
              ))}
              {selectedVehicle && (
                <div className="p-4 bg-[#F7E7CE]/20 border-2 border-[#F7E7CE]/50 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3"><CarIcon size={20} className="text-[#5A8A7A]" /><div><h5 className="font-black text-[#102C26] text-sm italic">{selectedVehicle.vehicle.brand} {selectedVehicle.vehicle.model}</h5><p className="text-[9px] font-black text-[#5A8A7A] uppercase tracking-widest">{selectedVehicle.client.name}</p></div></div>
                  <span className="font-mono text-xs font-black">{selectedVehicle.vehicle.licensePlate}</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Data</label><input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm" /></div>
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Godzina</label><input type="time" value={formTime} onChange={e => setFormTime(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm" /></div>
            </div>
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Cena Netto</label><input type="text" value={priceInput} onChange={e => setPriceInput(e.target.value)} className="w-full px-6 py-5 bg-[#102C26] text-[#F7E7CE] border-none rounded-2xl font-black text-2xl font-mono" /></div>
            <button type="submit" className="w-full py-5 bg-[#102C26] text-[#F7E7CE] rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl">Zapisz Rezerwację</button>
          </form>
        )}
      </Modal>

      {/* Client Modal */}
      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Nowy Klient">
        <form className="space-y-6" onSubmit={handleCreateClient}>
          <div className="space-y-4">
            <input type="text" placeholder="Imię i Nazwisko" required value={newClientName} onChange={e => setNewClientName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" />
            <div className="grid grid-cols-2 gap-4">
              <input type="tel" placeholder="Telefon" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} className="px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" />
              <input type="email" placeholder="Email" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} className="px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" />
            </div>
          </div>
          <button type="submit" className="w-full py-5 bg-[#102C26] text-[#F7E7CE] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Załóż Kartę Klienta</button>
        </form>
      </Modal>
    </div>
  );
};

export default BookingsView;
