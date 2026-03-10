
import React, { useState, useMemo } from 'react';
import { PREDEFINED_SERVICES } from '../../constants';
import { Phone, Search, Car as CarIcon, Save, Plus, Check, Edit2, Trash2 } from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ClientResponseDto, VehicleInfoDto, CreateClientDto, BookingCreateDto } from '../../types';
import { useClients, useCreateClient, useUpdateClient, useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from '../../hooks/useClients';
import { createBooking } from '../../services/bookingService';
import { createVehicle } from '../../services/vehicleService';
import { useToast } from '../../contexts/ToastContext';

const ClientsView: React.FC<{ onOpenMenu?: () => void }> = ({ onOpenMenu }) => {
  const { addToast } = useToast();
  const { data: clients = [], isLoading } = useClients();
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<ClientResponseDto | null>(null);
  const [viewingClientDetail, setViewingClientDetail] = useState<ClientResponseDto | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [vehicleFormData, setVehicleFormData] = useState({ brand: '', model: '', licensePlate: '' });
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<{ client: ClientResponseDto, vehicle: VehicleInfoDto } | null>(null);
  const [priceInput, setPriceInput] = useState('0,00');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editData, setEditData] = useState({ id: '', name: '', email: '', phone: '', nip: '' });
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newNip, setNewNip] = useState('');

  const [bookingClientMode, setBookingClientMode] = useState<'existing' | 'new'>('existing');
  const [newBookingClientNip, setNewBookingClientNip] = useState('');
  const [newVehicleBrand, setNewVehicleBrand] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  const [newClientNameForBooking, setNewClientNameForBooking] = useState('');
  const [newClientPhoneForBooking, setNewClientPhoneForBooking] = useState('');
  const [newClientEmailForBooking, setNewClientEmailForBooking] = useState('');

  const createVehicleMut = useCreateVehicle();
  const updateVehicleMut = useUpdateVehicle();
  const deleteVehicleMut = useDeleteVehicle();

  const activeClientDetail = useMemo(() => {
    return viewingClientDetail ? clients.find(c => c.id === viewingClientDetail.id) || viewingClientDetail : null;
  }, [viewingClientDetail, clients]);

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
    try {
      await updateClientMutation.mutateAsync({ id: editData.id, dto: { name: editData.name, email: editData.email || null, phone: editData.phone || null, nip: editData.nip || null } });
      setSelectedClientForDetails(null);
      addToast('Dane klienta zostały zaktualizowane.', 'success');
    } catch (e) { console.error(e); addToast('Błąd podczas aktualizacji klienta.', 'error'); }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createClientMutation.mutateAsync({ name: newName, phone: newPhone || null, email: newEmail || null, nip: newNip || null });
      setIsClientModalOpen(false); setNewName(''); setNewPhone(''); setNewEmail(''); setNewNip('');
      addToast('Nowy klient został dodany.', 'success');
    } catch (e) { console.error(e); addToast('Błąd podczas dodawania klienta.', 'error'); }
  };

  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClientDetail) return;
    try {
      if (editingVehicleId) {
        await updateVehicleMut.mutateAsync({
          id: editingVehicleId,
          dto: {
            clientId: activeClientDetail.id,
            brand: vehicleFormData.brand || null,
            model: vehicleFormData.model || null,
            licensePlate: vehicleFormData.licensePlate
          }
        });
        addToast('Dane pojazdu zostały zaktualizowane.', 'success');
      } else {
        await createVehicleMut.mutateAsync({ clientId: activeClientDetail.id, brand: vehicleFormData.brand || null, model: vehicleFormData.model || null, licensePlate: vehicleFormData.licensePlate });
        addToast('Nowy pojazd został dodany do floty.', 'success');
      }
      setIsVehicleModalOpen(false);
    } catch (e) { console.error(e); addToast('Wystąpił błąd podczas zapisywania pojazdu.', 'error'); }
  };

  const executeDeleteVehicle = async () => {
    if (!deleteConfirmation) return;
    try {
      await deleteVehicleMut.mutateAsync(deleteConfirmation);
      addToast('Pojazd został usunięty.', 'success');
    } catch (e) {
      console.error(e);
      addToast('Błąd podczas usuwania pojazdu.', 'error');
    } finally {
      setDeleteConfirmation(null);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalClientId = '';
      let finalVehicleId = '';

      if (bookingClientMode === 'new') {
        if (!newClientNameForBooking || !newClientPhoneForBooking || !newVehiclePlate) {
          addToast('Wypełnij wymagane pola: Imię i Nazwisko, Telefon oraz Numer Rejestracyjny.', 'error');
          return;
        }
        const createdClient = await createClientMutation.mutateAsync({
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
          addToast('Wybierz istniejącego klienta lub dodaj nowego.', 'error');
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
      addToast('Rezerwacja została pomyślnie utworzona.', 'success');
    } catch (e) {
      console.error(e);
      addToast('Wystąpił błąd podczas tworzenia rezerwacji.', 'error');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <GlobalHeader title="Klienci" subtitle="CRM Active • Zarządzanie Relacjami" onAddBooking={() => { setBookingClientMode('existing'); setNewClientNameForBooking(''); setNewClientPhoneForBooking(''); setNewClientEmailForBooking(''); setNewBookingClientNip(''); setNewVehicleBrand(''); setNewVehicleModel(''); setNewVehiclePlate(''); setSelectedServices([]); setSelectedVehicle(null); setClientSearch(''); setPriceInput('0,00'); setIsBookingModalOpen(true); }} onAddClient={() => setIsClientModalOpen(true)} onOpenMenu={onOpenMenu} />
      <div className="relative group">
        <div className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#5A8A7A] transition-colors"><Search size={22} strokeWidth={3} /></div>
        <input type="text" placeholder="Szukaj klienta, tablicy, modelu..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-16 pr-10 py-6 bg-white border border-slate-200 rounded-[2.5rem] font-bold text-base text-[#102C26] outline-none focus:ring-8 focus:ring-[#F7E7CE]/20 focus:border-[#F7E7CE]/40 transition-all shadow-sm" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {filteredClients.map((client, idx) => (
          <div key={client.id} onClick={() => setViewingClientDetail(client)} className="bg-white border border-slate-100 rounded-[3rem] p-8 lg:p-10 hover:shadow-2xl transition-all group flex flex-col cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${idx * 50}ms` }}>
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-[#102C26] text-[#F7E7CE] rounded-[1.5rem] flex items-center justify-center font-extrabold text-2xl shadow-lg shrink-0">{client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold text-[#102C26] text-2xl tracking-tight truncate">{client.name}</h3>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mt-1 truncate">{client.phone || 'Brak telefonu'}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setSelectedClientForDetails(client); setEditData({ id: client.id, name: client.name, email: client.email || '', phone: client.phone || '', nip: client.nip || '' }); }} className="w-14 h-14 flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl hover:text-[#102C26] hover:bg-[#F7E7CE]/20 hover:border-[#F7E7CE]/40 transition-all shrink-0"><Edit2 size={24} /></button>
            </div>

            <div className="flex-1 bg-slate-50 rounded-[2rem] p-6 lg:p-8 border border-slate-100/50 mb-8">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 mb-4">Pojazdy ({client.vehicles.length})</h4>
              <div className="space-y-3">
                {client.vehicles.slice(0, 3).map(v => (
                  <div key={v.id} className="bg-white p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between shadow-sm border border-slate-100 gap-3">
                    <div className="flex items-center gap-4 min-w-0">
                      <CarIcon size={18} className="text-slate-400 shrink-0" />
                      <span className="font-bold text-[#102C26] text-base truncate">{v.brand} {v.model}</span>
                    </div>
                    <span className="bg-slate-50 text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold shrink-0 text-center">{v.licensePlate}</span>
                  </div>
                ))}
                {client.vehicles.length > 3 && (
                  <div className="text-center pt-3">
                    <span className="text-xs font-bold text-[#5A8A7A] uppercase tracking-widest">+ {client.vehicles.length - 3} więcej</span>
                  </div>
                )}
                {client.vehicles.length === 0 && <p className="text-sm text-slate-400 text-center py-6 font-semibold">Brak dodanych pojazdów</p>}
              </div>
            </div>

            <div className="mt-auto">
              {client.phone ? (
                <a href={`tel:${client.phone}`} onClick={(e) => e.stopPropagation()} className="w-full py-5 lg:py-6 bg-[#102C26] text-[#F7E7CE] rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#0a1c18] hover:shadow-xl transition-all"><Phone size={18} /> Zadzwoń do klienta</a>
              ) : (
                <div onClick={(e) => e.stopPropagation()} className="w-full py-5 lg:py-6 bg-slate-50 text-slate-300 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 border border-slate-100 border-dashed cursor-not-allowed"><Phone size={18} /> Brak numeru</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Client Modal */}
      <Modal isOpen={!!selectedClientForDetails} onClose={() => setSelectedClientForDetails(null)} title="Edytuj Klienta">
        <form onSubmit={handleUpdateClient} className="space-y-6">
          <div className="space-y-2"><label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4">Imię i Nazwisko</label><input type="text" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4">Telefon</label><input type="tel" value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" /></div>
            <div className="space-y-2"><label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4">Email</label><input type="email" value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" /></div>
          </div>
          <button type="submit" className="w-full py-5 bg-[#102C26] text-[#F7E7CE] rounded-2xl font-semibold text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"><Save size={18} /> Zapisz</button>
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
          <button type="submit" className="w-full py-5 bg-[#102C26] text-[#F7E7CE] rounded-2xl font-semibold text-[10px] uppercase tracking-widest shadow-xl">Załóż Kartę Klienta</button>
        </form>
      </Modal>

      {/* Booking Modal */}
      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title="Nowa Rezerwacja">
        <form className="space-y-8 pb-10" onSubmit={handleCreateBooking}>
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
                <div className="relative"><Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Szukaj..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-sm outline-none" /></div>
                {clientSearch.trim() && searchResults.map(r => (
                  <button key={r.vehicle.id} type="button" onClick={() => { setSelectedVehicle(r); setClientSearch(''); }} className="w-full p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-[#F7E7CE] transition-all">
                    <div className="text-left"><h5 className="font-semibold text-[#102C26] text-sm">{r.vehicle.brand} {r.vehicle.model}</h5><p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">{r.client.name}</p></div>
                    <div className="bg-[#102C26] text-[#F7E7CE] px-3 py-1.5 rounded-xl font-mono text-[11px] font-semibold">{r.vehicle.licensePlate}</div>
                  </button>
                ))}
                {selectedVehicle && <div className="p-6 bg-[#F7E7CE]/20 border-2 border-[#F7E7CE]/30 rounded-[1.5rem] flex items-center justify-between"><div className="flex items-center gap-4"><CarIcon size={24} className="text-[#5A8A7A]" /><div><h5 className="font-semibold text-[#102C26] text-sm">{selectedVehicle.vehicle.brand} {selectedVehicle.vehicle.model}</h5><p className="text-[9px] font-semibold text-[#5A8A7A] uppercase tracking-widest">{selectedVehicle.client.name}</p></div></div><span className="font-mono text-xs font-semibold">{selectedVehicle.vehicle.licensePlate}</span></div>}
              </>
            ) : (
              <div className="space-y-4 bg-slate-50 p-6 rounded-[1.5rem] mt-2 border border-slate-100">
                <div className="space-y-3">
                  <h5 className="font-semibold text-[#102C26] text-xs uppercase tracking-widest mb-3">Dane Klienta</h5>
                  <input type="text" placeholder="Imię i Nazwisko *" required value={newClientNameForBooking} onChange={e => setNewClientNameForBooking(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#F7E7CE]/50" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="tel" placeholder="Telefon *" required value={newClientPhoneForBooking} onChange={e => setNewClientPhoneForBooking(e.target.value)} className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#F7E7CE]/50" />
                    <input type="email" placeholder="Email (opcjonalnie)" value={newClientEmailForBooking} onChange={e => setNewClientEmailForBooking(e.target.value)} className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#F7E7CE]/50" />
                  </div>
                  <input type="text" placeholder="NIP (opcjonalnie)" value={newBookingClientNip} onChange={e => setNewBookingClientNip(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#F7E7CE]/50" />
                </div>
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <h5 className="font-semibold text-[#102C26] text-xs uppercase tracking-widest mb-3">Dane Pojazdu</h5>
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
            <label className="text-[10px] font-semibold text-[#5A8A7A] uppercase tracking-widest ml-4">Usługi</label>
            <div className="flex flex-wrap gap-2">{PREDEFINED_SERVICES.slice(0, 6).map(s => (<button key={s} type="button" onClick={() => toggleService(s)} className={`px-4 py-3 rounded-xl text-[9px] font-semibold uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${selectedServices.includes(s) ? 'bg-[#102C26] text-[#F7E7CE] border-[#102C26]' : 'bg-slate-50 text-slate-400 border-transparent'}`}>{selectedServices.includes(s) && <Check size={12} strokeWidth={4} />} {s}</button>))}</div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2"><label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4">Cena</label><input type="text" value={priceInput} onChange={e => setPriceInput(e.target.value)} className="w-full px-6 py-5 bg-[#102C26] text-[#F7E7CE] border-none rounded-[1.5rem] font-semibold text-xl font-mono" /></div>
            <div className="space-y-2"><label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4">Data</label><input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-sm outline-none" /></div>
          </div>
          <button type="submit" className="w-full py-6 bg-[#102C26] text-[#F7E7CE] rounded-[1.5rem] font-semibold text-[11px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"><Save size={18} /> Zapisz</button>
        </form>
      </Modal>
      {/* Client Details View Modal */}
      <Modal isOpen={!!activeClientDetail} onClose={() => setViewingClientDetail(null)} title="Karta Klienta">
        {activeClientDetail && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6">
            <div className="p-8 bg-[#102C26] rounded-[2.5rem] border border-white/5 relative overflow-hidden">
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-white/10 text-[#F7E7CE] rounded-[2rem] flex items-center justify-center font-extrabold text-4xl shadow-xl shrink-0">
                    {activeClientDetail.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-[#F7E7CE]/60 uppercase tracking-widest mb-1">Klient</p>
                    <h3 className="font-extrabold text-white text-3xl tracking-tight truncate">{activeClientDetail.name}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-[#F7E7CE] shrink-0"><Phone size={16} /></div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold text-[#F7E7CE]/50 uppercase tracking-wider">Telefon</p>
                      <p className="font-semibold text-white truncate">{activeClientDetail.phone || 'Brak'}</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-[#F7E7CE] shrink-0"><Search size={16} /></div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold text-[#F7E7CE]/50 uppercase tracking-wider">Email</p>
                      <p className="font-semibold text-white truncate">{activeClientDetail.email || 'Brak'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <h4 className="text-sm font-bold text-[#102C26] uppercase tracking-widest">Pojazdy we flocie</h4>
                  <div className="px-3 py-1 bg-[#F7E7CE]/30 text-[#102C26] rounded-lg font-bold text-xs">
                    {activeClientDetail.vehicles.length}
                  </div>
                </div>
                <button
                  onClick={() => { setEditingVehicleId(null); setVehicleFormData({ brand: '', model: '', licensePlate: '' }); setIsVehicleModalOpen(true); }}
                  className="px-4 py-2 bg-white border border-slate-200 text-[#102C26] rounded-xl font-bold text-[10px] uppercase tracking-widest hover:border-[#102C26]/20 transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm"
                >
                  <Plus size={14} /> Dodaj Pojazd
                </button>
              </div>

              <div className="space-y-4">
                {activeClientDetail.vehicles.length > 0 ? (
                  activeClientDetail.vehicles.map(v => (
                    <div key={v.id} className="bg-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between shadow-sm border border-slate-100 gap-4 group hover:border-[#F7E7CE] transition-all">
                      <div className="flex items-center gap-5 min-w-0">
                        <div className="w-12 h-12 bg-slate-50 group-hover:bg-[#F7E7CE]/20 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-[#5A8A7A] transition-colors shrink-0">
                          <CarIcon size={24} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-[#102C26] text-lg block truncate">{v.brand} {v.model}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="bg-[#102C26] text-[#F7E7CE] px-4 py-2.5 rounded-xl font-mono text-sm font-bold text-center shadow-md">
                          {v.licensePlate}
                        </div>
                        <button onClick={() => { setEditingVehicleId(v.id); setVehicleFormData({ brand: v.brand || '', model: v.model || '', licensePlate: v.licensePlate }); setIsVehicleModalOpen(true); }} className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 rounded-xl hover:text-[#102C26] hover:bg-[#F7E7CE]/20 hover:border-[#F7E7CE]/40 transition-all"><Edit2 size={16} /></button>
                        <button onClick={() => setDeleteConfirmation(v.id)} className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 rounded-xl hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-semibold text-sm">Klient nie posiada jeszcze dodanych pojazdów.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setViewingClientDetail(null);
                  setSelectedClientForDetails(activeClientDetail);
                  setEditData({ id: activeClientDetail.id, name: activeClientDetail.name, email: activeClientDetail.email || '', phone: activeClientDetail.phone || '', nip: activeClientDetail.nip || '' });
                }}
                className="w-full py-5 bg-white border-2 border-slate-100 text-[#102C26] rounded-2xl font-bold text-xs uppercase tracking-widest hover:border-[#102C26] transition-all flex items-center justify-center gap-2"
              >
                <Edit2 size={16} /> Edytuj Klienta
              </button>
              {activeClientDetail.phone ? (
                <a href={`tel:${activeClientDetail.phone}`} className="w-full py-5 bg-[#102C26] text-[#F7E7CE] rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-[#0a1c18] transition-all">
                  <Phone size={16} /> Zadzwoń
                </a>
              ) : (
                <div className="w-full py-5 bg-slate-50 text-slate-300 border border-slate-100 border-dashed rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed">
                  <Phone size={16} /> Brak numeru
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Vehicle Manage Modal */}
      <Modal isOpen={isVehicleModalOpen} onClose={() => setIsVehicleModalOpen(false)} title={editingVehicleId ? "Edytuj Pojazd" : "Nowy Pojazd"}>
        <form className="space-y-6" onSubmit={handleVehicleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Marka" value={vehicleFormData.brand} onChange={e => setVehicleFormData({ ...vehicleFormData, brand: e.target.value })} className="px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" />
              <input type="text" placeholder="Model" value={vehicleFormData.model} onChange={e => setVehicleFormData({ ...vehicleFormData, model: e.target.value })} className="px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" />
            </div>
            <input type="text" placeholder="Nr Rejestracyjny *" required value={vehicleFormData.licensePlate} onChange={e => setVehicleFormData({ ...vehicleFormData, licensePlate: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm uppercase" />
          </div>
          <button type="submit" className="w-full py-5 bg-[#102C26] text-[#F7E7CE] rounded-2xl font-semibold text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"><Save size={18} /> Zapisz Pojazd</button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirmation} onClose={() => setDeleteConfirmation(null)} title="Usuń pojazd">
        <div className="text-center space-y-6 pb-4">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={32} />
          </div>
          <p className="text-slate-600 font-medium">Czy na pewno chcesz usunąć ten pojazd? Tej operacji nie można cofnąć, a dane zostaną trwale utracone.</p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <button onClick={() => setDeleteConfirmation(null)} className="py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all">Anuluj</button>
            <button onClick={executeDeleteVehicle} className="py-4 bg-red-500 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all">Usuń pojazd</button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
export default ClientsView;
