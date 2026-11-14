import React, { useState, useMemo, useEffect } from 'react';
import { PREDEFINED_SERVICES } from '../../constants';
import {
  X as XIcon,
  Phone,
  Search,
  Car as CarIcon,
  Save,
  Plus,
  Check,
  Edit2,
  Trash2,
  Clock,
  User,
  MessageSquare,
  AlertCircle,
  Calendar,
  Hash,
  Wrench,
  UserPlus,
} from 'lucide-react';
import GlobalHeader from '@/shared/ui/GlobalHeader';
import Modal from '@/shared/ui/Modal';
import Skeleton from '@/shared/ui/Skeleton';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import CreateClientModal from '../../components/modals/CreateClientModal';
import CreateBookingModal from '@/features/bookings/components/CreateBookingModal';
import VehicleModal from '../../components/modals/VehicleModal';
import { ClientResponseDto, VehicleInfoDto, CreateClientDto } from '../../types';
import {
  useClients,
  useCreateClient,
  useUpdateClient,
  useCreateVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
} from '../../hooks/useClients';
import { useServices } from '../../hooks/useServices';
import { useClientVehicleSearch } from '../../hooks/useClientVehicleSearch';
import { createService } from '../../services/serviceService';
import { createVehicle } from '../../services/vehicleService';
import { BOOKING_STATUSES, buildBookingCreateDto, type Booking, type BookingStatus } from '@/features/bookings';
import { formatPln } from '@/shared/lib/money';
import { useToast } from '@/shared/ui/ToastContext';
import { toggleIdSelection } from '@/shared/lib/selection';
import { getApiErrorMessage } from '@/shared/lib/errorHandler';

