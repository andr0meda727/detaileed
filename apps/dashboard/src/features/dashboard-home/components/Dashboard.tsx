import React, { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { useClients, CreateClientModal } from '@/features/clients';

import { BOOKING_STATUSES, useBookings, type Booking } from '@/features/bookings';

import { isLowStock, useInventory } from '@/features/inventory';
import { useServices } from '@/features/services';

import { DashboardStats } from '@/features/dashboard-home/components/DashboardStats';
import { RevenueChart } from '@/features/dashboard-home/components/RevenueChart';
import { BookingDetailsModal, CreateBookingModal, useBookingStatusChange } from '@/features/bookings';
import { AddVehicleModal } from '@/features/clients';

import { useStudio, useStudioTimeZone } from '@/features/studios';
import { dayInZone, todayInZone } from '@detaileed/domain/studioTime';

import { GreetingBanner } from '@/features/dashboard-home/components/GreetingBanner';
import { TodaySchedule } from '@/features/dashboard-home/components/TodaySchedule';
import { UpcomingBookings } from '@/features/dashboard-home/components/UpcomingBookings';
import { QuickActions } from '@/features/dashboard-home/components/QuickActions';
import { StockAlerts } from '@/features/dashboard-home/components/StockAlerts';
import { ActivityFeed } from '@/features/dashboard-home/components/ActivityFeed';

export const Dashboard: React.FC = () => {
  const { requestStatusChange, confirmDialog } = useBookingStatusChange();
  const navigate = useNavigate();
  const { data: bookings = [], isLoading: bookingsLoading } = useBookings();
  const { data: inventory = [], isLoading: inventoryLoading } = useInventory();
  const { data: clients = [], isLoading: clientsLoading, refetch: refetchClients } = useClients();
  const { data: availableServices = [], isLoading: servicesLoading } = useServices();

  // Show the loading state only while nothing is cached yet: once any bookings, clients, stock or services are
  // there, a background refetch shouldn't make the page flicker.
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

  const timeZone = useStudioTimeZone();
  const today = todayInZone(timeZone);
  const lowStockItems = useMemo(() => inventory.filter(isLowStock), [inventory]);
  const completedBookings = useMemo(() => bookings.filter((b) => b.completedAt !== null), [bookings]);
  const todayBookings = useMemo(
    () =>
      bookings
        .filter((b) => dayInZone(b.scheduledAt, timeZone) === today)
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    [bookings, today, timeZone],
  );
  const upcomingBookings = useMemo(
    () =>
      bookings
        .filter((b) => dayInZone(b.scheduledAt, timeZone) !== today && new Date(b.scheduledAt) > new Date())
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    [bookings, today, timeZone],
  );
  const activeCount = useMemo(
    () => bookings.filter((b) => b.status === BOOKING_STATUSES.UTWORZONA.name).length,
    [bookings],
  );
  const completedCount = useMemo(() => bookings.filter((b) => b.completedAt !== null).length, [bookings]);
  const todayCompletedBookings = useMemo(
    () => completedBookings.filter((b) => dayInZone(b.scheduledAt, timeZone) === today),
    [completedBookings, today, timeZone],
  );
  const todayRevenue = useMemo(
    () => todayCompletedBookings.reduce((sum, b) => sum + b.totalPrice, 0),
    [todayCompletedBookings],
  );

  const handleOpenNewBooking = () => setIsBookingModalOpen(true);
  const handleViewBooking = (booking: Booking) => setSelectedBooking(booking);

  return (
    <div className="flex flex-col gap-6">
      <GreetingBanner
        loading={showLoading}
        todayCount={todayBookings.length}
        upcomingCount={upcomingBookings.length}
        onAddBooking={handleOpenNewBooking}
        onAddClient={() => setIsClientModalOpen(true)}
      />

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
