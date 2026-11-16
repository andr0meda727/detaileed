import React, { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { useClients, CreateClientModal } from '@/features/clients';

import { BOOKING_STATUSES, useBookings, type Booking } from '@/features/bookings';

import { isLowStock, useInventory } from '@/features/inventory';
import { useServices } from '@/features/services';

import GlobalHeader from '@/shared/ui/GlobalHeader';

import DashboardStats from '@/features/dashboard-home/components/DashboardStats';
import RevenueChart from '@/features/dashboard-home/components/RevenueChart';
import { BookingDetailsModal, CreateBookingModal, useBookingStatusChange } from '@/features/bookings';
import { AddVehicleModal } from '@/features/clients';

import { useStudio } from '@/features/studios';

import GreetingBanner from '@/features/dashboard-home/components/GreetingBanner';
import TodaySchedule from '@/features/dashboard-home/components/TodaySchedule';
import UpcomingBookings from '@/features/dashboard-home/components/UpcomingBookings';
import QuickActions from '@/features/dashboard-home/components/QuickActions';
import StockAlerts from '@/features/dashboard-home/components/StockAlerts';
import ActivityFeed from '@/features/dashboard-home/components/ActivityFeed';

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

  if (loading && !bookings.length && !clients.length && !inventory.length && !availableServices.length) {
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <GlobalHeader
        title="Panel"
        subtitle={`Studio ${selectedStudio?.name}`}
        onAddBooking={handleOpenNewBooking}
        onAddClient={() => setIsClientModalOpen(true)}
      />

      <GreetingBanner loading={showLoading} todayCount={todayBookings.length} upcomingCount={upcomingBookings.length} />

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
          <TodaySchedule
            bookings={todayBookings}
            loading={showLoading}
            onOpen={handleViewBooking}
            onRequestStatusChange={requestStatusChange}
          />

          {/* Revenue Chart */}
          <RevenueChart bookings={completedBookings} />

          <UpcomingBookings
            bookings={upcomingBookings}
            loading={loading}
            onOpen={handleViewBooking}
            onShowAll={() => goTo('/s/$studioId/tasks')}
          />
        </div>

        {/* === RIGHT COLUMN === */}
        <div className="lg:col-span-4 flex flex-col gap-6 lg:gap-8">
          <QuickActions
            onNewBooking={handleOpenNewBooking}
            onNewClient={() => setIsClientModalOpen(true)}
            onNewVehicle={handleOpenNewVehicle}
            onOpenInventory={() => goTo('/s/$studioId/inventory')}
          />

          <StockAlerts items={lowStockItems} loading={showLoading} />

          <ActivityFeed />
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
