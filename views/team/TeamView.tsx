import React, { useState, useEffect, useCallback } from 'react';
import { Plus, User, Phone, Users, Search, Shield, Trash2, Mail, Loader2, RefreshCw } from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import InviteEmployeeModal from './components/InviteEmployeeModal';
import { useEmployees, useInviteEmployee, useChangeEmployeeRole, useRemoveEmployee } from '../../hooks/useEmployees';
import { useToast } from '../../contexts/ToastContext';

import { useClients } from '../../hooks/useClients';
import { useServices } from '../../hooks/useServices';
import { createService } from '../../services/serviceService';
import { createBooking } from '../../services/bookingService';
import { createClient as createClientService } from '../../services/clientService';
import { buildBookingCreateDto } from '../../features/bookings/utils/buildBookingCreateDto';
import { PREDEFINED_SERVICES, BOOKING_STATUSES } from '../../constants';
import { X as XIcon, Clock, MessageSquare, AlertCircle, Calendar, Hash, Wrench, UserPlus, Save, Car as CarIcon, Edit2, Check } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { useClientVehicleSearch } from '../../hooks/useClientVehicleSearch';
import { toggleIdSelection } from '../../utils/selection';

import { BookingResponseDto, ClientResponseDto, EmployeeResponseDto, VehicleInfoDto } from '../../types';
import { useStudio } from '../../contexts/StudioContext';
import Skeleton from '../../components/ui/Skeleton';
import { isOwnerRole } from '../../utils/studioRole';

const ROLES = [
  { id: 1, name: 'Właściciel', color: 'text-amber-600 bg-amber-50', badgeColor: 'bg-amber-500' },
  { id: 2, name: 'Manager', color: 'text-indigo-600 bg-indigo-50', badgeColor: 'bg-indigo-500' },
  { id: 3, name: 'Pracownik', color: 'text-emerald-600 bg-emerald-50', badgeColor: 'bg-emerald-500' },
];

