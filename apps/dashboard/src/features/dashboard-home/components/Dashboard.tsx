import React, { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Calendar,
  Package,
  Car as CarIcon,
  X,
  CheckCircle2,
  Check,
  User,
  Wrench,
  Activity,
  CreditCard,
  ChevronRight,
  AlertTriangle,
  UserCheck,
  MoreHorizontal,
} from 'lucide-react';

import { useClients, CreateClientModal } from '@/features/clients';

import { BOOKING_STATUSES, useBookings, type Booking } from '@/features/bookings';
import { formatPln } from '@/shared/lib/money';
import { isLowStock, useInventory } from '@/features/inventory';
import { useServices } from '@/features/services';

import GlobalHeader from '@/shared/ui/GlobalHeader';

import DashboardStats from '@/features/dashboard-home/components/DashboardStats';
import RevenueChart from '@/features/dashboard-home/components/RevenueChart';
import { BookingDetailsModal, CreateBookingModal, useBookingStatusChange } from '@/features/bookings';
import { AddVehicleModal } from '@/features/clients';

import { useStudio } from '@/features/studios';
import Skeleton from '@/shared/ui/Skeleton';

// Chart data is now computed dynamically from fetched bookings

const activityFeed = [
  {
    id: 1,
    text: 'Nowe zlecenie dodane',
    sub: 'Sprawdź zakładkę rezerwacji',
    time: '14 min temu',
    icon: CheckCircle2,
    color: 'text-green-deep bg-cream-warm/30',
  },
  {
    id: 2,
    text: 'Nowa rezerwacja w systemie',
    sub: 'Klient dodany automatycznie',
    time: '32 min temu',
    icon: Calendar,
    color: 'text-blue-500 bg-blue-50',
  },
  {
    id: 3,
    text: 'Niski stan magazynowy',
    sub: 'Sprawdź magazyn',
    time: '1 godz. temu',
    icon: AlertTriangle,
    color: 'text-amber-500 bg-amber-50',
  },
  {
    id: 4,
    text: 'System zaktualizowany',
    sub: 'Synchronizacja z backendem',
    time: '2 godz. temu',
    icon: CreditCard,
    color: 'text-violet-500 bg-violet-50',
  },
  {
    id: 5,
    text: 'Dane załadowane poprawnie',
    sub: 'API połączone',
    time: '3 godz. temu',
    icon: Wrench,
    color: 'text-cyan-500 bg-cyan-50',
  },
];

