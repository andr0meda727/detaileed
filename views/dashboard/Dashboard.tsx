
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar, Package, Car as CarIcon, X, Plus, TrendingUp, AlertCircle, Search, CheckCircle2, XCircle, Check,
  User, UserPlus, Phone, Mail, MessageSquare, Edit2, Save, Clock, Users, DollarSign, Wrench, ArrowRight,
  Shield, Droplets, CircleDot, Activity, CreditCard, ChevronRight, Star, Zap, BarChart3,
  AlertTriangle, Timer, UserCheck, Clipboard
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { BookingResponseDto, InventoryResponseDto, ViewType, ClientResponseDto, VehicleInfoDto, BookingCreateDto, CreateClientDto, ServiceResponseDto } from '../../types';
import { BOOKING_STATUSES } from '../../constants';
import { getBookings, createBooking, updateBooking, completeBooking, cancelBooking } from '../../services/bookingService';
import { getClients, createClient } from '../../services/clientService';
import { createVehicle } from '../../services/vehicleService';
import { getInventory } from '../../services/inventoryService';
import { getServices, createService } from '../../services/serviceService';
import GlobalHeader from '../../components/GlobalHeader';
import DashboardStats from './components/DashboardStats';
import RevenueChart from './components/RevenueChart';
import { useToast } from '../../contexts/ToastContext';

// Chart data is now computed dynamically from fetched bookings

const activityFeed = [
  { id: 1, text: 'Nowe zlecenie dodane', sub: 'Sprawdź zakładkę rezerwacji', time: '14 min temu', icon: CheckCircle2, color: 'text-green-deep bg-cream-warm/30' },
  { id: 2, text: 'Nowa rezerwacja w systemie', sub: 'Klient dodany automatycznie', time: '32 min temu', icon: Calendar, color: 'text-blue-500 bg-blue-50' },
  { id: 3, text: 'Niski stan magazynowy', sub: 'Sprawdź magazyn', time: '1 godz. temu', icon: AlertTriangle, color: 'text-amber-500 bg-amber-50' },
  { id: 4, text: 'System zaktualizowany', sub: 'Synchronizacja z backendem', time: '2 godz. temu', icon: CreditCard, color: 'text-violet-500 bg-violet-50' },
  { id: 5, text: 'Dane załadowane poprawnie', sub: 'API połączone', time: '3 godz. temu', icon: Wrench, color: 'text-cyan-500 bg-cyan-50' },
];

const Modal = ({ isOpen, onClose, title, children }: React.PropsWithChildren<{ isOpen: boolean, onClose: () => void, title: string }>) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-[#1a2e1e]/80 backdrop-blur-md transition-opacity duration-300">
      {/* Use generic animation styles since tailwindcss-animate might not be configured */}
      <style>{`
        @keyframes custom-zoom-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes custom-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-custom-zoom {
          animation: custom-zoom-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-custom-fade {
          animation: custom-fade-in 0.3s ease-out forwards;
        }
      `}</style>
      <div className="fixed inset-0 animate-custom-fade" onClick={onClose}></div>
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-custom-zoom flex flex-col max-h-[95vh] relative z-10">
        <div className="p-6 sm:p-10 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-deep tracking-tight leading-none">{title}</h3>
          <button onClick={onClose} className="p-2 sm:p-3 bg-slate-50 text-slate-400 rounded-xl sm:rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 custom-scrollbar">{children}</div>
      </div>
    </div>,
    document.body
  );
};

