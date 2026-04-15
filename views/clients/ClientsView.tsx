
import React, { useState, useMemo } from 'react';
import { PREDEFINED_SERVICES, BOOKING_STATUSES } from '../../constants';
import { X as XIcon, Phone, Search, Car as CarIcon, Save, Plus, Check, Edit2, Trash2, Clock, User, MessageSquare, AlertCircle, Calendar, Hash, Wrench, UserPlus } from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { BookingResponseDto, ClientResponseDto, VehicleInfoDto, CreateClientDto, BookingCreateDto } from '../../types';
import { useClients, useCreateClient, useUpdateClient, useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from '../../hooks/useClients';
import { useServices } from '../../hooks/useServices';
import { useClientVehicleSearch } from '../../hooks/useClientVehicleSearch';
import { createService } from '../../services/serviceService';
import { createBooking } from '../../services/bookingService';
import { createVehicle } from '../../services/vehicleService';
import { buildBookingCreateDto } from '../../features/bookings/utils/buildBookingCreateDto';
import { useToast } from '../../contexts/ToastContext';
import { toggleIdSelection } from '../../utils/selection';

const ClientsView: React.FC<{ onOpenMenu?: () => void }> = ({ onOpenMenu }) => {
  const { addToast } = useToast();
  const { data: clients = [], isLoading, refetch: refetchClients } = useClients();
  const { data: availableServices = [], refetch: refetchServices } = useServices();
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

  const [selectedBooking, setSelectedBooking] = useState<BookingResponseDto | null>(null);
  const [isEditingBooking, setIsEditingBooking] = useState(true);
  const [customServiceInput, setCustomServiceInput] = useState('');
  const [selectedTime, setSelectedTime] = useState('08:00');
  const formatTime = (iso: string) => { const d = new Date(iso); return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0'); };
  const confirmStatusUpdate = (
    _e: React.MouseEvent,
    _booking: BookingResponseDto,
    _targetStatus: typeof BOOKING_STATUSES[keyof typeof BOOKING_STATUSES],
  ) => { };

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

  const searchResults = useClientVehicleSearch(clients, clientSearch);

  const toggleService = (serviceId: string) => setSelectedServices((selected) => toggleIdSelection(selected, serviceId));

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


  const handleAddCustomService = async () => {
    const name = customServiceInput.trim();
    if (!name) return;
    try {
      const created = await createService({ name });
      setSelectedServices(prev => [...prev, created.id]);
      setCustomServiceInput('');
      if (refetchServices) refetchServices();
    } catch (err) { }
  };

  const handleAddNewClientForBooking = async () => {
    if (!newClientNameForBooking || !newClientPhoneForBooking || !newVehiclePlate) {
      addToast('Wypełnij wymagane pola: Imię i Nazwisko, Telefon oraz Numer Rejestracyjny.', 'error');
      return;
    }
    try {
      const { createClient } = await import('../../services/clientService');
      const createdClient = await createClient({
        name: newClientNameForBooking,
        phone: newClientPhoneForBooking,
        email: newClientEmailForBooking || null,
        nip: newBookingClientNip || null,
        vehicle: { licensePlate: newVehiclePlate, brand: newVehicleBrand || null, model: newVehicleModel || null },
      });
      const vehicle = createdClient.vehicles?.[0];
      if (vehicle) setSelectedVehicle({ client: createdClient, vehicle });
      setBookingClientMode('existing');
      setNewClientNameForBooking(''); setNewClientPhoneForBooking(''); setNewClientEmailForBooking(''); setNewBookingClientNip('');
      setNewVehicleBrand(''); setNewVehicleModel(''); setNewVehiclePlate('');
      if (refetchClients) refetchClients();
      addToast('Dodano i wybrano nowego klienta.', 'success');
    } catch (err) {
      addToast('Wystąpił błąd', 'error');
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) {
      addToast('Wybierz istniejącego klienta lub dodaj nowego.', 'error');
      return;
    }
    try {
      const dto: BookingCreateDto = buildBookingCreateDto({
        vehicleId: selectedVehicle.vehicle.id,
        clientId: selectedVehicle.client.id,
        date: selectedDate,
        time: selectedTime,
        serviceIds: selectedServices,
        priceInput,
      });
      await createBooking(dto);
      setIsBookingModalOpen(false);
      addToast('Rezerwacja została pomyślnie utworzona.', 'success');
    } catch (err) {
      addToast('Wystąpił błąd podczas tworzenia rezerwacji.', 'error');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 animate-slide-up pb-20">
      <GlobalHeader title="Klienci" subtitle="CRM • Zarządzanie Relacjami" onAddBooking={() => { setBookingClientMode('existing'); setNewClientNameForBooking(''); setNewClientPhoneForBooking(''); setNewClientEmailForBooking(''); setNewBookingClientNip(''); setNewVehicleBrand(''); setNewVehicleModel(''); setNewVehiclePlate(''); setSelectedServices([]); setSelectedVehicle(null); setClientSearch(''); setPriceInput('0,00'); setSelectedTime('08:00'); setIsBookingModalOpen(true); }} onAddClient={() => setIsClientModalOpen(true)} onOpenMenu={onOpenMenu} />

      {/* Search */}
      <div className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-green-deep/30 group-focus-within:text-green-light transition-colors"><Search size={20} strokeWidth={2.5} /></div>
        <input type="text" placeholder="Szukaj klienta, tablicy, modelu..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-14 pr-6 py-5 rounded-[2rem] font-semibold text-base text-green-deep outline-none transition-all focus:border-[rgba(61,107,70,0.3)] focus:shadow-[0_0_0_4px_rgba(61,107,70,0.08),0_4px_16px_-4px_rgba(0,0,0,0.04)]"
          style={{ background: 'white', border: '1px solid rgba(26,46,30,0.07)', boxShadow: '0 4px 16px -4px rgba(0,0,0,0.04)' }}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100" style={{ backgroundColor: 'rgba(245,240,232,0.3)' }}>
                <th className="px-6 py-5 text-[10px] font-bold text-green-deep/60 uppercase tracking-[0.2em] w-[25%] rounded-tl-2xl">Klient</th>
                <th className="px-6 py-5 text-[10px] font-bold text-green-deep/60 uppercase tracking-[0.2em] w-[20%]">Kontakt</th>
                <th className="px-6 py-5 text-[10px] font-bold text-green-deep/60 uppercase tracking-[0.2em] w-[40%]">Pojazdy we flocie</th>
                <th className="px-6 py-5 text-[10px] font-bold text-green-deep/60 uppercase tracking-[0.2em] text-right w-[15%] rounded-tr-2xl">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 text-sm">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skel-${i}`}>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <Skeleton width="44px" height="44px" className="rounded-xl shrink-0" />
                        <Skeleton width="120px" height="20px" className="rounded-md" />
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <Skeleton width="100px" height="14px" className="rounded-md" />
                        <Skeleton width="140px" height="12px" className="rounded-md" />
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        <Skeleton width="110px" height="36px" className="rounded-xl" />
                        <Skeleton width="110px" height="36px" className="rounded-xl" />
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Skeleton width="80px" height="36px" className="rounded-xl ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <p className="text-slate-400 font-semibold">Nie znaleziono klientów.</p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client, idx) => (
                  <tr
                    key={client.id}
                    onClick={() => setViewingClientDetail(client)}
                    className="group hover:bg-[#1a2e1e]/[0.02] cursor-pointer transition-colors"
                  >
                    {/* Klient */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm text-cream-warm shrink-0 shadow-sm transition-transform group-hover:scale-105"
                          style={{ background: 'linear-gradient(135deg, #1a2e1e 0%, #2a4a30 100%)' }}
                        >
                          {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-bold text-green-deep text-base truncate max-w-[200px]">{client.name}</h3>
                          {client.nip && <p className="text-[10px] font-semibold text-green-deep/40 mt-1 uppercase tracking-wider">NIP: {client.nip}</p>}
                        </div>
                      </div>
                    </td>

                    {/* Kontakt */}
                    <td className="px-6 py-4">
                      <div className="space-y-1.5 flex flex-col justify-center">
                        <p className="font-bold text-green-deep/80 text-[13px]">{client.phone || <span className="text-slate-400 font-normal">Brak telefonu</span>}</p>
                        {client.email && <p className="font-semibold text-green-deep/50 text-[11px] max-w-[180px] truncate">{client.email}</p>}
                      </div>
                    </td>

                    {/* Pojazdy */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {client.vehicles.slice(0, 2).map(v => (
                          <div key={v.id} className="flex items-center bg-slate-50 border border-slate-100 rounded-xl pr-1.5 py-1 pl-3 gap-3 transition-colors group-hover:bg-white group-hover:border-slate-200 shadow-sm break-inside-avoid">
                            <span className="font-bold text-green-deep text-[11px] max-w-[100px] truncate">{v.brand} {v.model}</span>
                            <span className="bg-[#1a2e1e] text-cream-warm px-2 py-1 rounded-md font-mono text-[10px] font-bold tracking-widest">{v.licensePlate}</span>
                          </div>
                        ))}
                        {client.vehicles.length > 2 && (
                          <div className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-green-deep/60 text-[10px] tracking-widest uppercase items-center flex">
                            + {client.vehicles.length - 2}
                          </div>
                        )}
                        {client.vehicles.length === 0 && (
                          <span className="text-[11px] font-semibold text-slate-400">Brak pojazdów</span>
                        )}
                      </div>
                    </td>

                    {/* Akcje */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {client.phone && (
                          <a href={`tel:${client.phone}`} onClick={(e) => e.stopPropagation()} className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-deep/5 text-green-deep hover:bg-green-deep hover:text-cream-warm transition-all group/btn shadow-sm">
                            <Phone size={14} className="group-hover/btn:scale-110 transition-transform" />
                          </a>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedClientForDetails(client); setEditData({ id: client.id, name: client.name, email: client.email || '', phone: client.phone || '', nip: client.nip || '' }); }}
                          className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-green-deep border border-slate-100 transition-all group/btn shadow-sm"
                        >
                          <Edit2 size={14} className="group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Client Modal */}
      <Modal isOpen={!!selectedClientForDetails} onClose={() => setSelectedClientForDetails(null)} title="Edytuj Klienta">
        <form onSubmit={handleUpdateClient} className="space-y-6">
          <div className="space-y-2"><label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4">Imię i Nazwisko</label><input type="text" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4">Telefon</label><input type="tel" value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" /></div>
            <div className="space-y-2"><label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4">Email</label><input type="email" value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" /></div>
          </div>
          <button type="submit" className="w-full py-5 bg-green-deep text-cream-warm rounded-2xl font-semibold text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"><Save size={18} /> Zapisz</button>
        </form>
      </Modal>

      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Nowy Klient">
        <form className="space-y-6" onSubmit={handleCreateClient}>
          <div className="space-y-4">
            <input type="text" placeholder="Imię i Nazwisko" required value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" />
            <div className="grid grid-cols-2 gap-4">
              <input type="tel" placeholder="Telefon" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" />
              <input type="email" placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" />
            </div>
          </div>
          <button type="submit" className="w-full py-5 bg-green-deep text-cream-warm rounded-2xl font-semibold text-[10px] uppercase tracking-widest shadow-xl">Załóż Kartę Klienta</button>
        </form>
      </Modal>

      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title={isEditingBooking ? (selectedBooking ? 'Edytuj' : 'Nowa Rezerwacja') : 'Detale Zlecenia'}>
        {!isEditingBooking && selectedBooking ? (
          <div className="space-y-8">
            <div className="p-8 bg-green-deep rounded-2xl border border-white/5 relative overflow-hidden">
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-cream-warm"><User size={24} /></div>
                    <div>
                      <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">Klient</p>
                      <h4 className="text-xl font-normal text-white tracking-tighter">{selectedBooking.client.name}</h4>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    {selectedBooking.client.phone && (
                      <a href={`tel:${selectedBooking.client.phone}`} className="flex items-center gap-2 text-cream-warm hover:text-white transition-colors">
                        <Phone size={14} /><span className="text-l font-semibold font-mono">{selectedBooking.client.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {selectedBooking.client.phone && <a href={`tel:${selectedBooking.client.phone}`} className="w-12 h-12 bg-cream-warm text-green-deep rounded-xl flex items-center justify-center active:scale-90 transition-transform"><Phone size={20} /></a>}
                  {selectedBooking.client.phone && <a href={`sms:${selectedBooking.client.phone}`} className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center active:scale-90 transition-transform"><MessageSquare size={20} /></a>}
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-green-light shadow-sm"><Clock size={28} /></div>
                <div>
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Termin</p>
                  <p className="text-lg font-bold text-green-deep">{new Date(selectedBooking.scheduledAt).toLocaleDateString('pl-PL')} • {formatTime(selectedBooking.scheduledAt)}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-block px-5 py-2.5 rounded-2xl border-2 mb-2 font-bold text-[11px] uppercase tracking-widest`} style={{ color: selectedBooking.statusColor || 'var(--green-deep)', backgroundColor: (selectedBooking.statusColor || 'var(--green-deep)') + '15', borderColor: (selectedBooking.statusColor || 'var(--green-deep)') + '40' }}>
                  {selectedBooking.status}
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-3xl font-extrabold text-green-deep font-mono leading-none tracking-tighter">{((selectedBooking.totalPrice || 0) / 100).toFixed(2).replace('.', ',')}</p>
                  <p className="text-[9px] font-semibold text-green-light uppercase mt-1 tracking-widest">PLN Netto</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-semibold text-green-light uppercase tracking-[0.4em] ml-4">Zakres Prac</p>
              <div className="flex flex-wrap gap-2">
                {selectedBooking.services.map(s => (
                  <span key={s} className="px-5 py-3 bg-green-deep text-cream-warm rounded-xl text-[12px] font-semibold uppercase tracking-widest shadow-md">{s}</span>
                ))}
                {selectedBooking.services.length === 0 && <span className="text-sm text-slate-400">Brak przypisanych usług</span>}
              </div>
            </div>
            {selectedBooking.notes && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-green-light uppercase tracking-[0.4em] ml-4">Notatki</p>
                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl">{selectedBooking.notes}</p>
              </div>
            )}
            <div className="flex gap-4 pt-6">
              {selectedBooking.status === BOOKING_STATUSES.UTWORZONA.name && (
                <>
                  <button onClick={(e) => { confirmStatusUpdate(e, selectedBooking, BOOKING_STATUSES.ZAKONCZONA); setIsBookingModalOpen(false); }} className="flex-1 py-5 bg-emerald-50 text-emerald-600 border border-emerald-100/50 rounded-xl font-semibold text-[11px] uppercase tracking-widest hover:bg-emerald-100 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"><Check size={16} strokeWidth={2.5} /> Zakończ</button>
                  <button onClick={(e) => { confirmStatusUpdate(e, selectedBooking, BOOKING_STATUSES.ANULOWANA); setIsBookingModalOpen(false); }} className="flex-1 py-5 bg-red-50 text-red-500 border border-red-100/50 rounded-xl font-semibold text-[11px] uppercase tracking-widest hover:bg-red-100 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"><XIcon size={16} strokeWidth={2.5} /> Anuluj</button>
                </>
              )}
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className={`py-5 bg-green-deep text-cream-warm rounded-xl font-semibold text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all ${selectedBooking.status === BOOKING_STATUSES.UTWORZONA.name ? 'px-8 flex-none' : 'flex-1'}`}
              >Zamknij</button>
            </div>
          </div>
        ) : (
          <form className="space-y-5 pb-6" onSubmit={handleCreateBooking}>

            {/* ── Pojazd i Klient ────────────────────────────── */}
            <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white" style={{ boxShadow: '0 8px 20px rgba(26,46,30,0.12)' }}>
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-deep rounded-xl flex items-center justify-center shrink-0">
                    <CarIcon size={14} className="text-cream-warm" />
                  </div>
                  <p className="text-[11px] font-bold text-green-deep uppercase tracking-widest">Pojazd i Klient</p>
                </div>
                <div className="flex bg-slate-50 p-1 rounded-xl">
                  <button type="button" onClick={() => setBookingClientMode('existing')} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${bookingClientMode === 'existing' ? 'bg-green-deep text-cream-warm shadow-sm' : 'text-slate-400 hover:text-green-deep'}`}>Wyszukaj</button>
                  <button type="button" onClick={() => setBookingClientMode('new')} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${bookingClientMode === 'new' ? 'bg-green-deep text-cream-warm shadow-sm' : 'text-slate-400 hover:text-green-deep'}`}>Dodaj Nowy</button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {bookingClientMode === 'existing' ? (
                  <>
                    <div className="relative">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Szukaj klienta lub pojazdu..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl font-semibold text-sm outline-none focus:border-cream-warm/50 transition-all" />
                    </div>
                    {/* Wyniki wyszukiwania – zawsze w DOM, animacja CSS height */}
                    <div style={{
                      height: clientSearch.trim() ? '130px' : '0px',
                      opacity: clientSearch.trim() ? 1 : 0,
                      transition: 'height 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      overflow: 'hidden',
                    }}>
                      <div className="overflow-y-auto custom-scrollbar rounded-xl h-full">
                        {searchResults.length === 0 ? (
                          <div className="h-full flex items-center justify-center">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Brak wyników</p>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {searchResults.map(res => (
                              <button key={res.vehicle.id} type="button" onClick={() => { setSelectedVehicle(res); setClientSearch(''); }} className="w-full p-3.5 bg-white border-2 border-slate-100 rounded-xl flex items-center justify-between hover:border-cream-warm/60 hover:shadow-sm transition-all">
                                <div className="text-left"><h5 className="font-bold text-green-deep text-sm">{res.vehicle.brand} {res.vehicle.model}</h5><p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">{res.client.name}</p></div>
                                <div className="bg-green-deep text-cream-warm px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold tracking-widest">{res.vehicle.licensePlate}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedVehicle && (
                      <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: 'rgba(232,168,48,0.08)', border: '2px solid rgba(232,168,48,0.3)' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-amber/15 rounded-xl flex items-center justify-center shrink-0">
                            <CarIcon size={16} className="text-amber" />
                          </div>
                          <div><h5 className="font-bold text-green-deep text-sm">{selectedVehicle.vehicle.brand} {selectedVehicle.vehicle.model}</h5><p className="text-[9px] font-semibold text-green-light uppercase tracking-widest mt-0.5">{selectedVehicle.client.name}</p></div>
                        </div>
                        <div className="bg-green-deep text-cream-warm px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold tracking-widest">{selectedVehicle.vehicle.licensePlate}</div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2.5">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dane Klienta</p>
                      <input type="text" placeholder="Imię i Nazwisko *" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-semibold text-sm focus:border-cream-warm/50 transition-all" />
                      <div className="grid grid-cols-2 gap-2.5">
                        <input type="tel" placeholder="Telefon *" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-semibold text-sm focus:border-cream-warm/50 transition-all" />
                        <input type="email" placeholder="Email (opcjonalnie)" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-semibold text-sm focus:border-cream-warm/50 transition-all" />
                      </div>
                      <input type="text" placeholder="NIP (opcjonalnie)" value={newBookingClientNip} onChange={e => setNewBookingClientNip(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-semibold text-sm focus:border-cream-warm/50 transition-all" />
                    </div>
                    <div className="space-y-2.5 pt-3 border-t border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dane Pojazdu</p>
                      <div className="grid grid-cols-2 gap-2.5">
                        <input type="text" placeholder="Marka" value={newVehicleBrand} onChange={e => setNewVehicleBrand(e.target.value)} className="px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-semibold text-sm focus:border-cream-warm/50 transition-all" />
                        <input type="text" placeholder="Model" value={newVehicleModel} onChange={e => setNewVehicleModel(e.target.value)} className="px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-semibold text-sm focus:border-cream-warm/50 transition-all" />
                      </div>
                      <input type="text" placeholder="Nr Rejestracyjny *" value={newVehiclePlate} onChange={e => setNewVehiclePlate(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-semibold text-sm focus:border-cream-warm/50 transition-all uppercase" />
                    </div>
                    <button type="button" onClick={handleAddNewClientForBooking} className="w-full py-3.5 bg-green-deep text-cream-warm rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                      <UserPlus size={15} strokeWidth={2.5} /> Dodaj Klienta i Wybierz
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Sekcja Usług ───────────────────────────────── */}
            <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white" style={{ boxShadow: '0 8px 20px rgba(26,46,30,0.12)' }}>
              {/* Nagłówek sekcji */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-deep rounded-xl flex items-center justify-center shrink-0">
                    <Wrench size={14} className="text-cream-warm" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-green-deep uppercase tracking-widest leading-none">Wybierz Usługi</p>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                      {selectedServices.length === 0 ? 'Nic nie wybrano' : `${selectedServices.length} ${selectedServices.length === 1 ? 'wybrana' : 'wybranych'}`}
                    </p>
                  </div>
                </div>
                {selectedServices.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: '#1a2e1e' }}>
                    <Check size={10} strokeWidth={3} className="text-cream-warm" />
                    <span className="text-[9px] font-bold text-cream-warm tracking-widest">{selectedServices.length}</span>
                  </div>
                )}
              </div>

              {/* Siatka usług */}
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableServices.map(svc => {
                  const isSelected = selectedServices.includes(svc.id);
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => toggleService(svc.id)}
                      className="group relative flex items-center gap-2.5 p-3 rounded-xl text-left transition-all duration-200 active:scale-[0.97]"
                      style={isSelected
                        ? { background: '#1a2e1e', border: '2px solid transparent', boxShadow: '0 4px 12px rgba(26,46,30,0.2)' }
                        : { background: '#f8f9fa', border: '2px solid transparent' }
                      }
                    >
                      {/* Checkbox indicator */}
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
                        style={isSelected
                          ? { background: 'rgba(245,240,232,0.15)', border: '1.5px solid rgba(245,240,232,0.4)' }
                          : { background: 'white', border: '1.5px solid rgba(0,0,0,0.12)' }
                        }
                      >
                        {isSelected && <Check size={10} strokeWidth={3.5} className="text-cream-warm" />}
                      </div>
                      {/* Nazwa usługi */}
                      <span
                        className="text-[10px] font-bold uppercase tracking-wide leading-tight line-clamp-2"
                        style={{ color: isSelected ? '#f5f0e8' : '#2d4f33' }}
                      >
                        {svc.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dodaj niestandardową usługę */}
              <div className="px-4 pb-4 flex gap-2">
                <input
                  type="text"
                  value={customServiceInput}
                  onChange={e => setCustomServiceInput(e.target.value)}
                  placeholder="Dodaj inną usługę..."
                  className="flex-1 px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-semibold text-sm focus:border-cream-warm/50 transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddCustomService}
                  className="w-12 h-12 bg-green-deep text-cream-warm rounded-xl flex items-center justify-center shadow-md active:scale-95 transition-all hover:shadow-lg shrink-0"
                >
                  <Plus size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* ── Termin i Cena ──────────────────────────────── */}
            <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white" style={{ boxShadow: '0 8px 20px rgba(26,46,30,0.12)' }}>
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(232,168,48,0.12)' }}>
                  <Calendar size={14} className="text-amber" />
                </div>
                <p className="text-[11px] font-bold text-green-deep uppercase tracking-widest">Termin i Cena</p>
              </div>
              <div className="p-4 grid grid-cols-3 gap-3">
                {/* Cena */}
                <div className="col-span-1 flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Cena netto</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={priceInput}
                      onChange={e => setPriceInput(e.target.value)}
                      className="w-full px-4 py-4 rounded-xl font-bold text-lg font-mono text-cream-warm outline-none border-none"
                      style={{ background: '#1a2e1e' }}
                    />
                    <span className="absolute right-3 bottom-3.5 text-[9px] font-bold text-cream-warm/40 uppercase tracking-widest">ZŁ</span>
                  </div>
                </div>
                {/* Data */}
                <div className="col-span-1 flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Data</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent rounded-xl font-bold text-sm outline-none focus:border-cream-warm/50 transition-all text-green-deep"
                  />
                </div>
                {/* Godzina */}
                <div className="col-span-1 flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Godzina</label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={e => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent rounded-xl font-bold text-sm outline-none focus:border-cream-warm/50 transition-all text-green-deep"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-5 bg-green-deep text-cream-warm rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 hover:shadow-2xl">
              <Save size={16} strokeWidth={2.5} /> Zapisz Rezerwację
            </button>
          </form>
        )}
      </Modal>
      {/* Client Details View Modal */}
      <Modal isOpen={!!activeClientDetail} onClose={() => setViewingClientDetail(null)} title="Karta Klienta">
        {activeClientDetail && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6">
            <div className="p-8 bg-green-deep rounded-[2.5rem] border border-white/5 relative overflow-hidden">
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-white/10 text-cream-warm rounded-[2rem] flex items-center justify-center font-extrabold text-4xl shadow-xl shrink-0">
                    {activeClientDetail.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-cream-warm/60 uppercase tracking-widest mb-1">Klient</p>
                    <h3 className="font-extrabold text-white text-3xl tracking-tight truncate">{activeClientDetail.name}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-cream-warm shrink-0"><Phone size={16} /></div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold text-cream-warm/50 uppercase tracking-wider">Telefon</p>
                      <p className="font-semibold text-white truncate">{activeClientDetail.phone || 'Brak'}</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-cream-warm shrink-0"><Search size={16} /></div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold text-cream-warm/50 uppercase tracking-wider">Email</p>
                      <p className="font-semibold text-white truncate">{activeClientDetail.email || 'Brak'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <h4 className="text-sm font-bold text-green-deep uppercase tracking-widest">Pojazdy we flocie</h4>
                  <div className="px-3 py-1 bg-cream-warm/30 text-green-deep rounded-lg font-bold text-xs">
                    {activeClientDetail.vehicles.length}
                  </div>
                </div>
                <button
                  onClick={() => { setEditingVehicleId(null); setVehicleFormData({ brand: '', model: '', licensePlate: '' }); setIsVehicleModalOpen(true); }}
                  className="px-4 py-2 bg-white border border-slate-200 text-green-deep rounded-xl font-bold text-[10px] uppercase tracking-widest hover:border-green-deep/20 transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm"
                >
                  <Plus size={14} /> Dodaj Pojazd
                </button>
              </div>

              <div className="space-y-4">
                {activeClientDetail.vehicles.length > 0 ? (
                  activeClientDetail.vehicles.map(v => (
                    <div key={v.id} className="bg-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between shadow-sm border border-slate-100 gap-4 group hover:border-cream-warm transition-all">
                      <div className="flex items-center gap-5 min-w-0">
                        <div className="w-12 h-12 bg-slate-50 group-hover:bg-cream-warm/20 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-green-light transition-colors shrink-0">
                          <CarIcon size={24} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-green-deep text-lg block truncate">{v.brand} {v.model}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="bg-green-deep text-cream-warm px-4 py-2.5 rounded-xl font-mono text-sm font-bold text-center shadow-md">
                          {v.licensePlate}
                        </div>
                        <button onClick={() => { setEditingVehicleId(v.id); setVehicleFormData({ brand: v.brand || '', model: v.model || '', licensePlate: v.licensePlate }); setIsVehicleModalOpen(true); }} className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 rounded-xl hover:text-green-deep hover:bg-cream-warm/20 hover:border-cream-warm/40 transition-all"><Edit2 size={16} /></button>
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
                className="w-full py-5 bg-white border-2 border-slate-100 text-green-deep rounded-2xl font-bold text-xs uppercase tracking-widest hover:border-green-deep transition-all flex items-center justify-center gap-2"
              >
                <Edit2 size={16} /> Edytuj Klienta
              </button>
              {activeClientDetail.phone ? (
                <a href={`tel:${activeClientDetail.phone}`} className="w-full py-5 bg-green-deep text-cream-warm rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-[#0a1c18] transition-all">
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
          <button type="submit" className="w-full py-5 bg-green-deep text-cream-warm rounded-2xl font-semibold text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"><Save size={18} /> Zapisz Pojazd</button>
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
