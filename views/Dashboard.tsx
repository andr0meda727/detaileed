
import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Package, 
  Car as CarIcon,
  X,
  Plus,
  TrendingUp,
  AlertCircle,
  Search,
  CheckCircle2,
  XCircle,
  Check,
  User,
  Phone,
  Mail,
  MessageSquare,
  Edit2,
  Save,
  Clock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { INITIAL_BOOKINGS, INITIAL_INVENTORY, INITIAL_CLIENTS, PREDEFINED_SERVICES } from '../constants';
import { Booking, InventoryItem, ViewType, BookingStatus, Client, Vehicle } from '../types';
import GlobalHeader from '../components/GlobalHeader';

const weeklyData = [
  { name: 'Pon', rev: 1200 }, { name: 'Wt', rev: 4500 }, { name: 'Śr', rev: 3200 }, 
  { name: 'Czw', rev: 8000 }, { name: 'Pt', rev: 6100 }, { name: 'Sob', rev: 9500 }, { name: 'Ndz', rev: 2000 }
];

const Modal = ({ isOpen, onClose, title, children }: React.PropsWithChildren<{ isOpen: boolean, onClose: () => void, title: string }>) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-[#0a0c10]/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[95vh]">
        <div className="p-6 sm:p-10 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-[1000] text-[#0b2826] tracking-tighter italic leading-none">{title}</h3>
          <button onClick={onClose} className="p-2 sm:p-3 bg-slate-50 text-slate-400 rounded-xl sm:rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<{ onNavigate?: (view: ViewType), onOpenMenu?: () => void }> = ({ onNavigate, onOpenMenu }) => {
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [inventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [revPeriod, setRevPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isEditingBooking, setIsEditingBooking] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [confirmation, setConfirmation] = useState<{ id: string, type: 'Ukończona' | 'Anulowana' } | null>(null);

  // Form states
  const [clientSearch, setClientSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<{client: Client, vehicle: Vehicle} | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customServiceInput, setCustomServiceInput] = useState('');
  const [priceInput, setPriceInput] = useState('0,00');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('08:00');

  const lowStockItems = useMemo(() => inventory.filter(i => i.stock < i.minStock), [inventory]);
  const agendaItems = useMemo(() => [...bookings].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)), [bookings]);

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

  const handleUpdateStatus = (id: string, status: BookingStatus) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    setConfirmation(null);
  };

  const handleOpenNewBooking = () => {
    setSelectedBooking(null);
    setSelectedVehicle(null);
    setClientSearch('');
    setSelectedServices([]);
    setPriceInput('0,00');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSelectedTime('08:00');
    setIsEditingBooking(true);
    setIsBookingModalOpen(true);
  };

  const handleViewBooking = (booking: Booking) => {
    const client = INITIAL_CLIENTS.find(c => c.vehicles.some(v => v.id === booking.vehicleId));
    const vehicle = client?.vehicles.find(v => v.id === booking.vehicleId);
    
    setSelectedBooking(booking);
    if (client && vehicle) setSelectedVehicle({ client, vehicle });
    setSelectedServices(booking.serviceName.split(', '));
    setPriceInput(booking.price.toFixed(2).replace('.', ','));
    setSelectedDate(booking.date);
    setSelectedTime(booking.time);
    setIsEditingBooking(false);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="space-y-6 sm:space-y-10">
      <GlobalHeader 
        title="Panel" 
        subtitle="Studio OS DetailFlow" 
        onAddBooking={handleOpenNewBooking}
        onAddClient={() => setIsClientModalOpen(true)}
        onOpenMenu={onOpenMenu}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Agenda */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] lg:rounded-[3rem] p-6 sm:p-8 lg:p-10 flex flex-col min-h-[500px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl sm:text-2xl font-[900] text-[#0b2826] tracking-tight italic">Dzisiejszy grafik</h4>
            <div className="w-12 h-12 bg-[#0a0c10] text-[#5dcbb6] rounded-2xl flex items-center justify-center shadow-xl shrink-0"><Calendar size={20} /></div>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {agendaItems.map((booking) => {
              const client = INITIAL_CLIENTS.find(c => c.vehicles.some(v => v.id === booking.vehicleId));
              const vehicle = client?.vehicles.find(v => v.id === booking.vehicleId);
              const isActionable = booking.status !== 'Ukończona' && booking.status !== 'Anulowana';
              return (
                <div 
                  key={booking.id} 
                  onClick={() => handleViewBooking(booking)}
                  className="p-5 sm:p-6 bg-[#f8f9fa] rounded-[2.5rem] border border-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center gap-5 sm:gap-8 hover:bg-white hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between sm:flex-col sm:justify-center sm:min-w-[100px] sm:border-r border-slate-200 sm:pr-8 shrink-0">
                    <span className="text-2xl font-[1000] text-[#0b2826] italic font-mono">{booking.time}</span>
                    <span className="text-[10px] font-black text-[#5dcbb6] uppercase tracking-widest">{booking.date.split('-').reverse().slice(0, 2).join('.')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-lg font-[900] text-[#0b2826] italic truncate">{vehicle?.make} {vehicle?.model}</h5>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">{booking.serviceName}</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="bg-[#0a0c10] text-[#5dcbb6] px-4 py-2 rounded-xl font-mono text-[11px] font-black tracking-widest uppercase">{vehicle?.licensePlate}</div>
                    {isActionable ? (
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); setConfirmation({ id: booking.id, type: 'Ukończona' }); }} className="w-12 h-12 bg-white border border-slate-200 text-emerald-500 rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle2 size={20} /></button>
                        <button onClick={(e) => { e.stopPropagation(); setConfirmation({ id: booking.id, type: 'Anulowana' }); }} className="w-12 h-12 bg-white border border-slate-200 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><XCircle size={20} /></button>
                      </div>
                    ) : (
                      <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${booking.status === 'Ukończona' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}>{booking.status}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Magazyn Mini */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] lg:rounded-[3rem] p-6 sm:p-8 lg:p-10 flex flex-col min-h-[400px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-[900] text-[#0b2826] tracking-tight italic">Magazyn</h4>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${lowStockItems.length > 0 ? 'bg-red-50 text-red-500 border-red-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}><Package size={20} /></div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {inventory.map(item => (
              <div key={item.id} className="p-4 rounded-[1.5rem] bg-slate-50 hover:bg-white border-2 border-transparent hover:border-[#5dcbb6]/20 transition-all cursor-pointer flex items-center justify-between">
                <div>
                  <h5 className="text-[11px] font-[900] text-[#0b2826] italic truncate">{item.name}</h5>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.category}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-[1000] font-mono text-[#0b2826]">{item.stock}<span className="text-[9px] ml-1 opacity-40 uppercase">{item.unit}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wykres */}
      <div className="bg-white rounded-[2.5rem] lg:rounded-[3rem] p-6 sm:p-10 lg:p-14 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
          <div>
             <p className="text-[10px] font-black text-[#5dcbb6] uppercase tracking-[0.4em] mb-2">Finanse Studia</p>
             <h3 className="text-4xl lg:text-5xl font-[1000] text-[#0b2826] tracking-tighter italic">34 500<span className="text-xs font-black text-emerald-500 uppercase ml-2">PLN</span></h3>
          </div>
          <div className="flex p-1 bg-[#f8f9fa] rounded-xl border border-slate-200 h-fit shrink-0">
             <button onClick={() => setRevPeriod('weekly')} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${revPeriod === 'weekly' ? 'bg-[#0a0c10] text-[#5dcbb6]' : 'text-slate-400'}`}>Tydzień</button>
             <button onClick={() => setRevPeriod('monthly')} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${revPeriod === 'monthly' ? 'bg-[#0a0c10] text-[#5dcbb6]' : 'text-slate-400'}`}>Miesiąc</button>
          </div>
        </div>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData}>
              <defs><linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5dcbb6" stopOpacity={0.2}/><stop offset="95%" stopColor="#5dcbb6" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f3f5" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#adb5bd', fontSize: 10, fontWeight: 700}} />
              <Tooltip />
              <Area type="monotone" dataKey="rev" stroke="#5dcbb6" strokeWidth={4} fill="url(#colorEmerald)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Potwierdzenie statusu */}
      <Modal isOpen={!!confirmation} onClose={() => setConfirmation(null)} title="Zmień Status">
         <div className="space-y-8">
            <div className="flex items-center gap-6 p-8 bg-slate-50 rounded-[2.5rem]">
               <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${confirmation?.type === 'Ukończona' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}><AlertCircle size={32} /></div>
               <div><p className="text-lg font-[900] text-[#0b2826] italic leading-tight">{confirmation?.type === 'Ukończona' ? 'Zakończyć to zlecenie?' : 'Anulować tę rezerwację?'}</p></div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setConfirmation(null)} className="flex-1 py-5 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest">Wróć</button>
              <button onClick={() => confirmation && handleUpdateStatus(confirmation.id, confirmation.type)} className={`flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl ${confirmation?.type === 'Ukończona' ? 'bg-[#0a0c10] text-[#5dcbb6]' : 'bg-red-500'}`}>Tak</button>
            </div>
         </div>
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

      {/* Booking Modal (Details or Add/Edit) */}
      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title={isEditingBooking ? (selectedBooking ? 'Edytuj' : 'Nowa Rezerwacja') : 'Detale Zlecenia'}>
        {!isEditingBooking && selectedBooking ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
             <div className="p-8 bg-[#0a0c10] rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-[#5dcbb6]"><User size={24} /></div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Klient</p>
                          <h4 className="text-xl font-[1000] text-white italic tracking-tighter">{selectedVehicle?.client.name}</h4>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <a href={`tel:${selectedVehicle?.client.phone}`} className="flex items-center gap-2 text-[#5dcbb6] hover:text-white transition-colors">
                         <Phone size={14} />
                         <span className="text-xs font-black font-mono">{selectedVehicle?.client.phone}</span>
                       </a>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                     <a href={`tel:${selectedVehicle?.client.phone}`} className="w-12 h-12 bg-[#5dcbb6] text-[#0a0c10] rounded-xl flex items-center justify-center active:scale-90 transition-transform"><Phone size={20} /></a>
                     <a href={`sms:${selectedVehicle?.client.phone}`} className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center active:scale-90 transition-transform"><MessageSquare size={20} /></a>
                  </div>
                </div>
             </div>

             <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#5dcbb6] shadow-sm"><Clock size={28} /></div>
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Termin</p>
                      <p className="text-lg font-[1000] text-[#0b2826] italic">{selectedBooking.date} • {selectedBooking.time}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-3xl font-[1000] text-[#0b2826] font-mono leading-none tracking-tighter">{selectedBooking.price.toFixed(2).replace('.', ',')}</p>
                   <p className="text-[9px] font-black text-[#5dcbb6] uppercase mt-1 tracking-widest">PLN Netto</p>
                </div>
             </div>

             <div className="space-y-4">
                <p className="text-[10px] font-black text-[#237e73] uppercase tracking-[0.4em] ml-4">Zakres Prac</p>
                <div className="flex flex-wrap gap-2">
                   {selectedBooking.serviceName.split(', ').map(s => (
                     <span key={s} className="px-5 py-3 bg-[#0a0c10] text-[#5dcbb6] rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md">{s}</span>
                   ))}
                </div>
             </div>

             <div className="flex gap-4 pt-6">
                <button onClick={() => setIsEditingBooking(true)} className="flex-1 py-5 bg-white border-2 border-slate-100 text-[#0b2826] rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"><Edit2 size={18} /> Edytuj</button>
                <button onClick={() => setIsBookingModalOpen(false)} className="flex-1 py-5 bg-[#0a0c10] text-[#5dcbb6] rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Zamknij</button>
             </div>
          </div>
        ) : (
          <form className="space-y-8 pb-10" onSubmit={(e) => { e.preventDefault(); setIsBookingModalOpen(false); }}>
            <div className="space-y-4">
               <label className="text-[10px] font-black text-[#237e73] uppercase tracking-widest ml-4">Pojazd i Klient</label>
               <div className="relative">
                 <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input type="text" placeholder="Szukaj..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-sm outline-none focus:ring-4 focus:ring-[#5dcbb6]/10" />
               </div>
               {clientSearch.trim() && filteredClientResults.map(res => (
                 <button key={res.vehicle.id} type="button" onClick={() => { setSelectedVehicle(res); setClientSearch(''); }} className="w-full p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-[#5dcbb6] transition-all">
                   <div className="text-left"><h5 className="font-black text-[#0b2826] text-sm italic">{res.vehicle.make} {res.vehicle.model}</h5><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{res.client.name}</p></div>
                   <div className="bg-[#0a0c10] text-[#5dcbb6] px-3 py-1.5 rounded-xl font-mono text-[11px] font-black tracking-widest">{res.vehicle.licensePlate}</div>
                 </button>
               ))}
               {selectedVehicle && (
                 <div className="p-6 bg-emerald-50 border-2 border-[#5dcbb6]/30 rounded-[1.5rem] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CarIcon size={24} className="text-[#5dcbb6]" />
                      <div><h5 className="font-black text-[#0b2826] text-sm italic">{selectedVehicle.vehicle.make} {selectedVehicle.vehicle.model}</h5><p className="text-[9px] font-black text-[#237e73] uppercase tracking-widest">{selectedVehicle.client.name}</p></div>
                    </div>
                    <div className="font-mono text-xs font-black text-[#0b2826] whitespace-nowrap">{selectedVehicle.vehicle.licensePlate}</div>
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
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
