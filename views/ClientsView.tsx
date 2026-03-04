
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { PREDEFINED_SERVICES } from '../constants';
import { Phone, Search, Car as CarIcon, X, User, Save, Plus, Check, Edit2 } from 'lucide-react';
import GlobalHeader from '../components/GlobalHeader';
import { ClientResponseDto, VehicleInfoDto, CreateClientDto, BookingCreateDto } from '../types';
import { getClients, createClient, updateClient } from '../services/clientService';
import { createBooking } from '../services/bookingService';
import { createVehicle } from '../services/vehicleService';

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

const ClientsView: React.FC<{ onOpenMenu?: () => void }> = ({ onOpenMenu }) => {
  const [clients, setClients] = useState<ClientResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<ClientResponseDto | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<{ client: ClientResponseDto, vehicle: VehicleInfoDto } | null>(null);
  const [priceInput, setPriceInput] = useState('0,00');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [customServiceInput, setCustomServiceInput] = useState('');
  const [editData, setEditData] = useState({ id: '', name: '', email: '', phone: '', nip: '' });
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newNip, setNewNip] = useState('');

  // Nwe states for Booking modal form
  const [bookingClientMode, setBookingClientMode] = useState<'existing' | 'new'>('existing');
  const [newBookingClientNip, setNewBookingClientNip] = useState('');
  const [newVehicleBrand, setNewVehicleBrand] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  const [newClientNameForBooking, setNewClientNameForBooking] = useState('');
  const [newClientPhoneForBooking, setNewClientPhoneForBooking] = useState('');
  const [newClientEmailForBooking, setNewClientEmailForBooking] = useState('');

  const fetchClients = useCallback(async () => {
    try {
      const cPromise = getClients(undefined, (c) => { setClients(c); setLoading(false); });
      setClients(await cPromise);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchClients(); }, [fetchClients]);

  const filteredClients = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return clients.filter(c => c.name.toLowerCase().includes(q) || (c.phone || '').includes(q) || (c.email || '').toLowerCase().includes(q) ||
      c.vehicles.some(v => v.licensePlate.toLowerCase().includes(q) || (v.brand || '').toLowerCase().includes(q) || (v.model || '').toLowerCase().includes(q)));
  }, [searchQuery, clients]);

  const searchResults = useMemo(() => {
    if (!clientSearch.trim()) return [];
    const q = clientSearch.toLowerCase();
    const r: { client: ClientResponseDto, vehicle: VehicleInfoDto }[] = [];
    clients.forEach(c => c.vehicles.forEach(v => {
      if (c.name.toLowerCase().includes(q) || (v.brand || '').toLowerCase().includes(q) || (v.model || '').toLowerCase().includes(q) || v.licensePlate.toLowerCase().includes(q))
        r.push({ client: c, vehicle: v });
    }));
    return r.slice(0, 5);
  }, [clientSearch, clients]);

  const toggleService = (s: string) => setSelectedServices(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await updateClient(editData.id, { name: editData.name, email: editData.email || null, phone: editData.phone || null, nip: editData.nip || null }); setSelectedClientForDetails(null); fetchClients(); } catch (e) { console.error(e); }
  };
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await createClient({ name: newName, phone: newPhone || null, email: newEmail || null, nip: newNip || null }); setIsClientModalOpen(false); setNewName(''); setNewPhone(''); setNewEmail(''); setNewNip(''); fetchClients(); } catch (e) { console.error(e); }
  };
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalClientId = '';
      let finalVehicleId = '';

      if (bookingClientMode === 'new') {
        if (!newClientNameForBooking || !newClientPhoneForBooking || !newVehiclePlate) {
          alert('Wypełnij wymagane pola: Imię i Nazwisko, Telefon oraz Numer Rejestracyjny.');
          return;
        }
        const createdClient = await createClient({
          name: newClientNameForBooking,
          phone: newClientPhoneForBooking,
          email: newClientEmailForBooking || null,
          nip: newBookingClientNip || null,
        });
        finalClientId = createdClient.id;

        const createdVehicle = await createVehicle({
          clientId: finalClientId,
          licensePlate: newVehiclePlate,
          brand: newVehicleBrand || null,
          model: newVehicleModel || null,
        });
        finalVehicleId = createdVehicle.id;
      } else {
        if (!selectedVehicle) {
          alert('Wybierz istniejącego klienta lub dodaj nowego.');
          return;
        }
        finalClientId = selectedVehicle.client.id;
        finalVehicleId = selectedVehicle.vehicle.id;
      }

      await createBooking({
        vehicleId: finalVehicleId,
        clientId: finalClientId,
        scheduledAt: new Date(`${selectedDate}T08:00`).toISOString(),
        price: parseFloat(priceInput.replace(',', '.')),
        notes: null
      });
      setIsBookingModalOpen(false);
      fetchClients();
    } catch (e) {
      console.error(e);
      alert('Wystąpił błąd podczas tworzenia rezerwacji.');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-[#102C26] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <GlobalHeader title="Klienci" subtitle="CRM Active • Zarządzanie Relacjami" onAddBooking={() => { setBookingClientMode('existing'); setNewClientNameForBooking(''); setNewClientPhoneForBooking(''); setNewClientEmailForBooking(''); setNewBookingClientNip(''); setNewVehicleBrand(''); setNewVehicleModel(''); setNewVehiclePlate(''); setSelectedServices([]); setSelectedVehicle(null); setClientSearch(''); setPriceInput('0,00'); setIsBookingModalOpen(true); }} onAddClient={() => setIsClientModalOpen(true)} onOpenMenu={onOpenMenu} />
      <div className="relative group">
        <div className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#5A8A7A] transition-colors"><Search size={22} strokeWidth={3} /></div>
        <input type="text" placeholder="Szukaj klienta, tablicy, modelu..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-16 pr-10 py-6 bg-white border border-slate-200 rounded-[2.5rem] font-bold text-base text-[#102C26] outline-none focus:ring-8 focus:ring-[#F7E7CE]/20 focus:border-[#F7E7CE]/40 transition-all shadow-sm" />
      </div>
      <div className="space-y-6">
        {filteredClients.map(client => (
          <div key={client.id} className="bg-white border border-slate-100 rounded-[3rem] p-8 lg:p-10 hover:shadow-2xl transition-all group overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-10 lg:items-start">
              <div className="lg:w-1/3 space-y-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-[#102C26] text-[#F7E7CE] rounded-[1.5rem] flex items-center justify-center font-[1000] text-xl italic shadow-xl shrink-0">{client.name.split(' ').map(n => n[0]).join('')}</div>
                  <div className="min-w-0"><h3 className="font-[1000] text-[#102C26] text-xl tracking-tighter italic truncate">{client.name}</h3><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{client.phone || 'Brak telefonu'}</p></div>
                </div>
                <div className="flex gap-2">
                  {client.phone && <a href={`tel:${client.phone}`} className="flex-1 py-4 bg-[#102C26] text-[#F7E7CE] rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95"><Phone size={14} /> Zadzwoń</a>}
                  <button onClick={() => { setSelectedClientForDetails(client); setEditData({ id: client.id, name: client.name, email: client.email || '', phone: client.phone || '', nip: client.nip || '' }); }} className="p-4 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-[#5A8A7A] transition-all"><Edit2 size={18} /></button>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                {client.vehicles.map(v => (
                  <div key={v.id} className="bg-[#f8f9fa] p-4 rounded-2xl flex items-center justify-between hover:bg-white border border-transparent hover:border-slate-100 transition-all">
                    <div className="flex items-center gap-4"><div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300"><CarIcon size={18} /></div><h5 className="font-[900] text-[#102C26] text-base italic">{v.brand} {v.model}</h5></div>
                    <div className="bg-[#102C26] text-[#F7E7CE] px-4 py-1.5 rounded-lg font-mono text-[11px] font-black tracking-widest">{v.licensePlate}</div>
                  </div>
                ))}
                {client.vehicles.length === 0 && <p className="text-sm text-slate-400 italic text-center py-4">Brak pojazdów</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Client Modal */}
      <Modal isOpen={!!selectedClientForDetails} onClose={() => setSelectedClientForDetails(null)} title="Edytuj Klienta">
        <form onSubmit={handleUpdateClient} className="space-y-6">
          <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Imię i Nazwisko</label><input type="text" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Telefon</label><input type="tel" value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" /></div>
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email</label><input type="email" value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" /></div>
          </div>
          <button type="submit" className="w-full py-5 bg-[#102C26] text-[#F7E7CE] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"><Save size={18} /> Zapisz</button>
        </form>
      </Modal>

      {/* New Client Modal */}
      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Nowy Klient">
        <form className="space-y-6" onSubmit={handleCreateClient}>
          <input type="text" placeholder="Imię i Nazwisko" required value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" />
          <div className="grid grid-cols-2 gap-4">
            <input type="tel" placeholder="Telefon" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" />
            <input type="email" placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" />
          </div>
          <button type="submit" className="w-full py-5 bg-[#102C26] text-[#F7E7CE] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Załóż Kartę Klienta</button>
        </form>
      </Modal>

      {/* Booking Modal */}
      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title="Nowa Rezerwacja">
        <form className="space-y-8 pb-10" onSubmit={handleCreateBooking}>
          <div className="space-y-4">
            <div className="flex items-center justify-between ml-4 mb-2">
              <label className="text-[10px] font-black text-[#5A8A7A] uppercase tracking-widest">Pojazd i Klient</label>
              <div className="flex bg-slate-50 p-1 rounded-xl">
                <button type="button" onClick={() => setBookingClientMode('existing')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${bookingClientMode === 'existing' ? 'bg-[#102C26] text-[#F7E7CE]' : 'text-slate-400 hover:text-[#102C26]'}`}>Wyszukaj</button>
                <button type="button" onClick={() => setBookingClientMode('new')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${bookingClientMode === 'new' ? 'bg-[#102C26] text-[#F7E7CE]' : 'text-slate-400 hover:text-[#102C26]'}`}>Dodaj Nowy</button>
              </div>
            </div>

            {bookingClientMode === 'existing' ? (
              <>
                <div className="relative"><Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Szukaj..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-sm outline-none" /></div>
                {clientSearch.trim() && searchResults.map(r => (
                  <button key={r.vehicle.id} type="button" onClick={() => { setSelectedVehicle(r); setClientSearch(''); }} className="w-full p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-[#F7E7CE] transition-all">
                    <div className="text-left"><h5 className="font-black text-[#102C26] text-sm italic">{r.vehicle.brand} {r.vehicle.model}</h5><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{r.client.name}</p></div>
                    <div className="bg-[#102C26] text-[#F7E7CE] px-3 py-1.5 rounded-xl font-mono text-[11px] font-black">{r.vehicle.licensePlate}</div>
                  </button>
                ))}
                {selectedVehicle && <div className="p-6 bg-[#F7E7CE]/20 border-2 border-[#F7E7CE]/30 rounded-[1.5rem] flex items-center justify-between"><div className="flex items-center gap-4"><CarIcon size={24} className="text-[#5A8A7A]" /><div><h5 className="font-black text-[#102C26] text-sm italic">{selectedVehicle.vehicle.brand} {selectedVehicle.vehicle.model}</h5><p className="text-[9px] font-black text-[#5A8A7A] uppercase tracking-widest">{selectedVehicle.client.name}</p></div></div><span className="font-mono text-xs font-black">{selectedVehicle.vehicle.licensePlate}</span></div>}
              </>
            ) : (
              <div className="space-y-4 bg-slate-50 p-6 rounded-[1.5rem] mt-2 border border-slate-100">
                <div className="space-y-3">
                  <h5 className="font-black text-[#102C26] text-xs uppercase tracking-widest mb-3">Dane Klienta</h5>
                  <input type="text" placeholder="Imię i Nazwisko *" required value={newClientNameForBooking} onChange={e => setNewClientNameForBooking(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#F7E7CE]/50" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="tel" placeholder="Telefon *" required value={newClientPhoneForBooking} onChange={e => setNewClientPhoneForBooking(e.target.value)} className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#F7E7CE]/50" />
                    <input type="email" placeholder="Email (opcjonalnie)" value={newClientEmailForBooking} onChange={e => setNewClientEmailForBooking(e.target.value)} className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#F7E7CE]/50" />
                  </div>
                  <input type="text" placeholder="NIP (opcjonalnie)" value={newBookingClientNip} onChange={e => setNewBookingClientNip(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#F7E7CE]/50" />
                </div>
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <h5 className="font-black text-[#102C26] text-xs uppercase tracking-widest mb-3">Dane Pojazdu</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Marka" value={newVehicleBrand} onChange={e => setNewVehicleBrand(e.target.value)} className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#F7E7CE]/50" />
                    <input type="text" placeholder="Model" value={newVehicleModel} onChange={e => setNewVehicleModel(e.target.value)} className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#F7E7CE]/50" />
                  </div>
                  <input type="text" placeholder="Nr Rejestracyjny *" required value={newVehiclePlate} onChange={e => setNewVehiclePlate(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#F7E7CE]/50 uppercase" />
                </div>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-[#5A8A7A] uppercase tracking-widest ml-4">Usługi</label>
            <div className="flex flex-wrap gap-2">{PREDEFINED_SERVICES.slice(0, 6).map(s => (<button key={s} type="button" onClick={() => toggleService(s)} className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${selectedServices.includes(s) ? 'bg-[#102C26] text-[#F7E7CE] border-[#102C26]' : 'bg-slate-50 text-slate-400 border-transparent'}`}>{selectedServices.includes(s) && <Check size={12} strokeWidth={4} />} {s}</button>))}</div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Cena</label><input type="text" value={priceInput} onChange={e => setPriceInput(e.target.value)} className="w-full px-6 py-5 bg-[#102C26] text-[#F7E7CE] border-none rounded-[1.5rem] font-black text-xl font-mono" /></div>
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Data</label><input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-sm outline-none" /></div>
          </div>
          <button type="submit" className="w-full py-6 bg-[#102C26] text-[#F7E7CE] rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"><Save size={18} /> Zapisz</button>
        </form>
      </Modal>
    </div>
  );
};
export default ClientsView;
