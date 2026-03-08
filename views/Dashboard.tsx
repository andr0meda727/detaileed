
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar, Package, Car as CarIcon, X, Plus, TrendingUp, AlertCircle, Search, CheckCircle2, XCircle, Check,
  User, UserPlus, Phone, Mail, MessageSquare, Edit2, Save, Clock, Users, DollarSign, Wrench, ArrowRight,
  Shield, Droplets, CircleDot, Activity, CreditCard, ChevronRight, Star, Zap, BarChart3,
  AlertTriangle, Timer, UserCheck, Clipboard
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { BookingResponseDto, InventoryResponseDto, ViewType, ClientResponseDto, VehicleInfoDto, BookingCreateDto, CreateClientDto, ServiceResponseDto } from '../types';
import { BOOKING_STATUSES } from '../constants';
import { getBookings } from '../services/bookingService';
import { createBooking } from '../services/bookingService';
import { getClients, createClient } from '../services/clientService';
import { getInventory } from '../services/inventoryService';
import { getServices, createService } from '../services/serviceService';
import GlobalHeader from '../components/GlobalHeader';

// Chart data is now computed dynamically from fetched bookings

const activityFeed = [
  { id: 1, text: 'Nowe zlecenie dodane', sub: 'Sprawdź zakładkę rezerwacji', time: '14 min temu', icon: CheckCircle2, color: 'text-[#102C26] bg-[#F7E7CE]/30' },
  { id: 2, text: 'Nowa rezerwacja w systemie', sub: 'Klient dodany automatycznie', time: '32 min temu', icon: Calendar, color: 'text-blue-500 bg-blue-50' },
  { id: 3, text: 'Niski stan magazynowy', sub: 'Sprawdź magazyn', time: '1 godz. temu', icon: AlertTriangle, color: 'text-amber-500 bg-amber-50' },
  { id: 4, text: 'System zaktualizowany', sub: 'Synchronizacja z backendem', time: '2 godz. temu', icon: CreditCard, color: 'text-violet-500 bg-violet-50' },
  { id: 5, text: 'Dane załadowane poprawnie', sub: 'API połączone', time: '3 godz. temu', icon: Wrench, color: 'text-cyan-500 bg-cyan-50' },
];

