import React, { useState, useMemo } from 'react';
import { LayoutList, Search, CalendarDays } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@detaileed/ui';
import type { Booking } from '@/features/bookings/model/types';

import { useBookings } from '@/features/bookings/api/bookings';
import { useBookingStatusChange } from '@/features/bookings/hooks/useBookingStatusChange';
import { visibleBookings } from '@/features/bookings/model/filters';
import { dayInZone, todayInZone } from '@detaileed/domain/studioTime';
import { useStudioTimeZone } from '@/features/studios';
import { InProgressTab } from '@/features/bookings/components/tasks/InProgressTab';
import { SearchTab } from '@/features/bookings/components/tasks/SearchTab';
import { CalendarTab } from '@/features/bookings/components/tasks/CalendarTab';
import { BookingDetailsModal } from '@/features/bookings/components/BookingDetailsModal';
import { CreateBookingModal } from '@/features/bookings/components/form/CreateBookingModal';
import { CreateClientModal } from '@/features/clients';
import { GlobalHeader } from '@/shared/ui/GlobalHeader';

type TasksTab = 'in-progress' | 'calendar' | 'search';

export const TasksView: React.FC = () => {
  const { data: bookings = [], isLoading: loading } = useBookings();

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isCreateBookingModalOpen, setIsCreateBookingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TasksTab>('in-progress');
  const timeZone = useStudioTimeZone();
  const [selectedDate, setSelectedDate] = useState<string>(() => todayInZone(timeZone));

  const { requestStatusChange, confirmDialog } = useBookingStatusChange();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const activeBookings = useMemo(() => visibleBookings(bookings, timeZone), [bookings, timeZone]);

  const handleViewBooking = (booking: Booking) => {
    setSelectedDate(dayInZone(booking.scheduledAt, timeZone));
    setSelectedBooking(booking);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-20">
      <GlobalHeader
        title="Rezerwacje"
        subtitle="Harmonogram"
        onAddBooking={() => setIsCreateBookingModalOpen(true)}
        onAddClient={() => setIsClientModalOpen(true)}
      />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TasksTab)}>
        <TabsList aria-label="Widok rezerwacji">
          <TabsTrigger value="in-progress">
            <LayoutList strokeWidth={1.75} aria-hidden /> Zlecenia
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarDays strokeWidth={1.75} aria-hidden /> Kalendarz
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search strokeWidth={1.75} aria-hidden /> Wyszukiwarka
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress">
          <InProgressTab
            bookings={activeBookings}
            loading={loading}
            onOpen={handleViewBooking}
            onRequestStatusChange={requestStatusChange}
          />
        </TabsContent>
        <TabsContent value="calendar">
          <CalendarTab
            bookings={activeBookings}
            loading={loading}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onOpen={handleViewBooking}
            onRequestStatusChange={requestStatusChange}
          />
        </TabsContent>
        <TabsContent value="search">
          <SearchTab bookings={activeBookings} onOpen={handleViewBooking} onRequestStatusChange={requestStatusChange} />
        </TabsContent>
      </Tabs>

      <CreateBookingModal isOpen={isCreateBookingModalOpen} onClose={() => setIsCreateBookingModalOpen(false)} />

      <CreateClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} />

      <BookingDetailsModal
        booking={isBookingModalOpen ? selectedBooking : null}
        onClose={() => setIsBookingModalOpen(false)}
        onRequestStatusChange={requestStatusChange}
      />
      {confirmDialog}
    </div>
  );
};
