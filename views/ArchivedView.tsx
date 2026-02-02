
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  History, 
  Car as CarIcon, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Hash,
  Download,
  X,
  Phone,
  Mail,
  MessageSquare,
  Briefcase,
  Check,
  Plus,
  Save,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon
} from 'lucide-react';
import { INITIAL_BOOKINGS, INITIAL_CLIENTS, PREDEFINED_SERVICES } from '../constants';
import { Booking, Client, Vehicle, BookingStatus } from '../types';
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

const ArchivedView: React.FC<{ onOpenMenu?: () => void }> = ({ onOpenMenu }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);

  // Quick Action States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState<{client: Client, vehicle: Vehicle} | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customServiceInput, setCustomServiceInput] = useState('');
  const [priceInput, setPriceInput] = useState('0,00');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredBookings = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return INITIAL_BOOKINGS.filter(booking => {
      const client = INITIAL_CLIENTS.find(c => c.vehicles.some(v => v.id === booking.vehicleId));
      const vehicle = client?.vehicles.find(v => v.id === booking.vehicleId);
      return (
        booking.serviceName.toLowerCase().includes(q) ||
        client?.name.toLowerCase().includes(q) ||
        vehicle?.licensePlate.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  const filteredClientResults = useMemo(() => {
    if (!clientSearch.trim()) return [];
    const query = clientSearch.toLowerCase();
    const results: {client: Client, vehicle: Vehicle}[] = [];
    INITIAL_CLIENTS.forEach(client => {
      client.vehicles.forEach(vehicle => {
        if (client.name.toLowerCase().includes(query) || vehicle.make.toLowerCase().includes(query) || 
            vehicle.model.toLowerCase().includes(query) || vehicle.licensePlate.toLowerCase().includes(query)) {
          results.push({ client, vehicle });
        }
      });
    });
    return results.slice(0, 5);
  }, [clientSearch]);

  const toggleService = (s: string) => {
    setSelectedServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleAddCustomService = () => {
    if (customServiceInput.trim() && !selectedServices.includes(customServiceInput.trim())) {
      setSelectedServices(prev => [...prev, customServiceInput.trim()]);
      setCustomServiceInput('');
    }
  };

  const handleOpenNewBooking = () => {
    setSelectedServices([]);
    setSelectedVehicleForBooking(null);
    setClientSearch('');
    setPriceInput('0,00');
    setCustomServiceInput('');
    setIsBookingModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <GlobalHeader 
        title="Archiwum" 
        subtitle="Pełna Historia Operacyjna • DetailFlow" 
        onAddBooking={handleOpenNewBooking}
        onAddClient={() => setIsClientModalOpen(true)}
        onOpenMenu={onOpenMenu}
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#5dcbb6] transition-colors">
            <Search size={20} />
          </div>
          <input 
            type="text"
            placeholder="Szukaj w historii (klient, tablica, usługa)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-8 py-5 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none shadow-sm focus:ring-8 focus:ring-[#5dcbb6]/5 focus:border-[#5dcbb6]/40 transition-all"
          />
        </div>
        <button className="bg-[#0a0c10] text-[#5dcbb6] px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
          <Download size={16} /> Eksportuj
        </button>
      </div>

      <div className="space-y-4">
        {filteredBookings.map((booking) => {
          const client = INITIAL_CLIENTS.find(c => c.vehicles.some(v => v.id === booking.vehicleId));
          const vehicle = client?.vehicles.find(v => v.id === booking.vehicleId);
          return (
            <div key={booking.id} onClick={() => setSelectedBookingForDetails(booking)} className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-6 hover:shadow-lg transition-all cursor-pointer group">
              <div className="w-24 sm:border-r border-slate-100 flex flex-col items-center justify-center shrink-0">
                <span className="text-xl font-[1000] text-[#0b2826] italic font-mono">{booking.date.split('-').reverse().slice(0, 2).join('.')}</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{booking.time}</span>
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
                <span className="text-[9px] font-black uppercase mt-1 text-emerald-500">Ukończona</span>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={!!selectedBookingForDetails} onClose={() => setSelectedBookingForDetails(null)} title="Szczegóły Archiwalne">
        {selectedBookingForDetails && (() => {
          const client = INITIAL_CLIENTS.find(c => c.vehicles.some(v => v.id === selectedBookingForDetails.vehicleId));
          return (
            <div className="space-y-6">
              <div className="p-6 bg-[#0a0c10] rounded-3xl text-[#5dcbb6] flex items-center justify-between">
                <div><p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Klient</p><h4 className="text-xl font-black italic">{client?.name}</h4></div>
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center"><User size={24} /></div>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
                 <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-400 uppercase">Usługa</span><span className="text-sm font-black text-[#0b2826]">{selectedBookingForDetails.serviceName}</span></div>
                 <div className="flex justify-between items-center border-t border-slate-200 pt-4"><span className="text-xs font-bold text-slate-400 uppercase">Cena Netto</span><span className="text-xl font-black text-[#0b2826] font-mono">{selectedBookingForDetails.price.toFixed(2)} PLN</span></div>
              </div>
              <button onClick={() => setSelectedBookingForDetails(null)} className="w-full py-5 bg-[#0a0c10] text-[#5dcbb6] rounded-2xl font-black text-[10px] uppercase tracking-widest">Zamknij</button>
            </div>
          );
        })()}
      </Modal>

      {/* Booking Modal */}
      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title="Nowa Rezerwacja">
        <form className="space-y-8 pb-10" onSubmit={(e) => { e.preventDefault(); setIsBookingModalOpen(false); }}>
          <div className="space-y-4">
             <label className="text-[10px] font-black text-[#237e73] uppercase tracking-widest ml-4">Pojazd i Klient</label>
             <div className="relative">
               <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
               <input type="text" placeholder="Szukaj..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-sm outline-none focus:ring-4 focus:ring-[#5dcbb6]/10" />
             </div>
             {clientSearch.trim() && filteredClientResults.map(res => (
               <button key={res.vehicle.id} type="button" onClick={() => { setSelectedVehicleForBooking(res); setClientSearch(''); }} className="w-full p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-[#5dcbb6] transition-all">
                 <div className="text-left"><h5 className="font-black text-[#0b2826] text-sm italic">{res.vehicle.make} {res.vehicle.model}</h5><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{res.client.name}</p></div>
                 <div className="bg-[#0a0c10] text-[#5dcbb6] px-3 py-1.5 rounded-xl font-mono text-[11px] font-black tracking-widest">{res.vehicle.licensePlate}</div>
               </button>
             ))}
             {selectedVehicleForBooking && (
               <div className="p-6 bg-emerald-50 border-2 border-[#5dcbb6]/30 rounded-[1.5rem] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CarIcon size={24} className="text-[#5dcbb6]" />
                    <div><h5 className="font-black text-[#0b2826] text-sm italic">{selectedVehicleForBooking.vehicle.make} {selectedVehicleForBooking.vehicle.model}</h5><p className="text-[9px] font-black text-[#237e73] uppercase tracking-widest">{selectedVehicleForBooking.client.name}</p></div>
                  </div>
                  <div className="font-mono text-xs font-black text-[#0b2826] whitespace-nowrap">{selectedVehicleForBooking.vehicle.licensePlate}</div>
               </div>
             )}
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-[#237e73] uppercase tracking-widest ml-4">Wybierz Usługi</label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_SERVICES.slice(0, 6).map(s => (
                <button key={s} type="button" onClick={() => toggleService(s)} className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${selectedServices.includes(s) ? 'bg-[#0a0c10] text-[#5dcbb6] border-[#0a0c10]' : 'bg-slate-50 text-slate-400 border-transparent'}`}>
                  {selectedServices.includes(s) && <Check size={12} strokeWidth={4} />} {s}
                </button>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <input type="text" value={customServiceInput} onChange={e => setCustomServiceInput(e.target.value)} placeholder="Dodaj inną usługę..." className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-[#5dcbb6]/10" />
              <button type="button" onClick={handleAddCustomService} className="w-14 h-14 bg-[#0a0c10] text-[#5dcbb6] rounded-2xl flex items-center justify-center shadow-lg active:scale-95"><Plus size={24} /></button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Cena Netto</label><input type="text" value={priceInput} onChange={e => setPriceInput(e.target.value)} className="w-full px-6 py-5 bg-[#0a0c10] text-[#5dcbb6] border-none rounded-[1.5rem] font-black text-xl font-mono" /></div>
             <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Data</label><input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-sm outline-none" /></div>
          </div>
          <button type="submit" className="w-full py-6 bg-[#0a0c10] text-[#5dcbb6] rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"><Save size={18} /> Zapisz Rezerwację</button>
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

export default ArchivedView;