const Dashboard: React.FC<{ onNavigate?: (view: ViewType) => void, onOpenMenu?: () => void }> = ({ onNavigate, onOpenMenu }) => {
  const { addToast } = useToast();
  const [bookings, setBookings] = useState<BookingResponseDto[]>([]);
  const [inventory, setInventory] = useState<InventoryResponseDto[]>([]);
  const [clients, setClients] = useState<ClientResponseDto[]>([]);
  const [availableServices, setAvailableServices] = useState<ServiceResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [revPeriod, setRevPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isEditingBooking, setIsEditingBooking] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingResponseDto | null>(null);
  const [confirmation, setConfirmation] = useState<{ id: string, type: typeof BOOKING_STATUSES[keyof typeof BOOKING_STATUSES], booking: BookingResponseDto } | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [vehicleClientSearch, setVehicleClientSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<{ client: ClientResponseDto, vehicle: VehicleInfoDto } | null>(null);
  const [selectedClientForVehicle, setSelectedClientForVehicle] = useState<ClientResponseDto | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customServiceInput, setCustomServiceInput] = useState('');
  const [priceInput, setPriceInput] = useState('0,00');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('08:00');

  // New client form state
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newBookingClientNip, setNewBookingClientNip] = useState('');

  // New vehicle form state
  const [newVehicleBrand, setNewVehicleBrand] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehiclePlate, setNewVehiclePlate] = useState('');

  // Form mode
  const [bookingClientMode, setBookingClientMode] = useState<'existing' | 'new'>('existing');
  const [vehicleClientMode, setVehicleClientMode] = useState<'existing' | 'new'>('existing');

  const fetchData = useCallback(async () => {
    try {
      const bookingPromise = getBookings(undefined, (cached) => { setBookings(cached); setLoading(false); });
      const inventoryPromise = getInventory(undefined, (cached) => { setInventory(cached); setLoading(false); });
      const clientsPromise = getClients(undefined, (cached) => { setClients(cached); setLoading(false); });
      const servicesPromise = getServices((cached) => { setAvailableServices(cached); });

      const [bookingsData, inventoryData, clientsData, servicesData] = await Promise.all([
        bookingPromise,
        inventoryPromise,
        clientsPromise,
        servicesPromise,
      ]);

      setBookings(bookingsData);
      setInventory(inventoryData);
      setClients(clientsData);
      setAvailableServices(servicesData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const today = new Date().toISOString().split('T')[0];
  const lowStockItems = useMemo(() => inventory.filter(i => i.minStock !== null && i.stock < i.minStock), [inventory]);
  const todayBookings = useMemo(() => bookings.filter(b => b.scheduledAt.startsWith(today)).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)), [bookings, today]);
  const upcomingBookings = useMemo(() => bookings.filter(b => b.scheduledAt.startsWith(today) === false && b.scheduledAt > new Date().toISOString()).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)), [bookings, today]);
  const activeCount = useMemo(() => bookings.filter(b => b.completedAt === null).length, [bookings]);
  const completedCount = useMemo(() => bookings.filter(b => b.completedAt !== null).length, [bookings]);
  const todayRevenue = useMemo(() => todayBookings.reduce((sum, b) => sum + ((b.totalPrice || 0) / 100), 0), [todayBookings]);

  // Wykres przeniesiony do izolowanego komponentu w ./components/RevenueChart

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

  const filteredClientsOnlyResults = useMemo(() => {
    if (!vehicleClientSearch.trim()) return [];
    const query = vehicleClientSearch.toLowerCase();
    return clients.filter(c =>
      c.name.toLowerCase().includes(query) ||
      (c.phone || '').toLowerCase().includes(query) ||
      (c.email || '').toLowerCase().includes(query)
    ).slice(0, 5);
  }, [vehicleClientSearch, clients]);

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
      addToast('Wystąpił błąd podczas dodawania usługi.', 'error');
    }
  };

  const handleQuickUpdateStatus = async (booking: BookingResponseDto, targetStatus: typeof BOOKING_STATUSES[keyof typeof BOOKING_STATUSES]) => {
    try {
      if (targetStatus.id === BOOKING_STATUSES.ZAKONCZONA.id) {
        await completeBooking(booking.id);
      } else if (targetStatus.id === BOOKING_STATUSES.ANULOWANA.id) {
        await cancelBooking(booking.id);
      } else {
        // Fallback or generic update for other statuses
        const serviceIds = booking.services
          .map(name => availableServices.find(s => s.name === name)?.id)
          .filter((id): id is string => !!id);

        const dto: BookingCreateDto = {
          vehicleId: booking.vehicle.id,
          clientId: booking.client.id,
          scheduledAt: booking.scheduledAt,
          statusId: targetStatus.id,
          serviceIds: serviceIds,
          price: booking.totalPrice ? booking.totalPrice / 100 : undefined,
          notes: booking.notes,
        };
        await updateBooking(booking.id, dto);
      }

      addToast(`Status rezerwacji zmieniony na: ${targetStatus.name}`, 'success');
      fetchData();
    } catch (err) {
      console.error('Failed to update booking status:', err);
      addToast('Wystąpił błąd podczas zmiany statusu.', 'error');
    } finally {
      setConfirmation(null);
    }
  };

  const confirmStatusUpdate = (e: React.MouseEvent, booking: BookingResponseDto, targetStatus: typeof BOOKING_STATUSES[keyof typeof BOOKING_STATUSES]) => {
    e.stopPropagation();
    setConfirmation({ id: booking.id, type: targetStatus, booking });
  };

  const handleOpenNewBooking = () => {
    setSelectedBooking(null); setSelectedVehicle(null); setClientSearch(''); setSelectedServices([]); setPriceInput('0,00');
    setSelectedDate(new Date().toISOString().split('T')[0]); setSelectedTime('08:00'); setIsEditingBooking(true);
    setBookingClientMode('existing');
    setNewClientName(''); setNewClientPhone(''); setNewClientEmail(''); setNewBookingClientNip('');
    setNewVehicleBrand(''); setNewVehicleModel(''); setNewVehiclePlate(''); setIsBookingModalOpen(true);
  };
  const handleViewBooking = (booking: BookingResponseDto) => {
    setSelectedBooking(booking);
    setSelectedServices(booking.services);
    setPriceInput(booking.totalPrice ? (booking.totalPrice / 100).toFixed(2).replace('.', ',') : '0,00');
    const dt = new Date(booking.scheduledAt);
    setSelectedDate(dt.toISOString().split('T')[0]);
    setSelectedTime(dt.toTimeString().slice(0, 5));
    setIsEditingBooking(false);
    setIsBookingModalOpen(true);
  };

  const handleAddNewClientForBooking = async () => {
    if (!newClientName || !newClientPhone || !newVehiclePlate) {
      addToast('Wypełnij wymagane pola: Imię i Nazwisko, Telefon oraz Numer Rejestracyjny.', 'error');
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
      addToast('Dodano i wybrano nowego klienta.', 'success');
    } catch (err) {
      console.error('Failed to create client:', err);
      addToast('Wystąpił błąd podczas dodawania klienta.', 'error');
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) {
      addToast('Wybierz istniejącego klienta lub dodaj nowego.', 'error');
      return;
    }
    try {
      const dto: BookingCreateDto = {
        vehicleId: selectedVehicle.vehicle.id,
        clientId: selectedVehicle.client.id,
        scheduledAt: new Date(`${selectedDate}T${selectedTime}`).toISOString(),
        statusId: BOOKING_STATUSES.UTWORZONA.id,
        serviceIds: selectedServices,
        price: parseFloat(priceInput.replace(',', '.')),
        notes: null,
      };
      await createBooking(dto);
      setIsBookingModalOpen(false);
      addToast('Rezerwacja została pomyślnie utworzona.', 'success');
      fetchData();
    } catch (err) {
      console.error('Failed to create booking:', err);
      addToast('Wystąpił błąd podczas tworzenia rezerwacji.', 'error');
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dto: CreateClientDto = {
        name: newClientName,
        phone: newClientPhone || null,
        email: newClientEmail || null,
        nip: null,
      };
      await createClient(dto);
      setIsClientModalOpen(false);
      setNewClientName(''); setNewClientPhone(''); setNewClientEmail('');
      addToast('Karta klienta została utworzona.', 'success');
      fetchData();
    } catch (err) {
      console.error('Failed to create client:', err);
      addToast('Wystąpił błąd podczas tworzenia klienta.', 'error');
    }
  };

  const handleAddNewVehicleToExisting = async () => {
    if (!newVehiclePlate) {
      addToast('Numer Rejestracyjny jest wymagany.', 'error');
      return;
    }
    if (!selectedClientForVehicle) {
      addToast('Wybierz istniejącego klienta lub dodaj nowego.', 'error');
      return;
    }
    try {
      await createVehicle({
        clientId: selectedClientForVehicle.id,
        licensePlate: newVehiclePlate,
        brand: newVehicleBrand || null,
        model: newVehicleModel || null
      });
      addToast('Nowy pojazd został pomyślnie dodany do klienta.', 'success');

      setIsVehicleModalOpen(false);
      setVehicleClientMode('existing');
      setSelectedClientForVehicle(null);
      setVehicleClientSearch('');
      setNewVehicleBrand(''); setNewVehicleModel(''); setNewVehiclePlate('');
      fetchData();
    } catch (err) {
      console.error('Failed to create vehicle:', err);
      addToast('Wystąpił błąd podczas dodawania pojazdu.', 'error');
    }
  };

  const handleCreateClientWithVehicle = async () => {
    if (!newClientName || !newClientPhone || !newVehiclePlate) {
      addToast('Wypełnij wymagane pola: Imię i Nazwisko, Telefon oraz Numer Rejestracyjny.', 'error');
      return;
    }
    try {
      await createClient({
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
      addToast('Dodano nowego klienta wraz z pojazdem.', 'success');

      // Close modal and reset state as the goal (adding a vehicle) is achieved by creating the new client & vehicle
      setIsVehicleModalOpen(false);
      setVehicleClientMode('existing');
      setNewClientName(''); setNewClientPhone(''); setNewClientEmail(''); setNewBookingClientNip('');
      setNewVehicleBrand(''); setNewVehicleModel(''); setNewVehiclePlate('');
      fetchData();
    } catch (err) {
      console.error('Failed to create client with vehicle:', err);
      addToast('Wystąpił błąd podczas tworzenia klienta.', 'error');
    }
  };

  const handleOpenNewVehicle = () => {
    setVehicleClientMode('existing');
    setSelectedClientForVehicle(null);
    setVehicleClientSearch('');
    setNewClientName(''); setNewClientPhone(''); setNewClientEmail(''); setNewBookingClientNip('');
    setNewVehicleBrand(''); setNewVehicleModel(''); setNewVehiclePlate('');
    setIsVehicleModalOpen(true);
  };

  const formatBookingTime = (iso: string) => new Date(iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  const formatBookingDate = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Dzień dobry' : hour < 18 ? 'Cześć' : 'Dobry wieczór';
  const dayNames = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
  const monthNames = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
  const dateStr = `${dayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8 w-full">
        <GlobalHeader title="Panel" subtitle="Studio OS DetailFlow" onAddBooking={() => { }} onAddClient={() => { }} onOpenMenu={onOpenMenu} />

        {/* Skeleton Greeting Banner */}
        <div className="skeleton rounded-[2rem] h-[160px] w-full" />

        {/* Skeleton KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 w-full">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="floating-card-static p-5 lg:p-6 h-[140px] w-full">
              <div className="flex items-start justify-between mb-5">
                <div className="w-11 h-11 skeleton rounded-[0.875rem]" />
                <div className="w-14 h-5 skeleton rounded-full" />
              </div>
              <div className="w-1/2 h-8 skeleton rounded-xl mt-4" />
              <div className="w-1/3 h-3 skeleton rounded-lg mt-3" />
            </div>
          ))}
        </div>

        {/* Skeleton Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start w-full">
          <div className="lg:col-span-8 flex flex-col gap-5 lg:gap-6 w-full">
            <div className="floating-card-static p-6 lg:p-8 w-full">
              <div className="w-1/3 h-7 skeleton rounded-xl mb-7" />
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-24 w-full skeleton rounded-[1.5rem]" />)}
              </div>
            </div>
            <div className="floating-card-static p-6 h-[300px] w-full" />
            <div className="floating-card-static p-6 h-[200px] w-full" />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-5 lg:gap-6 w-full">
            <div className="floating-card-static p-6 w-full">
              <div className="w-1/2 h-5 skeleton rounded-lg mb-5" />
              <div className="grid grid-cols-2 gap-3">
                {[1,2,3,4].map(i => <div key={i} className="h-20 w-full skeleton rounded-2xl" />)}
              </div>
            </div>
            <div className="floating-card-static p-6 h-[280px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-slide-up">
      <GlobalHeader title="Panel" subtitle="Studio OS DetailFlow" onAddBooking={handleOpenNewBooking} onAddClient={() => setIsClientModalOpen(true)} onOpenMenu={onOpenMenu} />

      {/* Greeting Banner */}
      <div className="relative rounded-[2rem] p-6 lg:p-8 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a2e1e 0%, #1e3523 50%, #152b1a 100%)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(237,231,216,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(232,168,48,0.06) 0%, transparent 70%)', filter: 'blur(30px)' }} />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className="text-[11px] font-bold text-cream-warm/50 uppercase tracking-[0.4em] mb-3">{dateStr}</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white leading-none">Witaj! 👋</h2>
            <p className="text-white/40 text-[13px] font-medium mt-3 max-w-md">Masz <span className="text-cream-warm font-bold">{todayBookings.length}</span> {todayBookings.length === 1 ? 'zlecenie' : 'zleceń'} na dziś i <span className="text-cream-warm font-bold">{upcomingBookings.length}</span> nadchodzących.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button onClick={handleOpenNewBooking} className="flex items-center gap-2 bg-amber text-green-deep px-5 py-3 rounded-full font-bold text-[11px] uppercase tracking-widest shadow-[0_8px_24px_rgba(232,168,48,0.35)] hover:shadow-[0_12px_32px_rgba(232,168,48,0.45)] hover:-translate-y-0.5 hover:bg-amber-light transition-all">
              <Plus size={15} strokeWidth={3} /> Nowe Zlecenie
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <DashboardStats
        todayRevenue={todayRevenue}
        activeCount={activeCount}
        clientsCount={clients.length}
        completedCount={completedCount}
        todayBookingsCount={todayBookings.length}
      />

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

        {/* === LEFT COLUMN === */}
        <div className="lg:col-span-8 flex flex-col gap-6 lg:gap-8">

          {/* Today's Schedule */}
          <div className="floating-card-static p-6 lg:p-8 flex flex-col overflow-hidden animate-slide-up-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-xl font-sans font-bold text-green-deep">Dzisiejszy Grafik</h4>
                <p className="text-[11px] font-semibold text-green-light/60 uppercase tracking-wide mt-1">{todayBookings.length} {todayBookings.length === 1 ? 'zlecenie' : 'zleceń'} zaplanowanych</p>
              </div>
              <div className="w-10 h-10 bg-green-deep text-cream-warm rounded-[0.875rem] flex items-center justify-center shadow-lg shrink-0"><Calendar size={17} /></div>
            </div>
            <div className="space-y-3">
              {todayBookings.length === 0 && (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(26,46,30,0.05)' }}><Calendar size={28} className="text-green-deep/20" /></div>
                  <p className="text-base font-semibold text-green-deep/25">Brak zleceń na dziś</p>
                  <p className="text-xs text-green-deep/20 mt-1 font-medium">Dodaj nową rezerwację klikając + powyżej</p>
                </div>
              )}
              {todayBookings.map((booking) => {
                const time = formatBookingTime(booking.scheduledAt);
                return (
                  <div key={booking.id} onClick={() => handleViewBooking(booking)}
                    className="p-4 sm:p-5 rounded-[1.5rem] flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 cursor-pointer group transition-all duration-300 hover:-translate-y-0.5"
                    style={{ background: 'rgba(26,46,30,0.03)', border: '1px solid rgba(26,46,30,0.05)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'white'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px -6px rgba(0,0,0,0.08)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(26,46,30,0.03)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                  >
                    <div className="flex items-center justify-between sm:flex-col sm:justify-center sm:min-w-[90px] sm:border-r sm:pr-6 shrink-0" style={{ borderColor: 'rgba(26,46,30,0.08)' }}>
                      <span className="text-xl font-bold text-green-deep font-mono">{time}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border mt-1.5" style={{ color: booking.statusColor || 'var(--green-deep)', borderColor: (booking.statusColor || 'var(--green-deep)') + '40', backgroundColor: (booking.statusColor || 'var(--green-deep)') + '12' }}>{booking.status}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-lg font-sans font-bold text-green-deep truncate">{booking.vehicle.brand} {booking.vehicle.model}</h5>
                      <p className="text-[11px] font-bold text-green-deep/35 uppercase tracking-widest mt-0.5 truncate">{booking.services.join(', ') || 'Brak usług'}</p>
                      <p className="text-[12px] font-semibold text-green-light mt-1"><UserCheck size={10} className="inline mr-1" />{booking.client.name}</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                      {booking.status === BOOKING_STATUSES.UTWORZONA.name && (
                        <>
                          <button onClick={(e) => confirmStatusUpdate(e, booking, BOOKING_STATUSES.ZAKONCZONA)} title="Zakończ"
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-green-pale/40 text-green-light hover:bg-green-pale/70 transition-all active:scale-95">
                            <Check size={16} strokeWidth={2.5} />
                          </button>
                          <button onClick={(e) => confirmStatusUpdate(e, booking, BOOKING_STATUSES.ANULOWANA)} title="Anuluj"
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-all active:scale-95">
                            <X size={16} strokeWidth={2.5} />
                          </button>
                        </>
                      )}
                      <div className="bg-green-deep text-cream-warm px-3 py-1.5 rounded-xl font-mono text-[13px] font-bold tracking-wider uppercase shadow-md">{booking.vehicle.licensePlate}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Chart */}
          <RevenueChart bookings={bookings} />

          {/* Upcoming Bookings */}
          <div className="floating-card-static p-6 lg:p-8 animate-slide-up-3">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-lg lg:text-xl font-sans font-bold text-green-deep">Nadchodzące</h4>
                <p className="text-[11px] font-semibold text-green-light/60 uppercase tracking-wide mt-1">następne {upcomingBookings.length} rezerwacji</p>
              </div>
              <button onClick={() => onNavigate?.('Tasks')} className="text-[9px] font-semibold text-green-light uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">Wszystkie <ChevronRight size={13} /></button>
            </div>
            <div className="space-y-2">
              {upcomingBookings.slice(0, 4).map(booking => {
                const dt = new Date(booking.scheduledAt);
                const day = String(dt.getDate()).padStart(2, '0');
                const monthIdx = dt.getMonth();
                return (
                  <div key={booking.id} onClick={() => handleViewBooking(booking)}
                    className="p-4 rounded-[1.5rem] flex items-center gap-5 cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
                    style={{ background: 'rgba(26,46,30,0.03)', border: '1px solid rgba(26,46,30,0.05)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'white'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px -6px rgba(0,0,0,0.07)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(26,46,30,0.03)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                  >
                    <div className="text-center shrink-0 min-w-[50px] border-r pr-4" style={{ borderColor: 'rgba(26,46,30,0.08)' }}>
                      <p className="text-xl font-bold text-green-deep font-mono leading-none">{day}</p>
                      <p className="text-[8px] font-bold text-green-light/60 uppercase tracking-wider">{['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'][monthIdx]}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-bold text-green-deep truncate">{booking.vehicle.brand} {booking.vehicle.model}</h5>
                      <p className="text-[9px] font-bold text-green-deep/30 uppercase tracking-widest truncate">{booking.services.join(', ') || 'Brak usług'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-bold text-green-deep font-mono">{((booking.totalPrice || 0) / 100).toFixed(2).replace('.', ',')} <span className="text-[9px] text-green-deep/35">zł</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* === RIGHT COLUMN === */}
        <div className="lg:col-span-4 flex flex-col gap-6 lg:gap-8">

          {/* Quick Actions */}
          <div className="floating-card-static p-6 sm:p-7 animate-slide-up-1">
            <h4 className="text-lg font-sans font-bold text-green-deep mb-5">Szybkie Akcje</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: 'Rezerwacja',
                  icon: Calendar,
                  action: handleOpenNewBooking,
                  style: { background: 'linear-gradient(135deg, #1a2e1e 0%, #2d4f33 100%)', color: '#f5f0e8' },
                  iconColor: '#e8a830',
                },
                {
                  label: 'Nowy Klient',
                  icon: User,
                  action: () => setIsClientModalOpen(true),
                  style: { background: 'linear-gradient(135deg, #e8a830 0%, #d4941c 100%)', color: '#1a2e1e' },
                  iconColor: '#1a2e1e',
                },
                {
                  label: 'Nowy Pojazd',
                  icon: CarIcon,
                  action: handleOpenNewVehicle,
                  style: { background: 'linear-gradient(135deg, #3d6b46 0%, #2d5235 100%)', color: '#f5f0e8' },
                  iconColor: '#c8e6be',
                },
                {
                  label: 'Magazyn',
                  icon: Package,
                  action: () => onNavigate?.('Inventory'),
                  style: { background: 'linear-gradient(135deg, #f0ebe0 0%, #e8e0d0 100%)', color: '#1a2e1e', border: '1px solid rgba(26,46,30,0.1)' },
                  iconColor: '#3d6b46',
                },
              ].map((qa, i) => (
                <button key={i} onClick={qa.action}
                  className="p-4 rounded-2xl flex flex-col items-center gap-2.5 transition-all active:scale-95 hover:-translate-y-1 hover:shadow-lg duration-200"
                  style={qa.style}>
                  <qa.icon size={22} strokeWidth={2} color={qa.iconColor} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{qa.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stock Alerts */}
          <div className="floating-card-static p-6 sm:p-7 animate-slide-up-2">
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-lg font-sans font-bold text-green-deep">Alerty Magazynowe</h4>
              <div className={`w-9 h-9 rounded-[0.875rem] flex items-center justify-center ${lowStockItems.length > 0 ? 'bg-amber/15 text-amber' : 'bg-green-pale/40 text-green-light'}`}><Package size={16} /></div>
            </div>
            {lowStockItems.length === 0 ? (
              <div className="text-center py-5">
                <div className="w-10 h-10 bg-green-pale/40 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-light text-lg">✓</span>
                </div>
                <p className="text-sm font-semibold text-green-deep/50">Wszystko w normie</p>
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockItems.map(item => (
                  <div key={item.id} className="p-4 rounded-2xl flex items-center justify-between" style={{ background: 'rgba(232,168,48,0.07)', border: '1px solid rgba(232,168,48,0.15)' }}>
                    <div>
                      <h5 className="text-[13px] font-bold text-green-deep truncate">{item.name}</h5>
                      <p className="text-[10px] font-semibold text-amber uppercase tracking-widest">{item.categoryName || 'Brak kategorii'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-bold text-amber font-mono">{item.stock}<span className="text-[11px] ml-0.5 opacity-60">{item.unit}</span></p>
                      <p className="text-[10px] font-semibold text-green-deep/35 uppercase">min. {item.minStock}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="floating-card-static p-6 sm:p-7 animate-slide-up-3">
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-lg font-sans font-bold text-green-deep">Aktywność</h4>
              <div className="w-9 h-9 bg-green-deep text-cream-warm rounded-[0.875rem] flex items-center justify-center"><Activity size={16} /></div>
            </div>
            <div className="space-y-0.5">
              {activityFeed.map(item => (
                <div key={item.id} className="flex items-start gap-3.5 p-3 rounded-2xl cursor-pointer transition-all duration-200"
                  style={{ borderRadius: '1rem' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(26,46,30,0.04)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}><item.icon size={14} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-green-deep leading-tight">{item.text}</p>
                    <p className="text-[9px] font-semibold text-green-deep/35 mt-0.5 truncate">{item.sub}</p>
                  </div>
                  <span className="text-[8px] font-semibold text-green-deep/25 whitespace-nowrap shrink-0 mt-0.5">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* === MODALS === */}
      <Modal isOpen={!!confirmation} onClose={() => setConfirmation(null)} title="Zmień Status">
        <div className="space-y-8">
          <div className="flex items-center gap-6 p-8 bg-slate-50 rounded-[2.5rem]">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${confirmation?.type.id === BOOKING_STATUSES.ZAKONCZONA.id ? 'bg-cream-warm/20 text-green-deep' : 'bg-red-50 text-red-500'}`}><AlertCircle size={32} /></div>
            <div>
              <p className="text-lg font-bold text-green-deep leading-tight mb-2">{confirmation?.type.id === BOOKING_STATUSES.ZAKONCZONA.id ? 'Zakończyć to zlecenie?' : 'Anulować tę rezerwację?'}</p>
              <p className="text-sm text-slate-500 font-semibold">{confirmation?.booking.vehicle.brand} {confirmation?.booking.vehicle.model}</p>
              <p className="text-xs text-slate-400 font-mono mt-1">{confirmation?.booking.vehicle.licensePlate}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setConfirmation(null)} className="flex-1 py-5 bg-white border border-slate-200 text-slate-400 rounded-[1.5rem] font-semibold text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all">Wróć</button>
            <button onClick={() => confirmation && handleQuickUpdateStatus(confirmation.booking, confirmation.type)} className={`flex-1 py-5 rounded-[1.5rem] font-semibold text-[11px] uppercase tracking-widest text-white shadow-xl hover:shadow-2xl active:scale-95 transition-all ${confirmation?.type.id === BOOKING_STATUSES.ZAKONCZONA.id ? 'bg-green-deep text-cream-warm' : 'bg-red-500'}`}>Tak, kontynuuj</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Nowy Klient">
        <form className="space-y-6" onSubmit={handleCreateClient}>
          <div className="space-y-4">
            <input type="text" placeholder="Imię i Nazwisko" required value={newClientName} onChange={e => setNewClientName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" />
            <div className="grid grid-cols-2 gap-4">
              <input type="tel" placeholder="Telefon" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} className="px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" />
              <input type="email" placeholder="Email" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} className="px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" />
            </div>
          </div>
          <button type="submit" className="w-full py-5 bg-green-deep text-cream-warm rounded-2xl font-semibold text-[10px] uppercase tracking-widest shadow-xl">Załóż Kartę Klienta</button>
        </form>
      </Modal>

      <Modal isOpen={isVehicleModalOpen} onClose={() => setIsVehicleModalOpen(false)} title="Dodaj Nowy Pojazd">
        <div className="space-y-8 pb-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between ml-4 mb-2">
              <label className="text-[10px] font-semibold text-green-light uppercase tracking-widest">Właściciel</label>
              <div className="flex bg-slate-50 p-1 rounded-xl">
                <button type="button" onClick={() => setVehicleClientMode('existing')} className={`px-4 py-1.5 rounded-lg text-[9px] font-semibold uppercase tracking-widest transition-all ${vehicleClientMode === 'existing' ? 'bg-green-deep text-cream-warm' : 'text-slate-400 hover:text-green-deep'}`}>Znajdź Właściciela</button>
                <button type="button" onClick={() => setVehicleClientMode('new')} className={`px-4 py-1.5 rounded-lg text-[9px] font-semibold uppercase tracking-widest transition-all ${vehicleClientMode === 'new' ? 'bg-green-deep text-cream-warm' : 'text-slate-400 hover:text-green-deep'}`}>Nowy Klient</button>
              </div>
            </div>

            {vehicleClientMode === 'existing' ? (
              <>
                <div className="relative">
                  <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Szukaj klienta po nazwie lub kontakcie..." value={vehicleClientSearch} onChange={e => setVehicleClientSearch(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-sm outline-none focus:ring-4 focus:ring-cream-warm/30" />
                </div>
                {vehicleClientSearch.trim() && filteredClientsOnlyResults.map(client => (
                  <button key={client.id} type="button" onClick={() => { setSelectedClientForVehicle(client); setVehicleClientSearch(''); }} className="w-full p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-cream-warm transition-all">
                    <div className="text-left"><h5 className="font-semibold text-green-deep text-sm">{client.name}</h5><p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">{client.phone || client.email || 'Brak danych kontaktowych'}</p></div>
                  </button>
                ))}
                {selectedClientForVehicle && (
                  <div className="p-6 bg-cream-warm/20 border-2 border-cream-warm/50 rounded-[1.5rem] flex items-center gap-4">
                    <User size={24} className="text-green-light" />
                    <div><h5 className="font-semibold text-green-deep text-sm">{selectedClientForVehicle.name}</h5><p className="text-[9px] font-semibold text-green-light uppercase tracking-widest">{selectedClientForVehicle.phone || selectedClientForVehicle.email}</p></div>
                  </div>
                )}

                <div className="space-y-4 pt-4">
                  <label className="text-[10px] font-semibold text-green-light uppercase tracking-widest ml-4">Nowy Pojazd</label>
                  <div className="space-y-3 bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Marka (opcjonalnie)" value={newVehicleBrand} onChange={e => setNewVehicleBrand(e.target.value)} className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50" />
                      <input type="text" placeholder="Model (opcjonalnie)" value={newVehicleModel} onChange={e => setNewVehicleModel(e.target.value)} className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50" />
                    </div>
                    <input type="text" placeholder="Nr Rejestracyjny *" value={newVehiclePlate} onChange={e => setNewVehiclePlate(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50 uppercase" />
                  </div>
                </div>
                <button type="button" onClick={handleAddNewVehicleToExisting} className="w-full mt-8 py-6 bg-green-deep text-cream-warm rounded-[1.5rem] font-semibold text-[11px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
                  <Save size={18} /> Zapisz Pojazd
                </button>
              </>
            ) : (
              <div className="space-y-4 bg-slate-50 p-6 rounded-[1.5rem] mt-2 border border-slate-100">
                <div className="space-y-3">
                  <h5 className="font-semibold text-green-deep text-xs uppercase tracking-widest mb-3">Dane Klienta</h5>
                  <input type="text" placeholder="Imię i Nazwisko *" value={newClientName} onChange={e => setNewClientName(e.target.value)} required className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="tel" placeholder="Telefon *" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} required className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50" />
                    <input type="email" placeholder="Email (opcjonalnie)" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50" />
                  </div>
                  <input type="text" placeholder="NIP (opcjonalnie)" value={newBookingClientNip} onChange={e => setNewBookingClientNip(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50" />
                </div>
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <h5 className="font-semibold text-green-deep text-xs uppercase tracking-widest mb-3">Pojazd Klienta</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Marka (opcjonalnie)" value={newVehicleBrand} onChange={e => setNewVehicleBrand(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50" />
                    <input type="text" placeholder="Model (opcjonalnie)" value={newVehicleModel} onChange={e => setNewVehicleModel(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50" />
                  </div>
                  <input type="text" placeholder="Nr Rejestracyjny *" value={newVehiclePlate} onChange={e => setNewVehiclePlate(e.target.value)} required className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50 uppercase" />
                </div>
                <button type="button" onClick={handleCreateClientWithVehicle} className="w-full py-4 bg-green-deep text-cream-warm rounded-xl font-semibold text-[10px] uppercase tracking-wider">
                  Utwórz Klienta i Pojazd
                </button>
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title={isEditingBooking ? (selectedBooking ? 'Edytuj' : 'Nowa Rezerwacja') : 'Detale Zlecenia'}>
        {!isEditingBooking && selectedBooking ? (
          <div className="space-y-8 animate-slide-up">
            <div className="p-8 bg-green-deep rounded-[2.5rem] border border-white/5 relative overflow-hidden">
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
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-green-light shadow-sm"><Clock size={28} /></div>
                <div>
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Termin</p>
                  <p className="text-lg font-bold text-green-deep">{new Date(selectedBooking.scheduledAt).toLocaleDateString('pl-PL')} • {formatBookingTime(selectedBooking.scheduledAt)}</p>
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
                  <button onClick={(e) => { confirmStatusUpdate(e, selectedBooking, BOOKING_STATUSES.ZAKONCZONA); setIsBookingModalOpen(false); }} className="flex-1 py-5 bg-emerald-50 text-emerald-600 border border-emerald-100/50 rounded-[1.5rem] font-semibold text-[11px] uppercase tracking-widest hover:bg-emerald-100 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"><Check size={16} strokeWidth={2.5} /> Zakończ</button>
                  <button onClick={(e) => { confirmStatusUpdate(e, selectedBooking, BOOKING_STATUSES.ANULOWANA); setIsBookingModalOpen(false); }} className="flex-1 py-5 bg-red-50 text-red-500 border border-red-100/50 rounded-[1.5rem] font-semibold text-[11px] uppercase tracking-widest hover:bg-red-100 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"><X size={16} strokeWidth={2.5} /> Anuluj</button>
                </>
              )}
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className={`py-5 bg-green-deep text-cream-warm rounded-[1.5rem] font-semibold text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all ${selectedBooking.status === BOOKING_STATUSES.UTWORZONA.name ? 'px-8 flex-none' : 'flex-1'}`}
              >Zamknij</button>
            </div>
          </div>
        ) : (
          <form className="space-y-8 pb-10" onSubmit={handleCreateBooking}>
            <div className="space-y-4">
              <div className="flex items-center justify-between ml-4 mb-2">
                <label className="text-[10px] font-semibold text-green-light uppercase tracking-widest">Pojazd i Klient</label>
                <div className="flex bg-slate-50 p-1 rounded-xl">
                  <button type="button" onClick={() => setBookingClientMode('existing')} className={`px-4 py-1.5 rounded-lg text-[9px] font-semibold uppercase tracking-widest transition-all ${bookingClientMode === 'existing' ? 'bg-green-deep text-cream-warm' : 'text-slate-400 hover:text-green-deep'}`}>Wyszukaj</button>
                  <button type="button" onClick={() => setBookingClientMode('new')} className={`px-4 py-1.5 rounded-lg text-[9px] font-semibold uppercase tracking-widest transition-all ${bookingClientMode === 'new' ? 'bg-green-deep text-cream-warm' : 'text-slate-400 hover:text-green-deep'}`}>Dodaj Nowy</button>
                </div>
              </div>

              {bookingClientMode === 'existing' ? (
                <>
                  <div className="relative">
                    <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Szukaj..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-sm outline-none focus:ring-4 focus:ring-cream-warm/30" />
                  </div>
                  {clientSearch.trim() && filteredClientResults.map(res => (
                    <button key={res.vehicle.id} type="button" onClick={() => { setSelectedVehicle(res); setClientSearch(''); }} className="w-full p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-cream-warm transition-all">
                      <div className="text-left"><h5 className="font-semibold text-green-deep text-sm">{res.vehicle.brand} {res.vehicle.model}</h5><p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">{res.client.name}</p></div>
                      <div className="bg-green-deep text-cream-warm px-3 py-1.5 rounded-xl font-mono text-[11px] font-semibold tracking-widest">{res.vehicle.licensePlate}</div>
                    </button>
                  ))}
                  {selectedVehicle && (
                    <div className="p-6 bg-cream-warm/20 border-2 border-cream-warm/50 rounded-[1.5rem] flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <CarIcon size={24} className="text-green-light" />
                        <div><h5 className="font-semibold text-green-deep text-sm">{selectedVehicle.vehicle.brand} {selectedVehicle.vehicle.model}</h5><p className="text-[9px] font-semibold text-green-light uppercase tracking-widest">{selectedVehicle.client.name}</p></div>
                      </div>
                      <div className="font-mono text-xs font-semibold text-green-deep whitespace-nowrap">{selectedVehicle.vehicle.licensePlate}</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4 bg-slate-50 p-6 rounded-[1.5rem] mt-2 border border-slate-100">
                  <div className="space-y-3">
                    <h5 className="font-semibold text-green-deep text-xs uppercase tracking-widest mb-3">Dane Klienta</h5>
                    <input type="text" placeholder="Imię i Nazwisko *" value={newClientName} onChange={e => setNewClientName(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="tel" placeholder="Telefon *" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50" />
                      <input type="email" placeholder="Email (opcjonalnie)" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50" />
                    </div>
                    <input type="text" placeholder="NIP (opcjonalnie)" value={newBookingClientNip} onChange={e => setNewBookingClientNip(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50" />
                  </div>
                  <div className="space-y-3 pt-3 border-t border-slate-200">
                    <h5 className="font-semibold text-green-deep text-xs uppercase tracking-widest mb-3">Dane Pojazdu</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Marka" value={newVehicleBrand} onChange={e => setNewVehicleBrand(e.target.value)} className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50" />
                      <input type="text" placeholder="Model" value={newVehicleModel} onChange={e => setNewVehicleModel(e.target.value)} className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50" />
                    </div>
                    <input type="text" placeholder="Nr Rejestracyjny *" value={newVehiclePlate} onChange={e => setNewVehiclePlate(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50 uppercase" />
                  </div>
                  <button type="button" onClick={handleAddNewClientForBooking} className="w-full py-4 mt-2 bg-green-deep text-cream-warm rounded-2xl font-semibold text-[10px] uppercase tracking-widest shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <UserPlus size={16} strokeWidth={2.5} /> Dodaj Klienta i Wybierz
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-semibold text-green-light uppercase tracking-widest ml-4">Wybierz Usługi</label>
              <div className="flex flex-wrap gap-2">
                {availableServices.map(svc => (
                  <button key={svc.id} type="button" onClick={() => toggleService(svc.id)} className={`px-4 py-3 rounded-xl text-[9px] font-semibold uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${selectedServices.includes(svc.id) ? 'bg-green-deep text-cream-warm border-green-deep' : 'bg-slate-50 text-slate-400 border-transparent'}`}>
                    {selectedServices.includes(svc.id) && <Check size={12} strokeWidth={4} />} {svc.name}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <input type="text" value={customServiceInput} onChange={e => setCustomServiceInput(e.target.value)} placeholder="Dodaj inną usługę..." className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-cream-warm/30" />
                <button type="button" onClick={handleAddCustomService} className="w-14 h-14 bg-green-deep text-cream-warm rounded-2xl flex items-center justify-center shadow-lg active:scale-95"><Plus size={24} /></button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4">Cena Netto</label><input type="text" value={priceInput} onChange={e => setPriceInput(e.target.value)} className="w-full px-6 py-5 bg-green-deep text-cream-warm border-none rounded-[1.5rem] font-semibold text-xl font-mono" /></div>
              <div className="space-y-2"><label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4">Data</label><input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-sm outline-none" /></div>
              <div className="space-y-2"><label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4">Godzina</label><input type="time" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-sm outline-none" /></div>
            </div>
            <button type="submit" className="w-full py-6 bg-green-deep text-cream-warm rounded-[1.5rem] font-semibold text-[11px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"><Save size={18} /> Zapisz Rezerwację</button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
