import React, { useState, useMemo } from 'react';
import { LayoutList, Search, CalendarDays } from 'lucide-react';
import type { Booking } from '@/features/bookings/model/types';

import { useBookings } from '@/features/bookings/api/bookings';
import { useBookingStatusChange } from '@/features/bookings/hooks/useBookingStatusChange';
import { visibleBookings } from '@/features/bookings/model/filters';
import InProgressTab from '@/features/bookings/components/InProgressTab';
import SearchTab from '@/features/bookings/components/SearchTab';
import CalendarTab from '@/features/bookings/components/CalendarTab';
import BookingDetailsModal from '@/features/bookings/components/BookingDetailsModal';
import CreateBookingModal from '@/features/bookings/components/CreateBookingModal';
import { CreateClientModal } from '@/features/clients';
import GlobalHeader from '@/shared/ui/GlobalHeader';

const TasksView: React.FC = () => {
  const { data: bookings = [], isLoading: loading } = useBookings();

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isCreateBookingModalOpen, setIsCreateBookingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'in-progress' | 'calendar' | 'search'>('in-progress');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const { requestStatusChange, confirmDialog } = useBookingStatusChange();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const activeBookings = useMemo(() => visibleBookings(bookings), [bookings]);

  const handleOpenNewBooking = () => {
    setIsCreateBookingModalOpen(true);
  };

  const handleViewBooking = (booking: Booking) => {
    const dt = new Date(booking.scheduledAt);
    setSelectedDate(dt.toISOString().split('T')[0]);
    setSelectedBooking(booking);
    setIsBookingModalOpen(true);
  };

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
        <InProgressTab
          bookings={activeBookings}
          loading={loading}
          onOpen={handleViewBooking}
          onRequestStatusChange={requestStatusChange}
        />
      ) : activeTab === 'search' ? (
        <SearchTab bookings={activeBookings} onOpen={handleViewBooking} onRequestStatusChange={requestStatusChange} />
      ) : (
        <CalendarTab
          bookings={activeBookings}
          loading={loading}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onOpen={handleViewBooking}
          onRequestStatusChange={requestStatusChange}
        />
      )}

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

export default TasksView;
