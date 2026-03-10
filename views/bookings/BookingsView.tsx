
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Wallet, Check, X, CheckCircle2, Plus, UserPlus, Calendar, Clock, Car as CarIcon, Edit2, Save, Search,
  Hash, Briefcase, ChevronLeft, ChevronRight, User, LayoutList, CalendarDays, Phone, Mail, XCircle, AlertCircle, MessageSquare
} from 'lucide-react';
import { BookingResponseDto, BookingCreateDto, ClientResponseDto, VehicleInfoDto, CreateClientDto, ServiceResponseDto } from '../../types';
import { BOOKING_STATUSES } from '../../constants';
import { getBookings, createBooking } from '../../services/bookingService';
import { getClients, createClient } from '../../services/clientService';
import { getServices, createService } from '../../services/serviceService';
import GlobalHeader from '../../components/GlobalHeader';
import BookingList from './components/BookingList';
import BookingCalendar from './components/BookingCalendar';
import Modal from '../../components/Modal';

const BookingsView: React.FC<{ onOpenMenu?: () => void }> = ({ onOpenMenu }) => {
  const [bookings, setBookings] = useState<BookingResponseDto[]>([]);
  const [clients, setClients] = useState<ClientResponseDto[]>([]);
  const [availableServices, setAvailableServices] = useState<ServiceResponseDto[]>([]);
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
  const [listSearchQuery, setListSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<{ client: ClientResponseDto, vehicle: VehicleInfoDto } | null>(null);
  const [priceInput, setPriceInput] = useState('0,00');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState('08:00');
  const [customServiceInput, setCustomServiceInput] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newBookingClientNip, setNewBookingClientNip] = useState('');
  const [bookingClientMode, setBookingClientMode] = useState<'existing' | 'new'>('existing');

  // New vehicle form state
  const [newVehicleBrand, setNewVehicleBrand] = useState('');

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  };
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehiclePlate, setNewVehiclePlate] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const bPromise = getBookings(undefined, (c) => { setBookings(c); setLoading(false); });
      const cPromise = getClients(undefined, (c) => { setClients(c); setLoading(false); });
      const sPromise = getServices((c) => { setAvailableServices(c); });
      const [b, c, s] = await Promise.all([bPromise, cPromise, sPromise]);
      setBookings(b);
      setClients(c);
      setAvailableServices(s);
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

  const filteredListBookings = useMemo(() => {
    if (!listSearchQuery.trim()) return bookings;
    const q = listSearchQuery.toLowerCase();
    return bookings.filter(b =>
      b.services.join(' ').toLowerCase().includes(q) ||
      b.client.name.toLowerCase().includes(q) ||
      (b.vehicle.brand || '').toLowerCase().includes(q) ||
      (b.vehicle.model || '').toLowerCase().includes(q) ||
      b.vehicle.licensePlate.toLowerCase().includes(q)
    );
  }, [bookings, listSearchQuery]);

  const handleOpenNewBooking = () => {
    setSelectedBooking(null); setSelectedServices([]); setSelectedVehicle(null); setClientSearch('');
    setPriceInput('0,00'); setFormDate(selectedDate); setFormTime('08:00');
    setBookingClientMode('existing');
    setNewClientName(''); setNewClientPhone(''); setNewClientEmail(''); setNewBookingClientNip('');
    setNewVehicleBrand(''); setNewVehicleModel(''); setNewVehiclePlate('');
    setIsBookingModalOpen(true);
  };

  const toggleService = (id: string) => setSelectedServices(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const handleAddCustomService = async () => {
    const name = customServiceInput.trim();
    if (!name) return;
    try {
      const created = await createService({ name });
      setAvailableServices(prev => [...prev, created]);
      setSelectedServices(prev => [...prev, created.id]);
      setCustomServiceInput('');
    } catch (err) {
      console.error('Failed to create service:', err);
      alert('Wystąpił błąd podczas dodawania usługi.');
    }
  };

  const handleAddNewClientForBooking = async () => {
    if (!newClientName || !newClientPhone || !newVehiclePlate) {
      alert('Wypełnij wymagane pola: Imię i Nazwisko, Telefon oraz Numer Rejestracyjny.');
      return;
    }
    try {
      const createdClient = await createClient({
        name: newClientName,
        phone: newClientPhone,
        email: newClientEmail || null,
        nip: newBookingClientNip || null,
        vehicle: {
          licensePlate: newVehiclePlate,
          brand: newVehicleBrand || null,
          model: newVehicleModel || null,
        },
      });
      const vehicle = createdClient.vehicles?.[0];
      if (vehicle) {
        setSelectedVehicle({ client: createdClient, vehicle });
      }
      setBookingClientMode('existing');
      setNewClientName(''); setNewClientPhone(''); setNewClientEmail(''); setNewBookingClientNip('');
      setNewVehicleBrand(''); setNewVehicleModel(''); setNewVehiclePlate('');
      fetchData();
    } catch (err) {
      console.error('Failed to create client:', err);
      alert('Wystąpił błąd podczas dodawania klienta.');
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) {
      alert('Wybierz istniejącego klienta lub dodaj nowego.');
      return;
    }
    try {
      const dto: BookingCreateDto = {
        vehicleId: selectedVehicle.vehicle.id,
        clientId: selectedVehicle.client.id,
        scheduledAt: new Date(`${formDate}T${formTime}`).toISOString(),
        statusId: BOOKING_STATUSES.UTWORZONA.id,
        serviceIds: selectedServices,
        price: parseFloat(priceInput.replace(',', '.')),
        notes: null,
      };
      await createBooking(dto);
      setIsBookingModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to create booking:', err);
      alert('Wystąpił błąd podczas tworzenia rezerwacji.');
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createClient({ name: newClientName, phone: newClientPhone || null, email: newClientEmail || null, nip: null });
      setIsClientModalOpen(false); setNewClientName(''); setNewClientPhone(''); setNewClientEmail('');
      fetchData();
    } catch (err) { console.error('Failed to create client:', err); }
  };

  const handleBookingClick = (booking: BookingResponseDto) => {
    setSelectedBooking(booking);
    setIsBookingModalOpen(true);
  };


  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-[#102C26] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <GlobalHeader title="Rezerwacje" subtitle="Studio DetailFlow OS" onAddBooking={handleOpenNewBooking} onAddClient={() => setIsClientModalOpen(true)} onOpenMenu={onOpenMenu} />

      <div className="flex p-1 bg-white border border-slate-200 rounded-[1.5rem] w-full sm:w-[350px]">
        <button onClick={() => setActiveTab('list')} className={`flex-1 py-2.5 rounded-[1.25rem] text-[10px] font-semibold uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-[#102C26] text-[#F7E7CE]' : 'text-slate-400'}`}>Lista</button>
        <button onClick={() => setActiveTab('calendar')} className={`flex-1 py-2.5 rounded-[1.25rem] text-[10px] font-semibold uppercase tracking-widest transition-all ${activeTab === 'calendar' ? 'bg-[#102C26] text-[#F7E7CE]' : 'text-slate-400'}`}>Kalendarz</button>
      </div>

      {activeTab === 'list' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F7E7CE]/20 blur-[40px] rounded-full -mr-10 -mt-10 pointer-events-none"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-semibold text-[#102C26] tracking-tighter">Wyszukiwarka</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Szybkie wyszukiwanie ({filteredListBookings.length})</p>
            </div>
            <div className="relative w-full md:w-[400px] z-10">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"><Search size={20} /></div>
              <input
                type="text"
                placeholder="Tablica, klient, model..."
                value={listSearchQuery}
                onChange={e => setListSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:ring-4 focus:ring-[#F7E7CE]/20 focus:border-[#F7E7CE] transition-all"
              />
            </div>
          </div>
          <BookingList bookings={filteredListBookings} onBookingClick={handleBookingClick} />
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <BookingCalendar
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            bookings={bookings}
            onMonthChange={setCurrentMonth}
            onDateChange={setSelectedDate}
          />
          <div className="flex-1 space-y-4">
            <div className="bg-[#102C26] rounded-[2rem] p-5 lg:p-6 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-semibold text-[#F7E7CE] uppercase tracking-widest mb-1">Wybrana Data</p>
                <h4 className="text-lg lg:text-xl font-semibold text-white tracking-tighter capitalize">{new Date(selectedDate).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}</h4>
              </div>
              <Calendar size={20} className="text-white/10" />
            </div>
            <BookingList bookings={selectedDayBookings} onBookingClick={handleBookingClick} />
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title={selectedBooking ? 'Szczegóły Rezerwacji' : 'Nowa Rezerwacja'}>
        {selectedBooking ? (
          <div className="space-y-6">
            <div className="p-6 bg-[#102C26] rounded-3xl text-[#F7E7CE]">
              <p className="text-[9px] font-semibold text-white/40 uppercase tracking-widest mb-1">Klient</p>
              <h4 className="text-xl font-semibold">{selectedBooking.client.name}</h4>
              {selectedBooking.client.phone && <p className="text-xs font-mono mt-2">{selectedBooking.client.phone}</p>}
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
              <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-400 uppercase">Pojazd</span><span className="text-sm font-semibold text-[#102C26]">{selectedBooking.vehicle.brand} {selectedBooking.vehicle.model} • {selectedBooking.vehicle.licensePlate}</span></div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-4"><span className="text-xs font-bold text-slate-400 uppercase">Termin</span><span className="text-sm font-semibold text-[#102C26]">{new Date(selectedBooking.scheduledAt).toLocaleDateString('pl-PL')} • {formatTime(selectedBooking.scheduledAt)}</span></div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-4"><span className="text-xs font-bold text-slate-400 uppercase">Usługi</span><span className="text-sm font-semibold text-[#102C26]">{selectedBooking.services.join(', ') || '—'}</span></div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-4"><span className="text-xs font-bold text-slate-400 uppercase">Cena</span><span className="text-xl font-semibold text-[#102C26] font-mono">{((selectedBooking.totalPrice || 0) / 100).toFixed(2)} PLN</span></div>
              {selectedBooking.notes && <div className="border-t border-slate-200 pt-4"><span className="text-xs font-bold text-slate-400 uppercase">Notatki</span><p className="text-sm text-slate-600 mt-1">{selectedBooking.notes}</p></div>}
            </div>
            <button onClick={() => { setSelectedBooking(null); setIsBookingModalOpen(false); }} className="w-full py-5 bg-[#102C26] text-[#F7E7CE] rounded-2xl font-semibold text-[10px] uppercase tracking-widest">Zamknij</button>
          </div>
        ) : (
          <form onSubmit={handleCreateBooking} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between ml-4 mb-2">
                <label className="text-[10px] font-semibold text-[#5A8A7A] uppercase tracking-widest">Pojazd i Klient</label>
                <div className="flex bg-slate-50 p-1 rounded-xl">
                  <button type="button" onClick={() => setBookingClientMode('existing')} className={`px-4 py-1.5 rounded-lg text-[9px] font-semibold uppercase tracking-widest transition-all ${bookingClientMode === 'existing' ? 'bg-[#102C26] text-[#F7E7CE]' : 'text-slate-400 hover:text-[#102C26]'}`}>Wyszukaj</button>
                  <button type="button" onClick={() => setBookingClientMode('new')} className={`px-4 py-1.5 rounded-lg text-[9px] font-semibold uppercase tracking-widest transition-all ${bookingClientMode === 'new' ? 'bg-[#102C26] text-[#F7E7CE]' : 'text-slate-400 hover:text-[#102C26]'}`}>Dodaj Nowy</button>
                </div>
              </div>

              {bookingClientMode === 'existing' ? (
                <>
                  <div className="relative">
                    <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Szukaj tablicy lub nazwiska..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none" />
                  </div>
                  {clientSearch.trim() && filteredClientResults.map(res => (
                    <button key={res.vehicle.id} type="button" onClick={() => { setSelectedVehicle(res); setClientSearch(''); }} className="w-full p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-[#F7E7CE] transition-all">
                      <div className="text-left"><h5 className="font-semibold text-[#102C26] text-sm">{res.vehicle.brand} {res.vehicle.model}</h5><p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">{res.client.name}</p></div>
                      <div className="bg-[#102C26] text-[#F7E7CE] px-3 py-1.5 rounded-xl font-mono text-[11px] font-semibold tracking-widest">{res.vehicle.licensePlate}</div>
                    </button>
                  ))}
                  {selectedVehicle && (
                    <div className="p-4 bg-[#F7E7CE]/20 border-2 border-[#F7E7CE]/50 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3"><CarIcon size={20} className="text-[#5A8A7A]" /><div><h5 className="font-semibold text-[#102C26] text-sm">{selectedVehicle.vehicle.brand} {selectedVehicle.vehicle.model}</h5><p className="text-[9px] font-semibold text-[#5A8A7A] uppercase tracking-widest">{selectedVehicle.client.name}</p></div></div>
                      <span className="font-mono text-xs font-semibold">{selectedVehicle.vehicle.licensePlate}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4 bg-slate-50 p-6 rounded-[1.5rem] mt-2 border border-slate-100">
                  <div className="space-y-3">
                    <h5 className="font-semibold text-[#102C26] text-xs uppercase tracking-widest mb-3">Dane Klienta</h5>
                    <input type="text" placeholder="Imię i Nazwisko *" value={newClientName} onChange={e => setNewClientName(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#F7E7CE]/50" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="tel" placeholder="Telefon *" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#F7E7CE]/50" />
                      <input type="email" placeholder="Email (opcjonalnie)" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#F7E7CE]/50" />
                    </div>
                    <input type="text" placeholder="NIP (opcjonalnie)" value={newBookingClientNip} onChange={e => setNewBookingClientNip(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#F7E7CE]/50" />
                  </div>
                  <div className="space-y-3 pt-3 border-t border-slate-200">
                    <h5 className="font-semibold text-[#102C26] text-xs uppercase tracking-widest mb-3">Dane Pojazdu</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Marka" value={newVehicleBrand} onChange={e => setNewVehicleBrand(e.target.value)} className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#F7E7CE]/50" />
                      <input type="text" placeholder="Model" value={newVehicleModel} onChange={e => setNewVehicleModel(e.target.value)} className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#F7E7CE]/50" />
                    </div>
                    <input type="text" placeholder="Nr Rejestracyjny *" value={newVehiclePlate} onChange={e => setNewVehiclePlate(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#F7E7CE]/50 uppercase" />
                  </div>
                  <button type="button" onClick={handleAddNewClientForBooking} className="w-full py-4 mt-2 bg-[#102C26] text-[#F7E7CE] rounded-2xl font-semibold text-[10px] uppercase tracking-widest shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <UserPlus size={16} strokeWidth={2.5} /> Dodaj Klienta i Wybierz
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-semibold text-[#5A8A7A] uppercase tracking-widest ml-4">Wybierz Usługi</label>
              <div className="flex flex-wrap gap-2">
                {availableServices.map(svc => (
                  <button key={svc.id} type="button" onClick={() => toggleService(svc.id)} className={`px-4 py-3 rounded-xl text-[9px] font-semibold uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${selectedServices.includes(svc.id) ? 'bg-[#102C26] text-[#F7E7CE] border-[#102C26]' : 'bg-slate-50 text-slate-400 border-transparent'}`}>
                    {selectedServices.includes(svc.id) && <Check size={12} strokeWidth={4} />} {svc.name}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <input type="text" value={customServiceInput} onChange={e => setCustomServiceInput(e.target.value)} placeholder="Dodaj inną usługę..." className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-[#F7E7CE]/30" />
                <button type="button" onClick={handleAddCustomService} className="w-14 h-14 bg-[#102C26] text-[#F7E7CE] rounded-2xl flex items-center justify-center shadow-lg active:scale-95"><Plus size={24} /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4">Data</label><input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm" /></div>
              <div className="space-y-2"><label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4">Godzina</label><input type="time" value={formTime} onChange={e => setFormTime(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm" /></div>
            </div>
            <div className="space-y-2"><label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4">Cena Netto</label><input type="text" value={priceInput} onChange={e => setPriceInput(e.target.value)} className="w-full px-6 py-5 bg-[#102C26] text-[#F7E7CE] border-none rounded-2xl font-semibold text-2xl font-mono" /></div>
            <button type="submit" className="w-full py-5 bg-[#102C26] text-[#F7E7CE] rounded-2xl font-semibold text-[11px] uppercase tracking-widest shadow-xl">Zapisz Rezerwację</button>
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
          <button type="submit" className="w-full py-5 bg-[#102C26] text-[#F7E7CE] rounded-2xl font-semibold text-[10px] uppercase tracking-widest shadow-xl">Załóż Kartę Klienta</button>
        </form>
      </Modal>
    </div>
  );
};

export default BookingsView;
