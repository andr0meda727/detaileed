import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, History, Car as CarIcon, User, Clock, CheckCircle2, XCircle, Download } from 'lucide-react';
import { BookingResponseDto } from '../../types';
import { useBookings } from '../../hooks/useBookings';
import { useToast } from '../../contexts/ToastContext';
import GlobalHeader from '../../components/GlobalHeader';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';

const ArchivedView: React.FC = () => {
  const { addToast } = useToast();
  const { data: bookings = [], isLoading: loading } = useBookings({ isCompleted: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<BookingResponseDto | null>(null);

  const filteredBookings = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return bookings.filter(
      (b) =>
        b.services.join(' ').toLowerCase().includes(q) ||
        b.client.name.toLowerCase().includes(q) ||
        b.vehicle.licensePlate.toLowerCase().includes(q),
    );
  }, [searchQuery, bookings]);

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  const formatDateShort = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  // Removed full-page loading to keep layout static

  return (
    <div className="space-y-8 pb-20">
      <GlobalHeader
        title="Archiwum"
        subtitle="Pełna Historia Operacyjna • DetailFlow"
        onAddBooking={() => addToast('Globalny moduł tworzenia rezerwacji zostanie podpięty w kolejnym kroku.', 'info')}
        onAddClient={() =>
          addToast('Globalny moduł szybkiego dodawania klienta zostanie podpięty w kolejnym kroku.', 'info')
        }
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-light transition-colors">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Szukaj w historii..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-8 py-5 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none shadow-sm focus:ring-8 focus:ring-cream-warm/20 focus:border-cream-warm/40 transition-all"
          />
        </div>
        <button className="bg-green-deep text-cream-warm px-8 py-5 rounded-2xl font-semibold text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
          <Download size={16} /> Eksportuj
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="floating-card-static p-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-6 h-auto sm:h-[104px]"
            >
              <div className="w-24 sm:border-r border-slate-50 flex flex-col items-center justify-center shrink-0 space-y-2">
                <Skeleton width="48px" height="24px" className="rounded-md" />
                <Skeleton width="36px" height="12px" className="rounded-md" />
              </div>
              <div className="flex-1 min-w-0 space-y-3 flex flex-col justify-center">
                <div className="flex items-center gap-3">
                  <Skeleton width="70px" height="22px" className="rounded-lg shrink-0" />
                  <Skeleton width="140px" height="22px" className="rounded-lg" />
                </div>
                <Skeleton width="40%" height="16px" className="rounded-md" />
              </div>
              <div className="flex flex-col items-end justify-center shrink-0 space-y-3">
                <Skeleton width="80px" height="28px" className="rounded-lg" />
                <Skeleton width="60px" height="14px" className="rounded-md" />
              </div>
            </div>
          ))
        ) : (
          <>
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                onClick={() => setSelectedBooking(booking)}
                className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-6 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="w-24 sm:border-r border-slate-100 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xl font-extrabold text-green-deep font-mono">
                    {formatDateShort(booking.scheduledAt)}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-1">
                    {formatTime(booking.scheduledAt)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="bg-green-deep text-cream-warm px-3 py-1 rounded-lg font-mono text-[10px] font-semibold">
                      {booking.vehicle.licensePlate}
                    </span>
                    <h4 className="text-lg font-bold text-green-deep truncate">
                      {booking.vehicle.brand} {booking.vehicle.model}
                    </h4>
                  </div>
                  <p className="text-xs font-bold text-slate-500 truncate">
                    {booking.services.join(', ') || 'Brak usług'}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-center shrink-0">
                  <p className="text-xl font-extrabold text-green-deep font-mono leading-none">
                    {((booking.totalPrice || 0) / 100).toFixed(2).replace('.', ',')}
                  </p>
                  <span
                    className="text-[9px] font-semibold uppercase mt-1"
                    style={{ color: booking.statusColor || '#22c55e' }}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
        {!loading && filteredBookings.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg font-bold text-slate-300">Brak archiwalnych zleceń</p>
          </div>
        )}
      </div>

      <Modal isOpen={!!selectedBooking} onClose={() => setSelectedBooking(null)} title="Szczegóły Archiwalne">
        {selectedBooking && (
          <div className="space-y-6">
            <div className="p-6 bg-green-deep rounded-3xl text-cream-warm flex items-center justify-between">
              <div>
                <p className="text-[9px] font-semibold text-white/40 uppercase tracking-widest mb-1">Klient</p>
                <h4 className="text-xl font-semibold">{selectedBooking.client.name}</h4>
              </div>
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                <User size={24} />
              </div>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Pojazd</span>
                <span className="text-sm font-semibold text-green-deep">
                  {selectedBooking.vehicle.brand} {selectedBooking.vehicle.model} •{' '}
                  {selectedBooking.vehicle.licensePlate}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-4">
                <span className="text-xs font-bold text-slate-400 uppercase">Usługi</span>
                <span className="text-sm font-semibold text-green-deep">
                  {selectedBooking.services.join(', ') || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-4">
                <span className="text-xs font-bold text-slate-400 uppercase">Cena Netto</span>
                <span className="text-xl font-semibold text-green-deep font-mono">
                  {((selectedBooking.totalPrice || 0) / 100).toFixed(2)} PLN
                </span>
              </div>
              {selectedBooking.notes && (
                <div className="border-t border-slate-200 pt-4">
                  <span className="text-xs font-bold text-slate-400 uppercase">Notatki</span>
                  <p className="text-sm text-slate-600 mt-1">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full py-5 bg-green-deep text-cream-warm rounded-2xl font-semibold text-[10px] uppercase tracking-widest"
            >
              Zamknij
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ArchivedView;