const Dashboard: React.FC = () => {
  const { requestStatusChange, confirmDialog } = useBookingStatusChange();
  const navigate = useNavigate();
  const { data: bookings = [], isLoading: bookingsLoading } = useBookings();
  const { data: inventory = [], isLoading: inventoryLoading } = useInventory();
  const { data: clients = [], isLoading: clientsLoading, refetch: refetchClients } = useClients();
  const { data: availableServices = [], isLoading: servicesLoading } = useServices();

  // Natywne rozwiązanie Anti-Flicker z pominięciem opóźnień:
  // Hook isPending z React Query zgłosi brak danych tylko początkowo.
  // Aby chronić się przed "tikami" przeglądarki podczas odmountowywania, żądamy wymuszenia flagi na podstawie obiektywnej zawartości zwrotnej (czy faktycznie nie ma żadnych rezerwacji, usług, stoku, ani klientów w pamięci lokalnej/cache).
  const isDataFound = bookings.length > 0 || clients.length > 0 || inventory.length > 0 || availableServices.length > 0;
  const loading = (bookingsLoading || inventoryLoading || clientsLoading || servicesLoading) && !isDataFound;
  const showLoading = loading;
  const { selectedStudio } = useStudio();
  const goTo = (to: '/s/$studioId/tasks' | '/s/$studioId/inventory') =>
    void navigate({ to, params: { studioId: selectedStudio?.studioId ?? '' } });

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  // A new key per opening gives the vehicle form a fresh state.
  const [vehicleModalKey, setVehicleModalKey] = useState(0);
  const handleOpenNewVehicle = () => {
    setVehicleModalKey((k) => k + 1);
    setIsVehicleModalOpen(true);
  };
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // New client form state

  // New vehicle form state

  // Form mode
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const lowStockItems = useMemo(() => inventory.filter(isLowStock), [inventory]);
  const completedBookings = useMemo(() => bookings.filter((b) => b.completedAt !== null), [bookings]);
  const todayBookings = useMemo(
    () =>
      bookings
        .filter((b) => b.scheduledAt.startsWith(today))
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    [bookings, today],
  );
  const upcomingBookings = useMemo(
    () =>
      bookings
        .filter((b) => b.scheduledAt.startsWith(today) === false && b.scheduledAt > new Date().toISOString())
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    [bookings, today],
  );
  const activeCount = useMemo(
    () => bookings.filter((b) => b.status === BOOKING_STATUSES.UTWORZONA.name).length,
    [bookings],
  );
  const completedCount = useMemo(() => bookings.filter((b) => b.completedAt !== null).length, [bookings]);
  const todayCompletedBookings = useMemo(
    () => completedBookings.filter((b) => b.scheduledAt.startsWith(today)),
    [completedBookings, today],
  );
  const todayRevenue = useMemo(
    () => todayCompletedBookings.reduce((sum, b) => sum + b.totalPrice, 0),
    [todayCompletedBookings],
  );

  // Wykres przeniesiony do izolowanego komponentu w ./components/RevenueChart

  const handleOpenNewBooking = () => setIsBookingModalOpen(true);
  const handleViewBooking = (booking: Booking) => setSelectedBooking(booking);

  // CreateClient form refactored to use CreateClientModal

  const formatBookingTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Dzień dobry' : hour < 18 ? 'Cześć' : 'Dobry wieczór';
  const dayNames = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
  const monthNames = [
    'stycznia',
    'lutego',
    'marca',
    'kwietnia',
    'maja',
    'czerwca',
    'lipca',
    'sierpnia',
    'września',
    'października',
    'listopada',
    'grudnia',
  ];
  const dateStr = `${dayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  if (loading && !bookings.length && !clients.length && !inventory.length && !availableServices.length) {
    // Retain variables but render with phantom-ui
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <GlobalHeader
        title="Panel"
        subtitle={`Studio ${selectedStudio?.name}`}
        onAddBooking={handleOpenNewBooking}
        onAddClient={() => setIsClientModalOpen(true)}
      />

      {/* Greeting Banner */}
      <div
        className="relative rounded-xl p-6 lg:p-8 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a2e1e 0%, #1e3523 50%, #152b1a 100%)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(237,231,216,0.1) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(232,168,48,0.06) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className="text-[11px] font-bold text-cream-warm uppercase tracking-[0.4em] mb-3">{dateStr}</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white leading-none">{greeting} 👋</h2>
            <div className="text-white/40 text-[13px] font-medium mt-3 max-w-md h-5 flex items-center">
              {showLoading ? (
                <Skeleton width="200px" height="14px" className="bg-white/10" />
              ) : (
                <span className="">
                  Masz <span className="text-cream-warm font-bold">{todayBookings.length}</span>{' '}
                  {todayBookings.length === 1 ? 'zlecenie' : 'zleceń'} na dziś i{' '}
                  <span className="text-cream-warm font-bold">{upcomingBookings.length}</span> nadchodzących.
                </span>
              )}
            </div>
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
        loading={showLoading}
      />

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* === LEFT COLUMN === */}
        <div className="lg:col-span-8 flex flex-col gap-6 lg:gap-8">
          {/* Today's Schedule */}
          <div className="floating-card-static p-6 lg:p-7 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-xl font-sans font-bold text-green-deep">Dzisiejszy Grafik</h4>
                <p className="text-[11px] font-semibold text-green-light/60 uppercase tracking-wide mt-1 h-3 flex items-center">
                  {showLoading ? (
                    <Skeleton width="120px" height="10px" />
                  ) : (
                    <span className="">
                      {todayBookings.length} {todayBookings.length === 1 ? 'zlecenie' : 'zleceń'} zaplanowanych
                    </span>
                  )}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-deep text-cream-warm rounded-[0.875rem] flex items-center justify-center shadow-lg shrink-0">
                <Calendar size={17} />
              </div>
            </div>
            <div className="space-y-3">
              {showLoading ? (
                [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 sm:p-5 rounded-xl flex items-center gap-6 bg-slate-50 border border-slate-100"
                  >
                    <div className="w-20 border-r pr-6 shrink-0 border-slate-200 flex flex-col items-center justify-center gap-2">
                      <Skeleton width="40px" height="14px" className="rounded" />
                      <Skeleton width="54px" height="18px" className="rounded-md" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-2">
                      <Skeleton width="60%" height="18px" className="rounded-lg" />
                      <Skeleton width="40%" height="12px" className="rounded-md" />
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {todayBookings.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                        style={{ background: 'rgba(26,46,30,0.05)' }}
                      >
                        <Calendar size={24} className="text-green-deep/20" />
                      </div>
                      <p className="text-base font-semibold text-green-deep/25">Brak zleceń na dziś</p>
                      <p className="text-xs text-green-deep/20 mt-1 font-medium">
                        Dodaj nową rezerwację klikając + powyżej
                      </p>
                    </div>
                  )}
                  {todayBookings.map((booking) => {
                    const time = formatBookingTime(booking.scheduledAt);
                    return (
                      <div
                        key={booking.id}
                        onClick={() => handleViewBooking(booking)}
                        className={`p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 cursor-pointer group transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.08)] ${activeDropdownId === booking.id ? 'relative z-50' : 'relative z-10'}`}
                        style={{ background: 'rgba(26,46,30,0.03)', border: '1px solid rgba(26,46,30,0.05)' }}
                      >
                        <div
                          className="flex items-center justify-between sm:flex-col sm:justify-center sm:min-w-[90px] sm:border-r sm:pr-6 shrink-0"
                          style={{ borderColor: 'rgba(26,46,30,0.08)' }}
                        >
                          <span className="text-xl font-bold text-green-deep font-mono">{time}</span>
                          <span
                            className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border mt-1.5"
                            style={{
                              color: booking.statusColor || 'var(--green-deep)',
                              borderColor: (booking.statusColor || 'var(--green-deep)') + '40',
                              backgroundColor: (booking.statusColor || 'var(--green-deep)') + '12',
                            }}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-lg font-sans font-bold text-green-deep truncate">
                            {booking.vehicle.brand} {booking.vehicle.model}
                          </h5>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {booking.services.length > 0 ? (
                              booking.services.map((s, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-amber text-green-deep shadow-sm"
                                >
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] font-bold text-green-deep/30 uppercase tracking-widest mt-0.5">
                                Brak usług
                              </span>
                            )}
                          </div>
                          <p className="text-[12px] font-semibold text-green-light mt-1">
                            <UserCheck size={10} className="inline mr-1" />
                            {booking.client.name}
                          </p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          {booking.status === BOOKING_STATUSES.UTWORZONA.name && (
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdownId(activeDropdownId === booking.id ? null : booking.id);
                                }}
                                title="Więcej akcji"
                                className="w-11 h-11 flex items-center justify-center rounded-xl bg-white text-slate-500 hover:bg-slate-50 hover:text-green-deep transition-all active:scale-95 border border-slate-200 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]"
                              >
                                <MoreHorizontal size={22} strokeWidth={2.5} />
                              </button>
                              {activeDropdownId === booking.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-40"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveDropdownId(null);
                                    }}
                                  />
                                  <div
                                    className="absolute right-0 top-12 z-50 w-48 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 py-1.5 animate-zoom-in"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      onClick={(e) => {
                                        setActiveDropdownId(null);
                                        e.stopPropagation();
                                        requestStatusChange(booking, BOOKING_STATUSES.ZAKONCZONA);
                                      }}
                                      className="w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-green-50 transition-colors text-[12px] font-bold text-green-deep"
                                    >
                                      <div className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                                        <Check size={14} strokeWidth={2.5} />
                                      </div>
                                      Zakończ zlecenie
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        setActiveDropdownId(null);
                                        e.stopPropagation();
                                        requestStatusChange(booking, BOOKING_STATUSES.ANULOWANA);
                                      }}
                                      className="w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-red-50 transition-colors text-[12px] font-bold text-red-500"
                                    >
                                      <div className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                        <X size={14} strokeWidth={2.5} />
                                      </div>
                                      Anuluj zlecenie
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                          <div className="bg-green-deep text-cream-warm px-4 py-2.5 rounded-xl font-mono text-[15px] font-bold tracking-wider uppercase shadow-md">
                            {booking.vehicle.licensePlate}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* Revenue Chart */}
          <RevenueChart bookings={completedBookings} />

          {/* Upcoming Bookings */}
          <div className="floating-card-static p-6 lg:p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-lg lg:text-xl font-sans font-bold text-green-deep">Nadchodzące</h4>
                  <p className="text-[11px] font-semibold text-green-light/60 uppercase tracking-wide mt-1">
                    następne {upcomingBookings.length} rezerwacji
                  </p>
                </div>
                <button
                  onClick={() => goTo('/s/$studioId/tasks')}
                  className="text-[9px] font-semibold text-green-light uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Wszystkie <ChevronRight size={13} />
                </button>
              </div>
              <div className="space-y-2">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl flex items-center gap-5"
                        style={{ background: 'rgba(26,46,30,0.03)', border: '1px solid rgba(26,46,30,0.05)' }}
                      >
                        <div
                          className="text-center shrink-0 min-w-[50px] border-r pr-4"
                          style={{ borderColor: 'rgba(26,46,30,0.08)' }}
                        >
                          <Skeleton width="30px" height="24px" className="mx-auto mb-1 rounded-md" />
                          <Skeleton width="24px" height="10px" className="mx-auto" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <Skeleton width="100px" height="16px" className="rounded-md" />
                          <Skeleton width="60%" height="12px" className="rounded-md" />
                        </div>
                        <div className="text-right shrink-0">
                          <Skeleton width="60px" height="20px" className="rounded-md" />
                        </div>
                      </div>
                    ))
                  : upcomingBookings.slice(0, 4).map((booking) => {
                      const dt = new Date(booking.scheduledAt);
                      const day = String(dt.getDate()).padStart(2, '0');
                      const monthIdx = dt.getMonth();
                      return (
                        <div
                          key={booking.id}
                          onClick={() => handleViewBooking(booking)}
                          className="p-4 rounded-xl flex items-center gap-5 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.07)]"
                          style={{ background: 'rgba(26,46,30,0.03)', border: '1px solid rgba(26,46,30,0.05)' }}
                        >
                          <div
                            className="text-center shrink-0 min-w-[50px] border-r pr-4"
                            style={{ borderColor: 'rgba(26,46,30,0.08)' }}
                          >
                            <p className="text-xl font-bold text-green-deep font-mono leading-none">{day}</p>
                            <p className="text-[8px] font-bold text-green-light/60 uppercase tracking-wider">
                              {
                                ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'][
                                  monthIdx
                                ]
                              }
                            </p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-bold text-green-deep truncate">
                              {booking.vehicle.brand} {booking.vehicle.model}
                            </h5>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {booking.services.length > 0 ? (
                                booking.services.map((s, idx) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-amber text-green-deep shadow-sm"
                                  >
                                    {s}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[8px] font-bold text-green-deep/30 uppercase tracking-widest">
                                  Brak usług
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-base font-bold text-green-deep font-mono">
                              {formatPln(booking.totalPrice)} <span className="text-[9px] text-green-deep/35">zł</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
              </div>
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN === */}
        <div className="lg:col-span-4 flex flex-col gap-6 lg:gap-8">
          {/* Quick Actions */}
          <div className="floating-card-static p-6 sm:p-7">
            <h4 className="text-lg font-sans font-bold text-green-deep mb-5">Szybkie Akcje</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: 'Nowa Rezerwacja',
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
                  action: () => goTo('/s/$studioId/inventory'),
                  style: {
                    background: 'linear-gradient(135deg, #f0ebe0 0%, #e8e0d0 100%)',
                    color: '#1a2e1e',
                    border: '1px solid rgba(26,46,30,0.1)',
                  },
                  iconColor: '#3d6b46',
                },
              ].map((qa, i) => (
                <button
                  key={i}
                  onClick={qa.action}
                  className="p-4 rounded-2xl flex flex-col items-center gap-2.5 transition-all active:scale-95 hover:-translate-y-1 hover:shadow-lg duration-200"
                  style={qa.style}
                >
                  <qa.icon size={22} strokeWidth={2} color={qa.iconColor} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{qa.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stock Alerts */}
          <div className="floating-card-static p-6 sm:p-7">
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-lg font-sans font-bold text-green-deep">Alerty Magazynowe</h4>
              <div
                className={`w-9 h-9 rounded-[0.875rem] flex items-center justify-center ${lowStockItems.length > 0 ? 'bg-amber/15 text-amber' : 'bg-green-pale/40 text-green-light'}`}
              >
                <Package size={16} />
              </div>
            </div>
            {showLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl flex items-center justify-between bg-slate-50 border border-slate-100"
                  >
                    <div className="flex-1 flex flex-col justify-center gap-2">
                      <Skeleton width="60%" height="14px" className="rounded-md" />
                      <Skeleton width="40%" height="10px" className="rounded" />
                    </div>
                    <Skeleton width="40px" height="24px" className="rounded-lg" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="">
                {lowStockItems.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="w-10 h-10 bg-green-pale/40 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-green-light text-lg">✓</span>
                    </div>
                    <p className="text-sm font-semibold text-green-deep/50">Wszystko w normie</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {lowStockItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl flex items-center justify-between"
                        style={{ background: 'rgba(232,168,48,0.07)', border: '1px solid rgba(232,168,48,0.15)' }}
                      >
                        <div>
                          <h5 className="text-[13px] font-bold text-green-deep truncate">{item.name}</h5>
                          <p className="text-[10px] font-semibold text-amber uppercase tracking-widest">
                            {item.categoryName || 'Brak kategorii'}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-base font-bold text-amber font-mono">
                            {item.stock}
                            <span className="text-[11px] ml-0.5 opacity-60">{item.unit}</span>
                          </p>
                          <p className="text-[10px] font-semibold text-green-deep/35 uppercase">min. {item.minStock}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="floating-card-static p-6 sm:p-7">
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-lg font-sans font-bold text-green-deep">Aktywność</h4>
              <div className="w-9 h-9 bg-green-deep text-cream-warm rounded-[0.875rem] flex items-center justify-center">
                <Activity size={16} />
              </div>
            </div>
            <div className="space-y-0.5">
              {activityFeed.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3.5 p-3 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-[rgba(26,46,30,0.04)]"
                  style={{ borderRadius: '1rem' }}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-green-deep leading-tight">{item.text}</p>
                    <p className="text-[9px] font-semibold text-green-deep/35 mt-0.5 truncate">{item.sub}</p>
                  </div>
                  <span className="text-[8px] font-semibold text-green-deep/25 whitespace-nowrap shrink-0 mt-0.5">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* === MODALS === */}
      {confirmDialog}

      <CreateClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSuccess={() => refetchClients()}
      />

      <AddVehicleModal key={vehicleModalKey} isOpen={isVehicleModalOpen} onClose={() => setIsVehicleModalOpen(false)} />

      <BookingDetailsModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onRequestStatusChange={requestStatusChange}
      />

      <CreateBookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />
    </div>
  );
};

export default Dashboard;
