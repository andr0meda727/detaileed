
import React, { useState, useMemo } from 'react';
import { 
  Wallet, 
  Check, 
  X, 
  CheckCircle2, 
  Plus, 
  UserPlus, 
  Calendar, 
  Clock, 
  Car as CarIcon, 
  Edit2, 
  Save, 
  Search, 
  Hash, 
  Briefcase,
  ChevronLeft,
  ChevronRight,
  User,
  LayoutList,
  CalendarDays,
  Phone, 
  Mail,
  XCircle,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { INITIAL_BOOKINGS, INITIAL_CLIENTS, PREDEFINED_SERVICES } from '../constants';
import { Booking, BookingStatus, Client, Vehicle } from '../types';
import GlobalHeader from '../components/GlobalHeader';

const Modal = ({ isOpen, onClose, title, children }: React.PropsWithChildren<{ isOpen: boolean, onClose: () => void, title: string }>) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a0c10]/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[95vh]">
        <div className="p-8 sm:p-10 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="text-2xl sm:text-3xl font-[1000] text-[#0b2826] tracking-tighter italic leading-none">{title}</h3>
          <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all">
            <X size={20} />
          </button>
        </div>
        <div className="p-8 sm:p-10 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

const BookingsView: React.FC<{ onOpenMenu?: () => void }> = ({ onOpenMenu }) => {
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('calendar');
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);

  // Form states for local use in booking modal
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<{client: Client, vehicle: Vehicle} | null>(null);
  const [priceInput, setPriceInput] = useState('0,00');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState('08:00');

  const selectedDayBookings = useMemo(() => {
    return bookings.filter(b => b.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));
  }, [bookings, selectedDate]);

  const handleOpenNewBooking = () => {
    setSelectedBooking(null); setSelectedServices([]); setSelectedVehicle(null); setClientSearch('');
    setPriceInput('0,00'); setFormDate(selectedDate); setFormTime('08:00');
    setIsEditingMode(true); setIsBookingModalOpen(true);
  };

  const renderBookingCard = (booking: Booking) => {
    const client = INITIAL_CLIENTS.find(c => c.vehicles.some(v => v.id === booking.vehicleId));
    const vehicle = client?.vehicles.find(v => v.id === booking.vehicleId);
    return (
      <div key={booking.id} onClick={() => { setSelectedBooking(booking); setIsEditingMode(false); setIsBookingModalOpen(true); }} className="bg-white rounded-[2rem] border border-slate-100 hover:shadow-xl transition-all flex flex-col sm:flex-row items-stretch cursor-pointer p-4 gap-4">
        <div className="w-24 sm:border-r border-slate-100 flex flex-col items-center justify-center shrink-0">
          <span className="text-2xl font-[1000] text-[#0b2826] italic font-mono">{booking.time}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{booking.date.split('-').reverse().slice(0, 2).join('.')}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-[#0a0c10] text-[#5dcbb6] px-3 py-1 rounded-lg font-mono text-[10px] font-black">{vehicle?.licensePlate}</span>
            <h4 className="text-lg font-[900] text-[#0b2826] italic truncate">{vehicle?.make} {vehicle?.model}</h4>
          </div>
          <p className="text-xs font-bold text-slate-500 truncate">{booking.serviceName}</p>
        </div>
        <div className="flex flex-col items-end justify-center shrink-0">
          <p className="text-xl font-[1000] text-[#0b2826] font-mono leading-none">{booking.price.toFixed(2).replace('.', ',')}</p>
          <span className={`text-[9px] font-black uppercase mt-1 ${booking.status === 'Ukończona' ? 'text-emerald-500' : 'text-slate-400'}`}>{booking.status}</span>
        </div>
      </div>
    );
  };

  const mainCalendarDays = useMemo(() => {
    const y = currentMonth.getFullYear(); const m = currentMonth.getMonth();
    const total = new Date(y, m + 1, 0).getDate(); const start = (new Date(y, m, 1).getDay() + 6) % 7;
    const d = []; for (let i = 0; i < start; i++) d.push(null); for (let i = 1; i <= total; i++) d.push(i);
    return d;
  }, [currentMonth]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <GlobalHeader 
        title="Rezerwacje" 
        subtitle="Studio DetailFlow OS" 
        onAddBooking={handleOpenNewBooking} 
        onAddClient={() => setIsClientModalOpen(true)} 
        onOpenMenu={onOpenMenu}
      />

      <div className="flex p-1 bg-white border border-slate-200 rounded-[2.5rem] w-full sm:w-[350px]">
        <button onClick={() => setActiveTab('list')} className={`flex-1 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-[#0a0c10] text-[#5dcbb6]' : 'text-slate-400'}`}>Lista</button>
        <button onClick={() => setActiveTab('calendar')} className={`flex-1 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'calendar' ? 'bg-[#0a0c10] text-[#5dcbb6]' : 'text-slate-400'}`}>Kalendarz</button>
      </div>

      {activeTab === 'list' ? (
        <div className="space-y-4">{bookings.map(renderBookingCard)}</div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-8">
            <div className="w-full xl:w-[400px] bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 shrink-0 h-fit">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-[1000] text-[#0b2826] italic capitalize tracking-tighter">{currentMonth.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}</h3>
                  <div className="flex gap-1">
                     <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 bg-slate-50 rounded-xl text-slate-400"><ChevronLeft size={16}/></button>
                     <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 bg-slate-50 rounded-xl text-slate-400"><ChevronRight size={16}/></button>
                  </div>
               </div>
               <div className="grid grid-cols-7 gap-2">
                  {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map(d => (<div key={d} className="text-center text-[9px] font-black text-slate-300 uppercase pb-4">{d}</div>))}
                  {mainCalendarDays.map((day, idx) => {
                    if (!day) return <div key={idx} />;
                    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isSelected = dateStr === selectedDate;
                    const hasB = bookings.some(b => b.date === dateStr);
                    return (
                      <button key={day} onClick={() => setSelectedDate(dateStr)} className={`relative aspect-square rounded-xl flex items-center justify-center text-xs font-black transition-all ${isSelected ? 'bg-[#0a0c10] text-[#5dcbb6] shadow-xl' : 'hover:bg-emerald-50 text-slate-600'}`}>
                        {day} {hasB && <div className="w-1 h-1 rounded-full absolute bottom-1.5 bg-[#5dcbb6]" />}
                      </button>
                    );
                  })}
               </div>
            </div>
            <div className="flex-1 space-y-4">
               <div className="bg-[#0b2826] rounded-3xl p-6 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-[#5dcbb6] uppercase tracking-widest mb-1">Wybrana Data</p>
                    <h4 className="text-xl font-[1000] text-white italic tracking-tighter capitalize">{new Date(selectedDate).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}</h4>
                  </div>
                  <Calendar size={24} className="text-white/10" />
               </div>
               {selectedDayBookings.length > 0 ? selectedDayBookings.map(renderBookingCard) : (<div className="p-16 text-center bg-white border border-slate-100 rounded-3xl"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brak rezerwacji</p></div>)}
            </div>
        </div>
      )}

      {/* Booking Modal */}
      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title="Nowa Rezerwacja">
        <form onSubmit={(e) => { e.preventDefault(); setIsBookingModalOpen(false); }} className="space-y-6">
           <div className="space-y-4">
              <label className="text-[10px] font-black text-[#237e73] uppercase tracking-widest ml-4">Klient i Pojazd</label>
              <div className="relative">
                <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Szukaj tablicy lub nazwiska..." className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none" />
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Data</label><input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm" /></div>
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Godzina</label><input type="time" value={formTime} onChange={e => setFormTime(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm" /></div>
           </div>
           <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Cena Netto</label><input type="text" value={priceInput} onChange={e => setPriceInput(e.target.value)} className="w-full px-6 py-5 bg-[#0a0c10] text-[#5dcbb6] border-none rounded-2xl font-black text-2xl font-mono" /></div>
           <button type="submit" className="w-full py-5 bg-[#0a0c10] text-[#5dcbb6] rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl">Zapisz Rezerwację</button>
        </form>
      </Modal>

      {/* Client Modal */}
      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Nowy Klient">
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsClientModalOpen(false); }}>
           <div className="space-y-4">
              <input type="text" placeholder="Imię i Nazwisko" required className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" />
              <div className="grid grid-cols-2 gap-4"><input type="tel" placeholder="Telefon" required className="px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" /><input type="email" placeholder="Email" className="px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" /></div>
           </div>
           <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-4"><input type="text" placeholder="Marka Model" required className="px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" /><input type="text" placeholder="Tablice" required className="px-6 py-4 bg-[#0a0c10] text-[#5dcbb6] border-none rounded-2xl font-black text-sm uppercase font-mono tracking-widest" /></div>
           </div>
           <button type="submit" className="w-full py-5 bg-[#0a0c10] text-[#5dcbb6] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Załóż Kartę Klienta</button>
        </form>
      </Modal>
    </div>
  );
};

export default BookingsView;
