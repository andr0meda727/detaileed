import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  X,
  Clock,
  Car as CarIcon,
  User,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  LayoutList,
  Search,
  CalendarDays,
  Hash,
  Phone,
  MessageSquare,
  AlertCircle,
  Check,
  Plus,
  Wrench,
  UserPlus,
  Save,
  Calendar,
  MoreHorizontal,
} from 'lucide-react';
import { BookingResponseDto, BookingCreateDto } from '@/types';
import { BOOKING_STATUSES } from '@/constants';
import { completeBooking, cancelBooking, updateBooking } from '@/features/bookings/api/bookingService';
import { useBookings } from '@/features/bookings/api/bookings';
import { useClients } from '@/hooks/useClients';
import { useServices } from '@/hooks/useServices';
import { getApiErrorMessage } from '@/shared/lib/errorHandler';
import CreateBookingModal from '@/features/bookings/components/CreateBookingModal';
import CreateClientModal from '@/components/modals/CreateClientModal';
import GlobalHeader from '@/shared/ui/GlobalHeader';
import Modal from '@/shared/ui/Modal';
import { useToast } from '@/shared/ui/ToastContext';
import Skeleton from '@/shared/ui/Skeleton';

const TasksView: React.FC = () => {
  const { data: bookings = [], isLoading: loading, refetch: refetchBookings } = useBookings();

  const { data: clients = [], refetch: refetchClients } = useClients();
  const { data: availableServices = [], refetch: refetchServices } = useServices();

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isCreateBookingModalOpen, setIsCreateBookingModalOpen] = useState(false);
  const fetchData = useCallback(() => {
    refetchBookings();
    refetchClients();
    refetchServices();
  }, [refetchBookings, refetchClients, refetchServices]);
  const [activeTab, setActiveTab] = useState<'in-progress' | 'calendar' | 'search'>('in-progress');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [inProgressSearchQuery, setInProgressSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [debouncedInProgressSearchQuery, setDebouncedInProgressSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'UTWORZONA' | 'ZAKONCZONA' | 'ANULOWANA'>('all');

  const { addToast } = useToast();
  const [selectedBooking, setSelectedBooking] = useState<BookingResponseDto | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    id: string;
    type: (typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES];
    booking: BookingResponseDto;
  } | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearchQuery(searchQuery), 140);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedInProgressSearchQuery(inProgressSearchQuery), 140);
    return () => clearTimeout(timeout);
  }, [inProgressSearchQuery]);

  const activeBookings = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    // Start of current week (Monday)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    weekStart.setHours(0, 0, 0, 0);

    return bookings.filter((b) => {
      // Zlecenia w toku (Utworzone) – zawsze widoczne
      if (b.status === BOOKING_STATUSES.UTWORZONA.name) return true;
      // Zakończone – tylko z bieżącego tygodnia
      if (b.status === BOOKING_STATUSES.ZAKONCZONA.name) {
        const d = new Date(b.completedAt || b.scheduledAt);
        return d >= weekStart;
      }
      // Anulowane – tylko dzisiaj
      if (b.status === BOOKING_STATUSES.ANULOWANA.name) {
        const dateToCheck = b.completedAt || b.scheduledAt;
        return dateToCheck.startsWith(todayStr);
      }
      return true;
    });
  }, [bookings]);

  const inProgressBookings = useMemo(() => {
    let filtered = [...activeBookings];

    if (filterStatus !== 'all') {
      filtered = filtered.filter((b) => b.status === BOOKING_STATUSES[filterStatus]?.name);
    }
    if (debouncedInProgressSearchQuery.trim()) {
      const q = debouncedInProgressSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.services.join(' ').toLowerCase().includes(q) ||
          b.client.name.toLowerCase().includes(q) ||
          (b.vehicle.brand || '').toLowerCase().includes(q) ||
          (b.vehicle.model || '').toLowerCase().includes(q) ||
          b.vehicle.licensePlate.toLowerCase().includes(q),
      );
    }
    return filtered.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  }, [activeBookings, filterStatus, debouncedInProgressSearchQuery]);
  const groupedInProgressBookings = useMemo(() => {
    const grouped = inProgressBookings.reduce(
      (acc, booking) => {
        const date = booking.scheduledAt.split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(booking);
        return acc;
      },
      {} as Record<string, BookingResponseDto[]>,
    );
    return Object.entries(grouped)
      .map(([date, bks]) => ({ date, bookings: bks }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [inProgressBookings]);
  const selectedDayBookings = useMemo(
    () =>
      activeBookings
        .filter((b) => b.scheduledAt.startsWith(selectedDate))
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    [activeBookings, selectedDate],
  );

  const globalSearchResults = useMemo(() => {
    if (!debouncedSearchQuery) return [];
    const q = debouncedSearchQuery.toLowerCase();
    return activeBookings
      .filter(
        (b) =>
          b.services.join(' ').toLowerCase().includes(q) ||
          b.client.name.toLowerCase().includes(q) ||
          (b.vehicle.brand || '').toLowerCase().includes(q) ||
          (b.vehicle.model || '').toLowerCase().includes(q) ||
          b.vehicle.licensePlate.toLowerCase().includes(q),
      )
      .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
  }, [activeBookings, debouncedSearchQuery]);

  const calendarDays = useMemo(() => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    const total = new Date(y, m + 1, 0).getDate();
    const start = (new Date(y, m, 1).getDay() + 6) % 7;
    const d: (number | null)[] = [];
    for (let i = 0; i < start; i++) d.push(null);
    for (let i = 1; i <= total; i++) d.push(i);
    return d;
  }, [currentMonth]);

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  const formatDateShort = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const handleOpenNewBooking = () => {
    setIsCreateBookingModalOpen(true);
  };

  const handleViewBooking = (booking: BookingResponseDto) => {
    const dt = new Date(booking.scheduledAt);
    setSelectedDate(dt.toISOString().split('T')[0]);
    setSelectedBooking(booking);
    setIsBookingModalOpen(true);
  };

  const handleQuickUpdateStatus = async (
    booking: BookingResponseDto,
    targetStatus: (typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES],
  ) => {
    try {
      if (targetStatus.id === BOOKING_STATUSES.ZAKONCZONA.id) {
        await completeBooking(booking.id);
      } else if (targetStatus.id === BOOKING_STATUSES.ANULOWANA.id) {
        await cancelBooking(booking.id);
      } else {
        const dto: BookingCreateDto = {
          vehicleId: booking.vehicle.id,
          clientId: booking.client.id,
          scheduledAt: booking.scheduledAt,
          statusId: targetStatus.id,
          serviceIds: [], // We don't have availableServices easily here, but usually for just status we might not need it if backend allows partial update or ignores it if not changed. Wait, backend might require it. Better to just use complete/cancel for now as requested.
        };
        // If we really need to update status to something else, we might need availableServices.
        // For now, let's keep it simple as dashboard mostly uses complete/cancel quick actions.
      }

      addToast(`Status rezerwacji zmieniony na: ${targetStatus.name}`, 'success');
      fetchData();
    } catch (err) {
      console.error('Failed to update booking status:', err);
      addToast(getApiErrorMessage(err, 'Wystąpił błąd podczas zmiany statusu.'), 'error');
    } finally {
      setConfirmation(null);
    }
  };

  const confirmStatusUpdate = (
    e: React.MouseEvent,
    booking: BookingResponseDto,
    targetStatus: (typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES],
  ) => {
    e.stopPropagation();
    setConfirmation({ id: booking.id, type: targetStatus, booking });
  };

  const renderBookingCard = (booking: BookingResponseDto, index: number = 0) => (
    <div
      key={booking.id}
      onClick={() => handleViewBooking(booking)}
      className={`floating-card flex flex-col sm:flex-row items-stretch cursor-pointer ${activeDropdownId === booking.id ? 'relative z-50' : 'relative z-10'}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Date/Time column */}
      <div
        className="p-5 sm:p-6 flex flex-col items-center justify-center min-w-[110px] shrink-0 rounded-t-[1rem] sm:rounded-t-none sm:rounded-l-[1rem]"
        style={{ borderRight: '1px solid rgba(26,46,30,0.05)', background: 'rgba(26,46,30,0.02)' }}
      >
        <span className="text-2xl font-bold text-green-deep font-mono leading-none">
          {formatDateShort(booking.scheduledAt)}
        </span>
        <span className="text-[10px] font-semibold text-green-deep/35 font-mono tracking-widest mt-2">
          {formatTime(booking.scheduledAt)}
        </span>
      </div>
      {/* Content */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-green-deep text-cream-warm px-4 py-1.5 rounded-lg font-mono text-[13px] font-bold tracking-widest shadow-sm">
            {booking.vehicle.licensePlate}
          </span>
          <h4 className="font-sans font-bold text-green-deep text-base tracking-tight truncate">
            {booking.vehicle.brand} {booking.vehicle.model}
          </h4>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <div className="flex flex-wrap gap-1.5">
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
              <span className="text-[11px] font-semibold text-green-deep/30 uppercase tracking-wide">Brak usług</span>
            )}
          </div>
          <span className="text-[11px] font-semibold text-green-light/70">
            <User size={10} className="inline mr-1" />
            {booking.client.name}
          </span>
        </div>
      </div>
      {/* Status + quick actions */}
      <div
        className="px-5 sm:px-6 py-4 flex items-center justify-end gap-3 sm:shrink-0 rounded-b-[1rem] sm:rounded-b-none sm:rounded-r-[1rem]"
        style={{ borderTop: '1px solid rgba(26,46,30,0.04)', background: 'rgba(26,46,30,0.01)' }}
      >
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
                      confirmStatusUpdate(e, booking, BOOKING_STATUSES.ZAKONCZONA);
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
                      confirmStatusUpdate(e, booking, BOOKING_STATUSES.ANULOWANA);
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
        <span
          className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border"
          style={{
            color: booking.statusColor || 'var(--green-deep)',
            borderColor: (booking.statusColor || 'var(--green-deep)') + '35',
            backgroundColor: (booking.statusColor || 'var(--green-deep)') + '10',
          }}
        >
          {booking.status}
        </span>
      </div>
    </div>
  );

  // Removed full-page loading to keep layout static

  return (
    <div className="space-y-8 pb-20">
      <GlobalHeader
        title="Rezerwacje"
        subtitle="Harmonogram"
        onAddBooking={handleOpenNewBooking}
        onAddClient={() => setIsClientModalOpen(true)}
      />

      {/* Tab switcher */}
      <div
        className="flex p-1.5 w-full md:w-[440px] rounded-full"
        style={{
          background: 'white',
          border: '1px solid rgba(26,46,30,0.07)',
          boxShadow: '0 4px 16px -4px rgba(0,0,0,0.04)',
        }}
      >
        <button
          onClick={() => setActiveTab('in-progress')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'in-progress' ? 'bg-green-deep text-cream-warm shadow-lg' : 'text-green-deep/40 hover:text-green-deep'}`}
        >
          <LayoutList size={16} /> Zlecenia
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'calendar' ? 'bg-green-deep text-cream-warm shadow-lg' : 'text-green-deep/40 hover:text-green-deep'}`}
        >
          <CalendarDays size={16} /> Kalendarz
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'search' ? 'bg-green-deep text-cream-warm shadow-lg' : 'text-green-deep/40 hover:text-green-deep'}`}
        >
          <Search size={16} /> Wyszukiwarka
        </button>
      </div>

      {activeTab === 'in-progress' ? (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: 'all', label: 'Wszystkie' },
                  { id: 'UTWORZONA', label: 'W toku' },
                  { id: 'ZAKONCZONA', label: 'Ukończone' },
                  { id: 'ANULOWANA', label: 'Anulowane' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filterStatus === f.id ? 'bg-green-deep text-cream-warm shadow-md' : 'bg-white text-slate-400 border border-slate-200 hover:border-green-deep/20'}`}
                >
                  {f.label}
                </button>
              ))}
              {/* Tooltip info */}
              <div className="relative group ml-1">
                <div className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center cursor-help hover:bg-green-deep hover:text-cream-warm hover:border-green-deep transition-all text-[10px] font-bold select-none">
                  ?
                </div>
                <div
                  className="absolute left-0 top-8 z-50 w-68 p-4 rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 text-left"
                  style={{ background: '#1a2e1e', width: '260px' }}
                >
                  <p
                    className="text-[9px] font-bold uppercase tracking-widest mb-3"
                    style={{ color: 'rgba(245,240,232,0.5)' }}
                  >
                    Zasady wyświetlania
                  </p>
                  <ul className="space-y-2 text-[11px] font-medium leading-snug" style={{ color: '#f5f0e8' }}>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5"></span>
                      <span>
                        Zlecenia <strong>w toku</strong> – zawsze widoczne
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                      <span>
                        Zlecenia <strong>ukończone</strong> – z bieżącego tygodnia
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5"></span>
                      <span>
                        Zlecenia <strong>anulowane</strong> – tylko z dzisiaj
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="relative w-full md:w-[300px]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Szukaj zlecenia..."
                value={inProgressSearchQuery}
                onChange={(e) => setInProgressSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-xs outline-none focus:ring-2 focus:ring-cream-warm/50 focus:border-cream-warm transition-all"
              />
            </div>
          </div>
          {loading ? (
            <div className="space-y-8">
              {[1, 2].map((dayIdx) => (
                <div key={dayIdx} className="space-y-4">
                  <Skeleton width="200px" height="20px" className="ml-2 mb-4" />
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="floating-card-static flex flex-col sm:flex-row items-stretch sm:items-center overflow-hidden h-auto sm:h-[104px]"
                      >
                        <div
                          className="w-full sm:w-28 p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-slate-50 flex flex-col items-center justify-center shrink-0"
                          style={{ background: 'rgba(26,46,30,0.01)' }}
                        >
                          <Skeleton width="40px" height="24px" className="mb-2 rounded-md" />
                          <Skeleton width="32px" height="12px" className="rounded-md" />
                        </div>
                        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Skeleton width="70px" height="22px" className="rounded-lg" />
                            <Skeleton width="120px" height="20px" className="rounded-lg" />
                          </div>
                          <div className="flex flex-wrap gap-4">
                            <Skeleton width="30%" height="14px" className="rounded-md" />
                            <Skeleton width="20%" height="14px" className="rounded-md" />
                          </div>
                        </div>
                        <div
                          className="px-5 sm:px-6 py-4 flex items-center justify-end sm:shrink-0"
                          style={{ borderTop: '1px solid rgba(26,46,30,0.02)', background: 'rgba(26,46,30,0.005)' }}
                        >
                          <Skeleton width="80px" height="28px" className="rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`space-y-8 transition-opacity duration-200 ${inProgressSearchQuery !== debouncedInProgressSearchQuery ? 'opacity-70' : 'opacity-100'}`}
            >
              {groupedInProgressBookings.length > 0 ? (
                groupedInProgressBookings.map((group) => (
                  <div key={group.date} className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2 border-b border-slate-100 pb-2 mb-4">
                      {new Date(group.date).toLocaleDateString('pl-PL', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </h3>
                    <div className="space-y-4">{group.bookings.map((b, idx) => renderBookingCard(b, idx))}</div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl p-24 text-center border-2 border-dashed border-slate-100">
                  <div className="w-20 h-20 bg-cream-warm/20 text-green-deep rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-2xl font-semibold text-green-deep tracking-tighter">Brak zleceń</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
                    Brak przypisanych rezerwacji.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : activeTab === 'search' ? (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-green-deep tracking-tighter">Wyszukiwarka</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                Przeszukaj wszystkie rezerwacje w systemie
              </p>
            </div>
            <div className="relative w-full md:w-[420px]">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Tablica, klient, model, usługa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-cream-warm/20 focus:border-cream-warm transition-all"
                style={{ paddingLeft: '3rem' }}
                autoFocus
              />
            </div>
          </div>
          {!searchQuery ? (
            <div className="bg-white rounded-2xl p-20 text-center border-2 border-dashed border-slate-100">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={28} className="text-slate-300" />
              </div>
              <p className="text-slate-400 text-sm font-semibold">Wpisz frazę aby wyszukać rezerwację</p>
            </div>
          ) : (
            <div
              className={`space-y-4 transition-opacity duration-200 ${searchQuery !== debouncedSearchQuery ? 'opacity-70' : 'opacity-100'}`}
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  Wyniki dla: &ldquo;{searchQuery}&rdquo;
                </span>
                <span className="text-[10px] font-semibold text-green-light uppercase tracking-widest">
                  Znaleziono: {globalSearchResults.length}
                </span>
              </div>
              {globalSearchResults.length > 0 ? (
                globalSearchResults.map((b, idx) => renderBookingCard(b, idx))
              ) : (
                <div className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-slate-100">
                  <p className="text-slate-400 text-sm font-semibold">Brak wyników</p>
                  <p className="text-slate-300 text-xs font-bold uppercase tracking-widest mt-1">Spróbuj innej frazy</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          <div className="flex flex-col xl:flex-row gap-10">
            <div className="w-full xl:w-[420px] floating-card-static p-7 shrink-0">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-sans font-bold text-green-deep capitalize">
                  {currentMonth.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
                    }
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-green-deep/40 hover:text-green-deep hover:bg-green-pale/30 transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
                    }
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-green-deep/40 hover:text-green-deep hover:bg-green-pale/30 transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1.5 mb-3">
                {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map((d) => (
                  <div
                    key={d}
                    className="text-center text-[9px] font-bold text-green-deep/25 uppercase tracking-widest py-2"
                  >
                    {d}
                  </div>
                ))}
                {calendarDays.map((day, idx) => {
                  if (!day) return <div key={`e-${idx}`} />;
                  const ds = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSel = ds === selectedDate;
                  const hasB = bookings.some(
                    (b) =>
                      b.scheduledAt.startsWith(ds) &&
                      b.status !== BOOKING_STATUSES.ANULOWANA.name &&
                      b.status !== BOOKING_STATUSES.ZAKONCZONA.name,
                  );
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(ds)}
                      className={`relative aspect-square rounded-[0.65rem] flex flex-col items-center justify-center text-sm font-semibold transition-all duration-200 ${
                        isSel
                          ? 'bg-green-deep text-cream-warm shadow-lg scale-105 z-10'
                          : 'hover:bg-green-pale/30 text-green-deep/70'
                      }`}
                    >
                      {day}
                      {hasB && (
                        <div
                          className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${isSel ? 'bg-amber' : 'bg-green-light'}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex-1 space-y-6">
              <div className="bg-green-deep rounded-2xl p-8 flex items-center justify-between gap-4 border border-white/5 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-cream-warm/10 blur-[60px] rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <p className="text-[10px] font-semibold text-cream-warm uppercase tracking-[0.4em] mb-2">
                    Wybrana Data
                  </p>
                  <h4 className="text-3xl font-extrabold text-white tracking-tighter capitalize leading-none">
                    {new Date(selectedDate).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}
                  </h4>
                </div>
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
                  <CalendarIcon size={24} color="#ffffff" strokeWidth={2} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {loading ? (
                  [1, 2].map((i) => (
                    <div
                      key={i}
                      className="floating-card-static flex flex-col sm:flex-row items-center h-24 bg-white/50"
                    >
                      <div className="w-24 border-r pr-6 flex items-center justify-center shrink-0 border-slate-100">
                        <Skeleton width="40px" height="20px" />
                      </div>
                      <div className="flex-1 p-6 space-y-2">
                        <Skeleton width="40%" height="16px" />
                        <Skeleton width="20%" height="10px" />
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    {selectedDayBookings.length > 0 ? (
                      selectedDayBookings.map((b, idx) => renderBookingCard(b, idx))
                    ) : (
                      <div className="bg-[#f8f9fa] rounded-2xl p-16 text-center border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
                          Brak rezerwacji w tym dniu
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title="Detale Zlecenia">
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
                    {((selectedBooking.totalPrice || 0) / 100).toFixed(2).replace('.', ',')}
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
                    <X size={16} strokeWidth={2.5} /> Anuluj
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

      <CreateBookingModal isOpen={isCreateBookingModalOpen} onClose={() => setIsCreateBookingModalOpen(false)} />

      <CreateClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} />

      {/* Confirmation Modal */}
      <Modal isOpen={!!confirmation} onClose={() => setConfirmation(null)} title="Zmień Status">
        <div className="space-y-8">
          <div className="flex items-center gap-6 p-8 bg-slate-50 rounded-2xl">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${confirmation?.type.id === BOOKING_STATUSES.ZAKONCZONA.id ? 'bg-cream-warm/20 text-green-deep' : 'bg-red-50 text-red-500'}`}
            >
              <AlertCircle size={32} />
            </div>
            <div>
              <p className="text-lg font-bold text-green-deep leading-tight mb-2">
                {confirmation?.type.id === BOOKING_STATUSES.ZAKONCZONA.id
                  ? 'Zakończyć to zlecenie?'
                  : 'Anulować tę rezerwację?'}
              </p>
              <p className="text-sm text-slate-500 font-semibold">
                {confirmation?.booking.vehicle.brand} {confirmation?.booking.vehicle.model}
              </p>
              <p className="text-xs text-slate-400 font-mono mt-1">{confirmation?.booking.vehicle.licensePlate}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setConfirmation(null)}
              className="flex-1 py-5 bg-white border border-slate-200 text-slate-400 rounded-xl font-semibold text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Wróć
            </button>
            <button
              onClick={() => confirmation && handleQuickUpdateStatus(confirmation.booking, confirmation.type)}
              className={`flex-1 py-5 rounded-xl font-semibold text-[11px] uppercase tracking-widest text-white shadow-xl hover:shadow-2xl active:scale-95 transition-all ${confirmation?.type.id === BOOKING_STATUSES.ZAKONCZONA.id ? 'bg-green-deep text-cream-warm' : 'bg-red-500'}`}
            >
              Tak, kontynuuj
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TasksView;
