
import React, { useState, useMemo } from 'react';
import { INITIAL_CLIENTS, PREDEFINED_SERVICES } from '../constants';
import { 
  Phone, 
  Mail, 
  Search, 
  ChevronRight, 
  MessageSquare, 
  Car as CarIcon,
  Fingerprint,
  Paintbrush,
  IdCard,
  X,
  User,
  Save,
  Plus,
  Hash,
  Briefcase,
  AtSign,
  Check,
  ChevronLeft,
  UserPlus,
  Calendar as CalendarIcon,
  Edit2
} from 'lucide-react';
import GlobalHeader from '../components/GlobalHeader';
import { Client, Vehicle, Booking } from '../types';

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

const ClientsView: React.FC<{ onOpenMenu?: () => void }> = ({ onOpenMenu }) => {
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<Client | null>(null);
  const [selectedClientForVehicle, setSelectedClientForVehicle] = useState<Client | null>(null);
  const [selectedVehicleForEdit, setSelectedVehicleForEdit] = useState<{client: Client, vehicle: Vehicle} | null>(null);

  // Modal States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  
  // Booking Form States
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState<{client: Client, vehicle: Vehicle} | null>(null);
  const [priceInput, setPriceInput] = useState('0,00');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [customServiceInput, setCustomServiceInput] = useState('');

  const [editClientData, setEditClientData] = useState<Omit<Client, 'vehicles'>>({
    id: '', name: '', email: '', phone: '', nip: ''
  });

  const filteredClients = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return clients.filter(client => 
      client.name.toLowerCase().includes(query) ||
      client.phone.includes(query) ||
      client.email.toLowerCase().includes(query) ||
      client.vehicles.some(v => 
        v.licensePlate.toLowerCase().includes(query) || 
        v.make.toLowerCase().includes(query) || 
        v.model.toLowerCase().includes(query)
      )
    );
  }, [searchQuery, clients]);

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

  const handleOpenDetails = (client: Client) => {
    setSelectedClientForDetails(client);
    setEditClientData({ id: client.id, name: client.name, email: client.email, phone: client.phone, nip: client.nip || '' });
  };

  const handleUpdateClient = (e: React.FormEvent) => {
    e.preventDefault();
    setClients(prev => prev.map(c => c.id === editClientData.id ? { ...c, ...editClientData } : c));
    setSelectedClientForDetails(null);
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
        title="Klienci" 
        subtitle="CRM Active • Zarządzanie Relacjami" 
        onAddBooking={handleOpenNewBooking}
        onAddClient={() => setIsClientModalOpen(true)}
        onOpenMenu={onOpenMenu}
      />

      <div className="relative group">
        <div className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#5dcbb6] transition-colors">
          <Search size={22} strokeWidth={3} />
        </div>
        <input 
          type="text"
          placeholder="Szukaj klienta, tablicy, modelu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-16 pr-10 py-6 bg-white border border-slate-200 rounded-[2.5rem] font-bold text-base text-[#0b2826] outline-none focus:ring-8 focus:ring-[#5dcbb6]/5 focus:border-[#5dcbb6]/40 transition-all shadow-sm"
        />
      </div>

      <div className="space-y-6">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white border border-slate-100 rounded-[3rem] p-8 lg:p-10 hover:shadow-2xl transition-all group overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-10 lg:items-start">
              <div className="lg:w-1/3 space-y-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-[#0a0c10] text-[#5dcbb6] rounded-[1.5rem] flex items-center justify-center font-[1000] text-xl italic shadow-xl shrink-0">
                    {client.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-[1000] text-[#0b2826] text-xl tracking-tighter italic truncate">{client.name}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{client.phone}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${client.phone}`} className="flex-1 py-4 bg-[#0a0c10] text-[#5dcbb6] rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"><Phone size={14} /> Zadzwoń</a>
                  <button onClick={() => handleOpenDetails(client)} className="p-4 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-[#5dcbb6] transition-all"><Edit2 size={18} className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                {client.vehicles.map(v => (
                  <div key={v.id} onClick={() => setSelectedVehicleForEdit({ client, vehicle: v })} className="bg-[#f8f9fa] p-4 rounded-2xl flex items-center justify-between hover:bg-white border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300"><CarIcon size={18} /></div>
                      <h5 className="font-[900] text-[#0b2826] text-base italic">{v.make} {v.model}</h5>
                    </div>
                    <div className="bg-[#0a0c10] text-[#5dcbb6] px-4 py-1.5 rounded-lg font-mono text-[11px] font-black tracking-widest">{v.licensePlate}</div>
                  </div>
                ))}
                <button onClick={() => setSelectedClientForVehicle(client)} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#5dcbb6] hover:border-[#5dcbb6] transition-all flex items-center justify-center gap-2"><Plus size={14} /> Dodaj Pojazd</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={!!selectedClientForDetails} onClose={() => setSelectedClientForDetails(null)} title="Edytuj Klienta">
        <form onSubmit={handleUpdateClient} className="space-y-6">
          <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Imię i Nazwisko</label><input type="text" value={editClientData.name} onChange={e => setEditClientData({...editClientData, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Telefon</label><input type="tel" value={editClientData.phone} onChange={e => setEditClientData({...editClientData, phone: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" /></div>
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email</label><input type="email" value={editClientData.email} onChange={e => setEditClientData({...editClientData, email: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" /></div>
          </div>
          <button type="submit" className="w-full py-5 bg-[#0a0c10] text-[#5dcbb6] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"><Save size={18} /> Zapisz Zmiany</button>
        </form>
      </Modal>

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
    </div>
  );
};

export default ClientsView;