const Modal = ({ isOpen, onClose, title, children }: React.PropsWithChildren<{ isOpen: boolean, onClose: () => void, title: string }>) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-[#102C26]/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[95vh]">
        <div className="p-6 sm:p-10 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#102C26] tracking-tighter leading-none">{title}</h3>
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
  const [bookings, setBookings] = useState<BookingResponseDto[]>([]);
  const [inventory, setInventory] = useState<InventoryResponseDto[]>([]);
  const [clients, setClients] = useState<ClientResponseDto[]>([]);
  const [availableServices, setAvailableServices] = useState<ServiceResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [revPeriod, setRevPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isEditingBooking, setIsEditingBooking] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingResponseDto | null>(null);
  const [confirmation, setConfirmation] = useState<{ id: string, type: string } | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<{ client: ClientResponseDto, vehicle: VehicleInfoDto } | null>(null);
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

  // Compute chart data from bookings
  const chartData = useMemo(() => {
    const now = new Date();
    const wData = [];
    const mData = [];
    const dNames = ['Ndz', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'];

    // Weekly Data - Last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const dayBookings = bookings.filter(b => b.scheduledAt.startsWith(dateString));
      const rev = Math.round(dayBookings.reduce((sum, b) => sum + ((b.totalPrice || 0) / 100), 0) * 100) / 100;
      wData.push({ name: dNames[d.getDay()], rev, orders: dayBookings.length });
    }

    // Monthly Data - Last 4 Weeks
    for (let i = 3; i >= 0; i--) {
      const weekBookings = bookings.filter(b => {
        const bDate = new Date(b.scheduledAt);
        const diffTime = Math.abs(now.getTime() - bDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= (i * 7) && diffDays < ((i + 1) * 7);
      });
      const rev = Math.round(weekBookings.reduce((sum, b) => sum + ((b.totalPrice || 0) / 100), 0) * 100) / 100;
      mData.push({ name: `Tydz ${4 - i}`, rev, orders: weekBookings.length });
    }

    return { weekly: wData, monthly: mData };
  }, [bookings]);

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
      alert('Wystąpił błąd podczas dodawania usługi.');
    }
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
      alert('Wypełnij wymagane pola: Imię i Nazwisko, Telefon oraz Numer Rejestracyjny.');
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
    } catch (err) {
      console.error('Failed to create client:', err);
      alert('Wystąpił błąd podczas dodawania klienta.');
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) {
      alert('Wybierz istniejącego klienta lub dodaj nowego.');
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
      fetchData();
    } catch (err) {
      console.error('Failed to create booking:', err);
      alert('Wystąpił błąd podczas tworzenia rezerwacji.');
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
      fetchData();
    } catch (err) {
      console.error('Failed to create client:', err);
    }
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
      <div className="space-y-6 sm:space-y-8 animate-pulse w-full">
        <GlobalHeader title="Panel" subtitle="Studio OS DetailFlow" onAddBooking={() => { }} onAddClient={() => { }} onOpenMenu={onOpenMenu} />

        {/* Skeleton Greeting Banner */}
        <div className="bg-slate-200/50 rounded-[2.5rem] lg:rounded-[3rem] p-8 sm:p-10 lg:p-12 border border-slate-100/50 h-[180px] w-full"></div>

        {/* Skeleton KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 w-full">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-[2rem] p-6 sm:p-7 border border-slate-100 shadow-sm h-[140px] w-full">
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 bg-slate-200/60 rounded-2xl"></div>
                <div className="w-16 h-6 bg-slate-200/60 rounded-lg"></div>
              </div>
              <div className="w-1/2 h-8 bg-slate-200/60 rounded-lg mt-4"></div>
              <div className="w-1/3 h-4 bg-slate-200/60 rounded-lg mt-2"></div>
            </div>
          ))}
        </div>

        {/* Skeleton Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start w-full">
          <div className="lg:col-span-8 flex flex-col gap-6 lg:gap-8 w-full">
            <div className="bg-white rounded-[2.5rem] lg:rounded-[3rem] p-6 sm:p-8 lg:p-10 border border-slate-100 shadow-sm w-full flex flex-col">
              <div className="w-1/3 h-8 bg-slate-200/60 rounded-lg mb-8"></div>
              <div className="space-y-4">
                <div className="h-24 w-full bg-slate-100/80 rounded-[2.5rem]"></div>
                <div className="h-24 w-full bg-slate-100/80 rounded-[2.5rem]"></div>
                <div className="h-24 w-full bg-slate-100/80 rounded-[2.5rem]"></div>
              </div>
            </div>
            <div className="bg-white rounded-[2.5rem] lg:rounded-[3rem] p-6 sm:p-10 lg:p-14 border border-slate-100 shadow-sm h-[320px] w-full"></div>
            <div className="bg-white rounded-[2.5rem] lg:rounded-[3rem] p-6 sm:p-8 lg:p-10 border border-slate-100 shadow-sm h-[250px] w-full"></div>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-6 lg:gap-8 w-full">
            <div className="bg-white rounded-[2.5rem] lg:rounded-[3rem] p-6 sm:p-8 border border-slate-100 shadow-sm w-full">
              <div className="w-1/2 h-6 bg-slate-200/60 rounded-lg mb-6"></div>
              <div className="h-16 w-full bg-slate-100/80 rounded-2xl mb-3"></div>
              <div className="h-16 w-full bg-slate-100/80 rounded-2xl"></div>
            </div>
            <div className="bg-white rounded-[2.5rem] lg:rounded-[3rem] p-6 sm:p-8 border border-slate-100 shadow-sm w-full">
              <div className="w-1/2 h-6 bg-slate-200/60 rounded-lg mb-6"></div>
              <div className="grid grid-cols-2 gap-3 h-full pb-4">
                <div className="h-20 w-full bg-slate-100/80 rounded-2xl"></div>
                <div className="h-20 w-full bg-slate-100/80 rounded-2xl"></div>
              </div>
            </div>
            <div className="bg-white rounded-[2.5rem] lg:rounded-[3rem] p-6 sm:p-8 border border-slate-100 shadow-sm h-[300px] w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <GlobalHeader title="Panel" subtitle="Studio OS DetailFlow" onAddBooking={handleOpenNewBooking} onAddClient={() => setIsClientModalOpen(true)} onOpenMenu={onOpenMenu} />

      {/* Greeting Banner */}
      <div className="relative bg-gradient-to-br from-[#102C26] via-[#1A3D33] to-[#152F28] rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-8 overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#F7E7CE]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F7E7CE]/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className="text-[12px] font-semibold text-[#F7E7CE] uppercase tracking-[0.4em] mb-3">{dateStr}</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tighter leading-[1.1]">{greeting} 👋</h2>
            <p className="text-white/40 text-[13px] font-bold mt-2 max-w-md">Masz <span className="text-[#F7E7CE] font-bold">{todayBookings.length}</span> {todayBookings.length === 1 ? 'zlecenie' : 'zleceń'} na dziś i <span className="text-[#F7E7CE] font-bold">{upcomingBookings.length}</span> nadchodzących.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button onClick={handleOpenNewBooking} className="flex items-center gap-2 bg-[#F7E7CE] text-[#102C26] px-5 py-3 rounded-[1.25rem] font-semibold text-[10px] uppercase tracking-widest shadow-[0_0_30px_rgba(247,231,206,0.3)] hover:shadow-[0_0_50px_rgba(247,231,206,0.4)] hover:scale-[1.03] transition-all">
              <Plus size={16} strokeWidth={3} /> Nowe Zlecenie
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[
          { label: 'Przychód Dziś', value: `${todayRevenue.toLocaleString('pl-PL')} zł`, icon: DollarSign, accent: 'from-[#102C26] to-[#1A3D33]', bg: 'bg-[#F7E7CE]/20', iconBg: 'bg-[#102C26]', trend: '+12%' },
          { label: 'Aktywne Zlecenia', value: activeCount, icon: Clipboard, accent: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', iconBg: 'bg-blue-500', trend: `${todayBookings.length} dziś` },
          { label: 'Baza Klientów', value: clients.length, icon: Users, accent: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', iconBg: 'bg-violet-500', trend: 'z API' },
          { label: 'Ukończone', value: completedCount, icon: CheckCircle2, accent: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', iconBg: 'bg-amber-500', trend: 'z API' },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-[1.5rem] lg:rounded-[2rem] p-5 lg:p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 ${card.iconBg} rounded-[1rem] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <card.icon size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[9px] font-semibold text-[#102C26] bg-[#F7E7CE]/30 px-2.5 py-1 rounded-lg uppercase tracking-wider">{card.trend}</span>
            </div>
            <h3 className="text-2xl lg:text-3xl font-extrabold text-[#102C26] tracking-tighter font-mono leading-none">{card.value}</h3>
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-[0.3em] mt-2">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

        {/* === LEFT COLUMN === */}
        <div className="lg:col-span-8 flex flex-col gap-6 lg:gap-8">

          {/* Today's Schedule */}
          <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-8 flex flex-col border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-xl font-bold text-[#102C26] tracking-tight">Dzisiejszy Grafik</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{todayBookings.length} {todayBookings.length === 1 ? 'zlecenie' : 'zleceń'} zaplanowanych</p>
              </div>
              <div className="w-10 h-10 bg-[#102C26] text-[#F7E7CE] rounded-[1rem] flex items-center justify-center shadow-xl shrink-0"><Calendar size={18} /></div>
            </div>
            <div className="space-y-4">
              {todayBookings.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6"><Calendar size={32} className="text-slate-300" /></div>
                  <p className="text-lg font-bold text-slate-300">Brak zleceń na dziś</p>
                  <p className="text-xs text-slate-400 mt-2">Dodaj nową rezerwację klikając przycisk powyżej</p>
                </div>
              )}
              {todayBookings.map((booking) => {
                const time = formatBookingTime(booking.scheduledAt);
                return (
                  <div key={booking.id} onClick={() => handleViewBooking(booking)}
                    className="p-5 sm:p-6 bg-[#FDF8F0] rounded-[2.5rem] border border-[#F7E7CE]/30 flex flex-col sm:flex-row items-stretch sm:items-center gap-5 sm:gap-8 hover:bg-white hover:shadow-lg transition-all cursor-pointer group">
                    <div className="flex items-center justify-between sm:flex-col sm:justify-center sm:min-w-[100px] sm:border-r border-slate-200 sm:pr-8 shrink-0">
                      <span className="text-2xl font-extrabold text-[#102C26] font-mono">{time}</span>
                      <span className={`text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-lg`} style={{ color: booking.statusColor || '#102C26', backgroundColor: (booking.statusColor || '#F7E7CE') + '20' }}>{booking.status}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xl font-bold text-[#102C26] truncate">{booking.vehicle.brand} {booking.vehicle.model}</h5>
                      <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">{booking.services.join(', ') || 'Brak usług'}</p>
                      <p className="text-[13px] font-bold text-[#5A8A7A] mt-1.5"><UserCheck size={11} className="inline mr-1" />{booking.client.name}</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="bg-[#102C26] text-[#F7E7CE] px-4 py-2 rounded-xl font-mono text-[16px] font-semibold tracking-widest uppercase">{booking.vehicle.licensePlate}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-8 border border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] font-semibold text-[#5A8A7A] uppercase tracking-[0.4em] mb-1">Finanse Studia</p>
                <h3 className="text-3xl lg:text-4xl font-bold text-[#102C26] tracking-tighter">{revPeriod === 'weekly' ? chartData.weekly.reduce((s, d) => s + d.rev, 0).toLocaleString('pl-PL') : chartData.monthly.reduce((s, d) => s + d.rev, 0).toLocaleString('pl-PL')}<span className="text-[16px] font-semibold text-[#5A8A7A] uppercase ml-2">PLN</span></h3>
              </div>
              <div className="flex p-1 bg-[#FDF8F0] rounded-[0.75rem] border border-[#E8D5B5] h-fit shrink-0">
                <button onClick={() => setRevPeriod('weekly')} className={`px-5 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-widest transition-all ${revPeriod === 'weekly' ? 'bg-[#102C26] text-[#F7E7CE]' : 'text-slate-400'}`}>Tydzień</button>
                <button onClick={() => setRevPeriod('monthly')} className={`px-5 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-widest transition-all ${revPeriod === 'monthly' ? 'bg-[#102C26] text-[#F7E7CE]' : 'text-slate-400'}`}>Miesiąc</button>
              </div>
            </div>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revPeriod === 'weekly' ? chartData.weekly : chartData.monthly}>
                  <defs><linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#102C26" stopOpacity={0.15} /><stop offset="95%" stopColor="#102C26" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f3f5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#adb5bd', fontSize: 10, fontWeight: 700 }} />
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontWeight: 700 }} formatter={(value: number) => value.toFixed(2) + ' PLN'} />
                  <Area type="monotone" dataKey="rev" stroke="#102C26" strokeWidth={4} fill="url(#colorEmerald)" name="Przychód" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-lg lg:text-xl font-bold text-[#102C26] tracking-tight">Nadchodzące</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">następne {upcomingBookings.length} rezerwacji</p>
              </div>
              <button onClick={() => onNavigate?.('Tasks')} className="text-[9px] font-semibold text-[#5A8A7A] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">Zobacz Zlecenia <ChevronRight size={14} /></button>
            </div>
            <div className="space-y-3">
              {upcomingBookings.slice(0, 4).map(booking => {
                const dt = new Date(booking.scheduledAt);
                const day = String(dt.getDate()).padStart(2, '0');
                const monthIdx = dt.getMonth();
                return (
                  <div key={booking.id} onClick={() => handleViewBooking(booking)} className="p-5 bg-[#FDF8F0] rounded-[2rem] flex items-center gap-6 hover:bg-white hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-[#F7E7CE]/30">
                    <div className="text-center shrink-0 min-w-[60px]">
                      <p className="text-2xl font-extrabold text-[#102C26] font-mono leading-none">{day}</p>
                      <p className="text-[9px] font-semibold text-[#5A8A7A] uppercase tracking-widest">{['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'][monthIdx]}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-bold text-[#102C26] truncate">{booking.vehicle.brand} {booking.vehicle.model}</h5>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{booking.services.join(', ') || 'Brak usług'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-extrabold text-[#102C26] font-mono">{((booking.totalPrice || 0) / 100).toFixed(2).replace('.', ',')}</p>
                      <p className="text-[8px] font-semibold text-slate-400 uppercase">PLN</p>
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
          <div className="bg-white rounded-[2.5rem] lg:rounded-[3rem] p-6 sm:p-8 border border-slate-100 shadow-sm">
            <h4 className="text-xl font-bold text-[#102C26] tracking-tight mb-6">Szybkie Akcje</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Rezerwacja', icon: Calendar, action: handleOpenNewBooking, color: 'bg-[#F7E7CE]/20 text-[#102C26] hover:bg-[#F7E7CE]/40' },
                { label: 'Nowy Klient', icon: User, action: () => setIsClientModalOpen(true), color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
                { label: 'Magazyn', icon: Package, action: () => onNavigate?.('Inventory'), color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
              ].map((qa, i) => (
                <button key={i} onClick={qa.action} className={`${qa.color} p-4 rounded-2xl flex flex-col items-center gap-2.5 transition-all active:scale-95`}>
                  <qa.icon size={22} strokeWidth={2} />
                  <span className="text-[11px] font-semibold uppercase tracking-widest">{qa.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stock Alerts */}
          <div className="bg-white rounded-[2.5rem] lg:rounded-[3rem] p-6 sm:p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-bold text-[#102C26] tracking-tight">Alerty Magazynowe</h4>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${lowStockItems.length > 0 ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-[#F7E7CE]/20 text-[#102C26] border-[#F7E7CE]/40'}`}><Package size={18} /></div>
            </div>
            {lowStockItems.length === 0 ? (
              <div className="text-center py-6"><p className="text-sm font-bold text-[#102C26]">✓ Wszystko w normie</p></div>
            ) : (
              <div className="space-y-3">
                {lowStockItems.map(item => (
                  <div key={item.id} className="p-4 rounded-[1.5rem] bg-amber-50/50 border border-amber-100/50 flex items-center justify-between">
                    <div>
                      <h5 className="text-[14px] font-bold text-[#102C26] truncate">{item.name}</h5>
                      <p className="text-[12px] font-semibold text-amber-500 uppercase tracking-widest">{item.categoryName || 'Brak kategorii'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-extrabold text-amber-600 font-mono">{item.stock}<span className="text-[14px] ml-0.5 opacity-60">{item.unit}</span></p>
                      <p className="text-[14px] font-semibold text-slate-400 uppercase">min. {item.minStock}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-[2.5rem] lg:rounded-[3rem] p-6 sm:p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-[#0b2826] tracking-tight">Aktywność</h4>
              <div className="w-10 h-10 bg-[#102C26] text-[#F7E7CE] rounded-xl flex items-center justify-center"><Activity size={18} /></div>
            </div>
            <div className="space-y-1">
              {activityFeed.map(item => (
                <div key={item.id} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}><item.icon size={16} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-[800] text-[#102C26] leading-tight">{item.text}</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-0.5 truncate">{item.sub}</p>
                  </div>
                  <span className="text-[8px] font-bold text-slate-300 whitespace-nowrap shrink-0 mt-0.5">{item.time}</span>
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
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${confirmation?.type === 'Ukończona' ? 'bg-[#F7E7CE]/20 text-[#102C26]' : 'bg-red-50 text-red-500'}`}><AlertCircle size={32} /></div>
            <div><p className="text-lg font-bold text-[#102C26] leading-tight">{confirmation?.type === 'Ukończona' ? 'Zakończyć to zlecenie?' : 'Anulować tę rezerwację?'}</p></div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setConfirmation(null)} className="flex-1 py-5 bg-white border border-slate-200 text-slate-400 rounded-2xl font-semibold text-[10px] uppercase tracking-widest">Wróć</button>
            <button onClick={() => setConfirmation(null)} className={`flex-1 py-5 rounded-2xl font-semibold text-[10px] uppercase tracking-widest text-white shadow-xl ${confirmation?.type === 'Ukończona' ? 'bg-[#102C26] text-[#F7E7CE]' : 'bg-red-500'}`}>Tak</button>
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
          <button type="submit" className="w-full py-5 bg-[#102C26] text-[#F7E7CE] rounded-2xl font-semibold text-[10px] uppercase tracking-widest shadow-xl">Załóż Kartę Klienta</button>
        </form>
      </Modal>

      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title={isEditingBooking ? (selectedBooking ? 'Edytuj' : 'Nowa Rezerwacja') : 'Detale Zlecenia'}>
        {!isEditingBooking && selectedBooking ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="p-8 bg-[#102C26] rounded-[2.5rem] border border-white/5 relative overflow-hidden">
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-[#F7E7CE]"><User size={24} /></div>
                    <div>
                      <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">Klient</p>
                      <h4 className="text-xl font-normal text-white tracking-tighter">{selectedBooking.client.name}</h4>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    {selectedBooking.client.phone && (
                      <a href={`tel:${selectedBooking.client.phone}`} className="flex items-center gap-2 text-[#F7E7CE] hover:text-white transition-colors">
                        <Phone size={14} /><span className="text-l font-semibold font-mono">{selectedBooking.client.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {selectedBooking.client.phone && <a href={`tel:${selectedBooking.client.phone}`} className="w-12 h-12 bg-[#F7E7CE] text-[#102C26] rounded-xl flex items-center justify-center active:scale-90 transition-transform"><Phone size={20} /></a>}
                  {selectedBooking.client.phone && <a href={`sms:${selectedBooking.client.phone}`} className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center active:scale-90 transition-transform"><MessageSquare size={20} /></a>}
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#5A8A7A] shadow-sm"><Clock size={28} /></div>
                <div>
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Termin</p>
                  <p className="text-lg font-bold text-[#102C26]">{new Date(selectedBooking.scheduledAt).toLocaleDateString('pl-PL')} • {formatBookingTime(selectedBooking.scheduledAt)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold text-[#102C26] font-mono leading-none tracking-tighter">{((selectedBooking.totalPrice || 0) / 100).toFixed(2).replace('.', ',')}</p>
                <p className="text-[9px] font-semibold text-[#5A8A7A] uppercase mt-1 tracking-widest">PLN Netto</p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-semibold text-[#5A8A7A] uppercase tracking-[0.4em] ml-4">Zakres Prac</p>
              <div className="flex flex-wrap gap-2">
                {selectedBooking.services.map(s => (
                  <span key={s} className="px-5 py-3 bg-[#102C26] text-[#F7E7CE] rounded-xl text-[12px] font-semibold uppercase tracking-widest shadow-md">{s}</span>
                ))}
                {selectedBooking.services.length === 0 && <span className="text-sm text-slate-400">Brak przypisanych usług</span>}
              </div>
            </div>
            {selectedBooking.notes && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-[#5A8A7A] uppercase tracking-[0.4em] ml-4">Notatki</p>
                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl">{selectedBooking.notes}</p>
              </div>
            )}
            <div className="flex gap-4 pt-6">
              <button onClick={() => setIsBookingModalOpen(false)} className="flex-1 py-5 bg-[#102C26] text-[#F7E7CE] rounded-[1.5rem] font-semibold text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Zamknij</button>
            </div>
          </div>
        ) : (
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
                  <div className="relative">
                    <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Szukaj..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-sm outline-none focus:ring-4 focus:ring-[#F7E7CE]/30" />
                  </div>
                  {clientSearch.trim() && filteredClientResults.map(res => (
                    <button key={res.vehicle.id} type="button" onClick={() => { setSelectedVehicle(res); setClientSearch(''); }} className="w-full p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-[#F7E7CE] transition-all">
                      <div className="text-left"><h5 className="font-semibold text-[#102C26] text-sm">{res.vehicle.brand} {res.vehicle.model}</h5><p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">{res.client.name}</p></div>
                      <div className="bg-[#102C26] text-[#F7E7CE] px-3 py-1.5 rounded-xl font-mono text-[11px] font-semibold tracking-widest">{res.vehicle.licensePlate}</div>
                    </button>
                  ))}
                  {selectedVehicle && (
                    <div className="p-6 bg-[#F7E7CE]/20 border-2 border-[#F7E7CE]/50 rounded-[1.5rem] flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <CarIcon size={24} className="text-[#5A8A7A]" />
                        <div><h5 className="font-semibold text-[#102C26] text-sm">{selectedVehicle.vehicle.brand} {selectedVehicle.vehicle.model}</h5><p className="text-[9px] font-semibold text-[#5A8A7A] uppercase tracking-widest">{selectedVehicle.client.name}</p></div>
                      </div>
                      <div className="font-mono text-xs font-semibold text-[#102C26] whitespace-nowrap">{selectedVehicle.vehicle.licensePlate}</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4 bg-slate-50 p-6 rounded-[1.5rem] mt-2 border border-slate-100">
                  <div className="space-y-3">
                    <h5 className="font-semibold text-[#102C26] text-xs uppercase tracking-widest mb-3">Dane Klienta</h5>
                    <input type="text" placeholder="Imię i Nazwisko *" value={newClientName} onChange={e => setNewClientName(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#F7E7CE]/50" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="tel" placeholder="Telefon *" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#F7E7CE]/50" />
                      <input type="email" placeholder="Email (opcjonalnie)" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#F7E7CE]/50" />
                    </div>
                    <input type="text" placeholder="NIP (opcjonalnie)" value={newBookingClientNip} onChange={e => setNewBookingClientNip(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#F7E7CE]/50" />
                  </div>
                  <div className="space-y-3 pt-3 border-t border-slate-200">
                    <h5 className="font-semibold text-[#102C26] text-xs uppercase tracking-widest mb-3">Dane Pojazdu</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Marka" value={newVehicleBrand} onChange={e => setNewVehicleBrand(e.target.value)} className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#F7E7CE]/50" />
                      <input type="text" placeholder="Model" value={newVehicleModel} onChange={e => setNewVehicleModel(e.target.value)} className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#F7E7CE]/50" />
                    </div>
                    <input type="text" placeholder="Nr Rejestracyjny *" value={newVehiclePlate} onChange={e => setNewVehiclePlate(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#F7E7CE]/50 uppercase" />
                  </div>
                  <button type="button" onClick={handleAddNewClientForBooking} className="w-full py-4 mt-2 bg-[#102C26] text-[#F7E7CE] rounded-2xl font-semibold text-[10px] uppercase tracking-widest shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <UserPlus size={16} strokeWidth={2.5} /> Dodaj Klienta i Wybierz
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-semibold text-[#5A8A7A] uppercase tracking-widest ml-4">Wybierz Usługi</label>
              <div className="flex flex-wrap gap-2">
                {availableServices.map(svc => (
                  <button key={svc.id} type="button" onClick={() => toggleService(svc.id)} className={`px-4 py-3 rounded-xl text-[9px] font-semibold uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${selectedServices.includes(svc.id) ? 'bg-[#102C26] text-[#F7E7CE] border-[#102C26]' : 'bg-slate-50 text-slate-400 border-transparent'}`}>
                    {selectedServices.includes(svc.id) && <Check size={12} strokeWidth={4} />} {svc.name}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <input type="text" value={customServiceInput} onChange={e => setCustomServiceInput(e.target.value)} placeholder="Dodaj inną usługę..." className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-[#F7E7CE]/30" />
                <button type="button" onClick={handleAddCustomService} className="w-14 h-14 bg-[#102C26] text-[#F7E7CE] rounded-2xl flex items-center justify-center shadow-lg active:scale-95"><Plus size={24} /></button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4">Cena Netto</label><input type="text" value={priceInput} onChange={e => setPriceInput(e.target.value)} className="w-full px-6 py-5 bg-[#102C26] text-[#F7E7CE] border-none rounded-[1.5rem] font-semibold text-xl font-mono" /></div>
              <div className="space-y-2"><label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4">Data</label><input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-sm outline-none" /></div>
              <div className="space-y-2"><label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4">Godzina</label><input type="time" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-sm outline-none" /></div>
            </div>
            <button type="submit" className="w-full py-6 bg-[#102C26] text-[#F7E7CE] rounded-[1.5rem] font-semibold text-[11px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"><Save size={18} /> Zapisz Rezerwację</button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