const ClientsView: React.FC = () => {
  const { addToast } = useToast();
  const { data: clients = [], isLoading, refetch: refetchClients } = useClients();
  const { data: availableServices = [], refetch: refetchServices } = useServices();
  const updateClientMutation = useUpdateClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
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
  const [selectedVehicle, setSelectedVehicle] = useState<{ client: ClientResponseDto; vehicle: VehicleInfoDto } | null>(
    null,
  );
  const [priceInput, setPriceInput] = useState('0,00');

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isEditingBooking, setIsEditingBooking] = useState(true);
  const [customServiceInput, setCustomServiceInput] = useState('');
  const [selectedTime, setSelectedTime] = useState('08:00');

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearchQuery(searchQuery), 140);
    return () => clearTimeout(timeout);
  }, [searchQuery]);
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  };
  const confirmStatusUpdate = (_e: React.MouseEvent, _booking: Booking, _targetStatus: BookingStatus) => {};

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

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
    return viewingClientDetail ? clients.find((c) => c.id === viewingClientDetail.id) || viewingClientDetail : null;
  }, [viewingClientDetail, clients]);

  const filteredClients = useMemo(() => {
    const q = debouncedSearchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        c.vehicles.some(
          (v) =>
            v.licensePlate.toLowerCase().includes(q) ||
            (v.brand || '').toLowerCase().includes(q) ||
            (v.model || '').toLowerCase().includes(q),
        ),
    );
  }, [debouncedSearchQuery, clients]);

  const searchResults = useClientVehicleSearch(clients, clientSearch);

  const toggleService = (serviceId: string) =>
    setSelectedServices((selected) => toggleIdSelection(selected, serviceId));

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
      setSelectedServices((prev) => [...prev, created.id]);
      setCustomServiceInput('');
      if (refetchServices) refetchServices();
    } catch (err) {
      addToast(getApiErrorMessage(err, 'Nie udało się dodać usługi.'), 'error');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 animate-slide-up pb-20">
      <GlobalHeader
        title="Klienci"
        subtitle="CRM • Zarządzanie Relacjami"
        onAddBooking={() => {
          setIsEditingBooking(true);
          setSelectedBooking(null);
          setIsBookingModalOpen(true);
        }}
        onAddClient={() => setIsClientModalOpen(true)}
      />

      {/* Search */}
      <div className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-green-deep/30 group-focus-within:text-green-light transition-colors">
          <Search size={20} strokeWidth={2.5} />
        </div>
        <input
          type="text"
          placeholder="Szukaj klienta, tablicy, modelu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-14 pr-6 py-5 rounded-[2rem] font-semibold text-base text-green-deep outline-none transition-all focus:border-[rgba(61,107,70,0.3)] focus:shadow-[0_0_0_4px_rgba(61,107,70,0.08),0_4px_16px_-4px_rgba(0,0,0,0.04)]"
          style={{
            background: 'white',
            border: '1px solid rgba(26,46,30,0.07)',
            boxShadow: '0 4px 16px -4px rgba(0,0,0,0.04)',
          }}
        />
      </div>

      <div
        className={`bg-white rounded-2xl border border-slate-100 overflow-hidden transition-opacity duration-200 ${searchQuery !== debouncedSearchQuery ? 'opacity-70' : 'opacity-100'}`}
        style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}
      >
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100" style={{ backgroundColor: 'rgba(245,240,232,0.3)' }}>
                <th className="px-6 py-5 text-[10px] font-bold text-green-deep/60 uppercase tracking-[0.2em] w-[25%] rounded-tl-2xl">
                  Klient
                </th>
                <th className="px-6 py-5 text-[10px] font-bold text-green-deep/60 uppercase tracking-[0.2em] w-[20%]">
                  Kontakt
                </th>
                <th className="px-6 py-5 text-[10px] font-bold text-green-deep/60 uppercase tracking-[0.2em] w-[40%]">
                  Pojazdy we flocie
                </th>
                <th className="px-6 py-5 text-[10px] font-bold text-green-deep/60 uppercase tracking-[0.2em] text-right w-[15%] rounded-tr-2xl">
                  Akcje
                </th>
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
                          {client.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-bold text-green-deep text-base truncate max-w-[200px]">{client.name}</h3>
                          {client.nip && (
                            <p className="text-[10px] font-semibold text-green-deep/40 mt-1 uppercase tracking-wider">
                              NIP: {client.nip}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Kontakt */}
                    <td className="px-6 py-4">
                      <div className="space-y-1.5 flex flex-col justify-center">
                        <p className="font-bold text-green-deep/80 text-[13px]">
                          {client.phone || <span className="text-slate-400 font-normal">Brak telefonu</span>}
                        </p>
                        {client.email && (
                          <p className="font-semibold text-green-deep/50 text-[11px] max-w-[180px] truncate">
                            {client.email}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Pojazdy */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {client.vehicles.slice(0, 2).map((v) => (
                          <div
                            key={v.id}
                            className="flex items-center bg-slate-50 border border-slate-100 rounded-xl pr-1.5 py-1 pl-3 gap-3 transition-colors group-hover:bg-white group-hover:border-slate-200 shadow-sm break-inside-avoid"
                          >
                            <span className="font-bold text-green-deep text-[11px] max-w-[100px] truncate">
                              {v.brand} {v.model}
                            </span>
                            <span className="bg-[#1a2e1e] text-cream-warm px-2 py-1 rounded-md font-mono text-[10px] font-bold tracking-widest">
                              {v.licensePlate}
                            </span>
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
                          <a
                            href={`tel:${client.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-deep/5 text-green-deep hover:bg-green-deep hover:text-cream-warm transition-all group/btn shadow-sm"
                          >
                            <Phone size={14} className="group-hover/btn:scale-110 transition-transform" />
                          </a>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClientForDetails(client);
                          }}
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

      <CreateClientModal
        isOpen={!!selectedClientForDetails}
        onClose={() => setSelectedClientForDetails(null)}
        clientToEdit={selectedClientForDetails}
      />

      <CreateClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} />

      <Modal
        isOpen={isBookingModalOpen && !isEditingBooking}
        onClose={() => setIsBookingModalOpen(false)}
        title="Detale Zlecenia"
      >
        {selectedBooking && (
          <div className="space-y-8">
            <div className="p-8 bg-green-deep rounded-2xl border border-white/5 relative overflow-hidden">
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-cream-warm">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">Klient</p>
                      <h4 className="text-xl font-normal text-white tracking-tighter">{selectedBooking.client.name}</h4>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    {selectedBooking.client.phone && (
                      <a
                        href={`tel:${selectedBooking.client.phone}`}
                        className="flex items-center gap-2 text-cream-warm hover:text-white transition-colors"
                      >
                        <Phone size={14} />
                        <span className="text-l font-semibold font-mono">{selectedBooking.client.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {selectedBooking.client.phone && (
                    <a
                      href={`tel:${selectedBooking.client.phone}`}
                      className="w-12 h-12 bg-cream-warm text-green-deep rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <Phone size={20} />
                    </a>
                  )}
                  {selectedBooking.client.phone && (
                    <a
                      href={`sms:${selectedBooking.client.phone}`}
                      className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <MessageSquare size={20} />
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-green-light shadow-sm">
                  <Clock size={28} />
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Termin</p>
                  <p className="text-lg font-bold text-green-deep">
                    {new Date(selectedBooking.scheduledAt).toLocaleDateString('pl-PL')} •{' '}
                    {formatTime(selectedBooking.scheduledAt)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`inline-block px-5 py-2.5 rounded-2xl border-2 mb-2 font-bold text-[11px] uppercase tracking-widest`}
                  style={{
                    color: selectedBooking.statusColor || 'var(--green-deep)',
                    backgroundColor: (selectedBooking.statusColor || 'var(--green-deep)') + '15',
                    borderColor: (selectedBooking.statusColor || 'var(--green-deep)') + '40',
                  }}
                >
                  {selectedBooking.status}
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-3xl font-extrabold text-green-deep font-mono leading-none tracking-tighter">
                    {formatPln(selectedBooking.totalPrice)}
                  </p>
                  <p className="text-[9px] font-semibold text-green-light uppercase mt-1 tracking-widest">PLN Netto</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-semibold text-green-light uppercase tracking-[0.4em] ml-4">Zakres Prac</p>
              <div className="flex flex-wrap gap-2">
                {selectedBooking.services.map((s) => (
                  <span
                    key={s}
                    className="px-5 py-3 bg-green-deep text-cream-warm rounded-xl text-[12px] font-semibold uppercase tracking-widest shadow-md"
                  >
                    {s}
                  </span>
                ))}
                {selectedBooking.services.length === 0 && (
                  <span className="text-sm text-slate-400">Brak przypisanych usług</span>
                )}
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
                  <button
                    onClick={(e) => {
                      confirmStatusUpdate(e, selectedBooking, BOOKING_STATUSES.ZAKONCZONA);
                      setIsBookingModalOpen(false);
                    }}
                    className="flex-1 py-5 bg-emerald-50 text-emerald-600 border border-emerald-100/50 rounded-xl font-semibold text-[11px] uppercase tracking-widest hover:bg-emerald-100 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Check size={16} strokeWidth={2.5} /> Zakończ
                  </button>
                  <button
                    onClick={(e) => {
                      confirmStatusUpdate(e, selectedBooking, BOOKING_STATUSES.ANULOWANA);
                      setIsBookingModalOpen(false);
                    }}
                    className="flex-1 py-5 bg-red-50 text-red-500 border border-red-100/50 rounded-xl font-semibold text-[11px] uppercase tracking-widest hover:bg-red-100 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <XIcon size={16} strokeWidth={2.5} /> Anuluj
                  </button>
                </>
              )}
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className={`py-5 bg-green-deep text-cream-warm rounded-xl font-semibold text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all ${selectedBooking.status === BOOKING_STATUSES.UTWORZONA.name ? 'px-8 flex-none' : 'flex-1'}`}
              >
                Zamknij
              </button>
            </div>
          </div>
        )}
      </Modal>

      <CreateBookingModal
        isOpen={isBookingModalOpen && isEditingBooking}
        onClose={() => {
          setIsBookingModalOpen(false);
          if (refetchClients) refetchClients();
        }}
      />
      {/* Client Details View Modal */}
      <Modal isOpen={!!activeClientDetail} onClose={() => setViewingClientDetail(null)} title="Karta Klienta">
        {activeClientDetail && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6">
            <div className="p-8 bg-green-deep rounded-[2.5rem] border border-white/5 relative overflow-hidden">
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-white/10 text-cream-warm rounded-[2rem] flex items-center justify-center font-extrabold text-4xl shadow-xl shrink-0">
                    {activeClientDetail.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-cream-warm uppercase tracking-widest mb-1">Klient</p>
                    <h3 className="font-extrabold text-white text-3xl tracking-tight truncate">
                      {activeClientDetail.name}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-cream-warm shrink-0">
                      <Phone size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold text-cream-warm uppercase tracking-wider">Telefon</p>
                      <p className="font-semibold text-white truncate">{activeClientDetail.phone || 'Brak'}</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-cream-warm shrink-0">
                      <Search size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold text-cream-warm uppercase tracking-wider">Email</p>
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
                  onClick={() => {
                    setEditingVehicleId(null);
                    setIsVehicleModalOpen(true);
                  }}
                  className="px-4 py-2 bg-white border border-slate-200 text-green-deep rounded-xl font-bold text-[10px] uppercase tracking-widest hover:border-green-deep/20 transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm"
                >
                  <Plus size={14} /> Dodaj Pojazd
                </button>
              </div>

              <div className="space-y-4">
                {activeClientDetail.vehicles.length > 0 ? (
                  activeClientDetail.vehicles.map((v) => (
                    <div
                      key={v.id}
                      className="bg-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between shadow-sm border border-slate-100 gap-4 group hover:border-cream-warm transition-all"
                    >
                      <div className="flex items-center gap-5 min-w-0">
                        <div className="w-12 h-12 bg-slate-50 group-hover:bg-cream-warm/20 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-green-light transition-colors shrink-0">
                          <CarIcon size={24} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-green-deep text-lg block truncate">
                            {v.brand} {v.model}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="bg-green-deep text-cream-warm px-4 py-2.5 rounded-xl font-mono text-sm font-bold text-center shadow-md">
                          {v.licensePlate}
                        </div>
                        <button
                          onClick={() => {
                            setEditingVehicleId(v.id);
                            setIsVehicleModalOpen(true);
                          }}
                          className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 rounded-xl hover:text-green-deep hover:bg-cream-warm/20 hover:border-cream-warm/40 transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmation(v.id)}
                          className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 rounded-xl hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-semibold text-sm">
                      Klient nie posiada jeszcze dodanych pojazdów.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setViewingClientDetail(null);
                  setSelectedClientForDetails(activeClientDetail);
                }}
                className="w-full py-5 bg-white border-2 border-slate-100 text-green-deep rounded-2xl font-bold text-xs uppercase tracking-widest hover:border-green-deep transition-all flex items-center justify-center gap-2"
              >
                <Edit2 size={16} /> Edytuj Klienta
              </button>
              {activeClientDetail.phone ? (
                <a
                  href={`tel:${activeClientDetail.phone}`}
                  className="w-full py-5 bg-green-deep text-cream-warm rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-[#0a1c18] transition-all"
                >
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

      {activeClientDetail && (
        <VehicleModal
          isOpen={isVehicleModalOpen}
          onClose={() => setIsVehicleModalOpen(false)}
          clientId={activeClientDetail.id}
          vehicleToEdit={activeClientDetail.vehicles.find((v) => v.id === editingVehicleId)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirmation} onClose={() => setDeleteConfirmation(null)} title="Usuń pojazd">
        <div className="text-center space-y-6 pb-4">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={32} />
          </div>
          <p className="text-slate-600 font-medium">
            Czy na pewno chcesz usunąć ten pojazd? Tej operacji nie można cofnąć, a dane zostaną trwale utracone.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <button
              onClick={() => setDeleteConfirmation(null)}
              className="py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all"
            >
              Anuluj
            </button>
            <button
              onClick={executeDeleteVehicle}
              className="py-4 bg-red-500 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all"
            >
              Usuń pojazd
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default ClientsView;