export const TeamView: React.FC<{ onOpenMenu?: () => void }> = ({ onOpenMenu }) => {
  const { data: employees = [], isLoading: loading, refetch } = useEmployees();
  const inviteEmployeeMut = useInviteEmployee();
  const changeEmployeeRoleMut = useChangeEmployeeRole();
  const removeEmployeeMut = useRemoveEmployee();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { addToast } = useToast();
  const { selectedStudio } = useStudio();

  const { data: clients = [], refetch: refetchClients } = useClients();
  const { data: availableServices = [], refetch: refetchServices } = useServices();
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<{ client: ClientResponseDto; vehicle: VehicleInfoDto } | null>(null);
  const [priceInput, setPriceInput] = useState('0,00');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingClientMode, setBookingClientMode] = useState<'existing' | 'new'>('existing');
  const [newBookingClientNip, setNewBookingClientNip] = useState('');
  const [newVehicleBrand, setNewVehicleBrand] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newClientNameForBooking, setNewClientNameForBooking] = useState('');
  const [newClientPhoneForBooking, setNewClientPhoneForBooking] = useState('');
  const [newClientEmailForBooking, setNewClientEmailForBooking] = useState('');
  const [customServiceInput, setCustomServiceInput] = useState('');
  const [selectedTime, setSelectedTime] = useState('08:00');

  const [selectedBooking, setSelectedBooking] = useState<BookingResponseDto | null>(null);
  const [isEditingBooking, setIsEditingBooking] = useState(true);
  const formatTime = (iso: string) => { const d = new Date(iso); return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0'); };
  const confirmStatusUpdate = (
    _e: React.MouseEvent,
    _booking: BookingResponseDto,
    _targetStatus: typeof BOOKING_STATUSES[keyof typeof BOOKING_STATUSES],
  ) => {};


  const isOwner = isOwnerRole(selectedStudio?.role);



  
  const searchResults = useClientVehicleSearch(clients, clientSearch);

  const toggleService = (serviceId: string) => setSelectedServices((selected) => toggleIdSelection(selected, serviceId));

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createClientService({ name: newName, phone: newPhone || null, email: newEmail || null, nip: null });
      setIsClientModalOpen(false); setNewName(''); setNewPhone(''); setNewEmail('');
      addToast('Nowy klient został dodany.', 'success');
      refetchClients();
    } catch (e) {
      addToast('Błąd podczas dodawania klienta.', 'error');
    }
  };

  const handleAddCustomService = async () => {
    const name = customServiceInput.trim();
    if (!name) return;
    try {
      const created = await createService({ name });
      setSelectedServices(prev => [...prev, created.id]);
      setCustomServiceInput('');
      refetchServices();
    } catch (err) {}
  };

  const handleAddNewClientForBooking = async () => {
    if (!newClientNameForBooking || !newClientPhoneForBooking || !newVehiclePlate) {
      addToast('Wypełnij wymagane pola: Imię i Nazwisko, Telefon oraz Numer Rejestracyjny.', 'error');
      return;
    }
    try {
      const createdClient = await createClientService({
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
      refetchClients();
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
      const dto = buildBookingCreateDto({
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

  const onAddBooking = () => {
    setBookingClientMode('existing'); setNewClientNameForBooking(''); setNewClientPhoneForBooking(''); setNewClientEmailForBooking('');
    setNewBookingClientNip(''); setNewVehicleBrand(''); setNewVehicleModel(''); setNewVehiclePlate('');
    setSelectedServices([]); setSelectedVehicle(null); setClientSearch(''); setPriceInput('0,00');
    setSelectedTime('08:00'); setIsBookingModalOpen(true);
  };

  const handleInvite = async (roleId: number, email: string) => {
    try {
      await inviteEmployeeMut.mutateAsync({ email, roleId });
      addToast(`Wysłano zaproszenie na adres ${email}`, 'success');
      setIsInviteModalOpen(false);
    } catch (e) {
      console.error(e);
      addToast('Wystąpił błąd podczas wysyłania zaproszenia.', 'error');
    }
  };

  const handleRoleChange = async (userId: string, newRoleId: number) => {
    try {
      await changeEmployeeRoleMut.mutateAsync({ userId, roleId: newRoleId });
      addToast('Uprawnienia zostały zaktualizowane', 'success');
    } catch (e) {
      console.error(e);
      addToast('Nie udało się zmienić uprawnień.', 'error');
    }
  };

  const handleRemove = async (userId: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tego pracownika ze studia?')) return;
    try {
      await removeEmployeeMut.mutateAsync(userId);
      addToast('Pracownik został pomyślnie usunięty.', 'success');
    } catch (e) {
      console.error(e);
      addToast('Usuwanie nie powiodło się.', 'error');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    (emp.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Removed full-page loading to keep layout static

  return (
    <div className="space-y-8 pb-20">
      <GlobalHeader title="Zespół" subtitle="Zarządzaj Pracownikami w Studiu" onAddBooking={onAddBooking} onAddClient={() => setIsClientModalOpen(true)} onOpenMenu={onOpenMenu} />

      {/* Akcje / Panel Górny */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex-1 relative group max-w-sm">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-light transition-colors" />
          <input
            type="text"
            placeholder="Szukaj osoby..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-8 py-4 bg-white border border-slate-100 rounded-xl font-bold text-sm outline-none shadow-sm focus:border-cream-warm/40 focus:ring-4 focus:ring-cream-warm/20 transition-all text-green-deep placeholder:text-slate-400"
          />
        </div>

        {isOwner && (
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-green-deep text-cream-warm rounded-xl font-semibold text-[11px] uppercase tracking-widest hover:shadow-xl active:scale-95 transition-all"
          >
            <UserPlus size={16} /> Zaproś do Zespołu
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl lg:rounded-2xl p-6 lg:p-8 border border-slate-100 shadow-sm relative z-0">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-green-deep tracking-tight flex items-center gap-3">
            <Users className="text-amber-500" /> Kadra Pracownicza
            <span className="text-xs font-semibold text-slate-400 py-1 px-3 bg-slate-50 rounded-full">{employees.length} OSÓB</span>
          </h3>
          <button onClick={() => refetch()} className="text-slate-400 hover:text-green-deep transition-colors p-2 bg-slate-50 hover:bg-slate-100 rounded-full">
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between h-[180px]">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <Skeleton width="48px" height="48px" className="rounded-2xl shrink-0" />
                    <Skeleton width="80px" height="28px" className="rounded-xl shrink-0" />
                  </div>
                  <Skeleton width="140px" height="22px" className="mb-3 rounded-lg" />
                  <div className="flex items-center gap-2">
                    <Skeleton width="16px" height="16px" className="rounded-md shrink-0" />
                    <Skeleton width="180px" height="14px" className="rounded-md" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <>
              {filteredEmployees.map(emp => {
                const roleDetails = ROLES.find(r => r.id === emp.roleId) || ROLES[2];
                return (
                  <div key={emp.userId} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all group relative overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg" style={{ backgroundColor: '#1a2e1e', color: '#fbf8f1' }}>
                          {(emp.name || emp.email || 'N')[0].toUpperCase()}
                        </div>
                        {isOwner ? (
                          <select
                            value={emp.roleId}
                            onChange={(e) => handleRoleChange(emp.userId, parseInt(e.target.value))}
                            className={`text-[10px] font-bold uppercase tracking-widest pl-3 pr-8 py-2 rounded-xl outline-none cursor-pointer appearance-none ${roleDetails.color} border-none`}
                          >
                            {ROLES.map(r => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-xl ${roleDetails.color}`}>
                            {roleDetails.name}
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-green-deep mb-1 truncate" title={emp.name || emp.email}>
                        {emp.name || emp.email.split('@')[0]}
                      </h4>
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                        <Mail size={12} className="text-green-deep/40" />
                        <span className="truncate">{emp.email}</span>
                      </div>
                    </div>

                    {isOwner && (
                      <div className="border-t border-slate-200 pt-4 mt-6 flex justify-end">
                        <button
                          onClick={() => handleRemove(emp.userId)}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors shrink-0"
                          title="Usuń pracownika"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {filteredEmployees.length === 0 && !loading && (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
              <Users size={32} />
            </div>
            <h4 className="text-lg font-bold text-slate-400">Brak pracowników</h4>
            <p className="text-sm font-semibold text-slate-400 mt-1 max-w-xs mx-auto">
              Zaproś personel, aby zacząć zarządzać studiem.
            </p>
          </div>
        )}
      </div>

      <InviteEmployeeModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInvite}
      />
    

      {/* === MODALS === */}
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
    </div>
  );
};

export default TeamView;

