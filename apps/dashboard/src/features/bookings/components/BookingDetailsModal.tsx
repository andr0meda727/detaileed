import React from 'react';
import { Check, Clock, MessageSquare, Phone, User, X } from 'lucide-react';
import { Button, Modal } from '@detaileed/ui';
import { formatPln } from '@/shared/lib/money';
import type { Booking } from '@/features/bookings/model/types';
import { BOOKING_STATUSES, type BookingStatus } from '@/features/bookings/model/statuses';
import { formatBookingTime } from '@/features/bookings/model/format';
import BookingStatusBadge from '@/features/bookings/components/BookingStatusBadge';
import { useStudioTimeZone } from '@/features/studios';
import { formatInZone } from '@/shared/lib/studioTime';

interface BookingDetailsModalProps {
  /** The booking to show; null closes the modal. */
  booking: Booking | null;
  onClose: () => void;
  onRequestStatusChange: (booking: Booking, status: BookingStatus) => void;
}

/** Client, date, price, services and notes of a booking, with complete/cancel for open ones. */
const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, onClose, onRequestStatusChange }) => {
  const timeZone = useStudioTimeZone();
  return (
    <>
      <Modal isOpen={booking !== null} onClose={onClose} title="Detale Zlecenia">
        {booking && (
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
                      <h4 className="text-xl font-normal text-white tracking-tighter">{booking.client.name}</h4>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    {booking.client.phone && (
                      <a
                        href={`tel:${booking.client.phone}`}
                        className="flex items-center gap-2 text-cream-warm hover:text-white transition-colors"
                      >
                        <Phone size={14} />
                        <span className="text-l font-semibold font-mono">{booking.client.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {booking.client.phone && (
                    <a
                      href={`tel:${booking.client.phone}`}
                      className="w-12 h-12 bg-cream-warm text-green-deep rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <Phone size={20} />
                    </a>
                  )}
                  {booking.client.phone && (
                    <a
                      href={`sms:${booking.client.phone}`}
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
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-green-light shadow-xs">
                  <Clock size={28} />
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Termin</p>
                  <p className="text-lg font-bold text-green-deep">
                    {formatInZone(booking.scheduledAt, timeZone, { dateStyle: 'short' })} •{' '}
                    {formatBookingTime(booking.scheduledAt, timeZone)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <BookingStatusBadge booking={booking} size="lg" className="mb-2" />
                <div className="flex flex-col items-end">
                  <p className="text-3xl font-extrabold text-green-deep font-mono leading-none tracking-tighter">
                    {formatPln(booking.totalPrice)}
                  </p>
                  <p className="text-[9px] font-semibold text-green-light uppercase mt-1 tracking-widest">PLN Netto</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-semibold text-green-light uppercase tracking-[0.4em] ml-4">Zakres Prac</p>
              <div className="flex flex-wrap gap-2">
                {booking.services.map((s) => (
                  <span
                    key={s}
                    className="px-5 py-3 bg-green-deep text-cream-warm rounded-xl text-[12px] font-semibold uppercase tracking-widest shadow-md"
                  >
                    {s}
                  </span>
                ))}
                {booking.services.length === 0 && (
                  <span className="text-sm text-slate-400">Brak przypisanych usług</span>
                )}
              </div>
            </div>
            {booking.notes && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-green-light uppercase tracking-[0.4em] ml-4">Notatki</p>
                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl">{booking.notes}</p>
              </div>
            )}
            <div className="flex gap-4 pt-6">
              {booking.status === BOOKING_STATUSES.UTWORZONA.name && (
                <>
                  <Button
                    variant="success"
                    icon={Check}
                    size="lg"
                    className="flex-1"
                    onClick={() => {
                      onClose();
                      onRequestStatusChange(booking, BOOKING_STATUSES.ZAKONCZONA);
                    }}
                  >
                    Zakończ
                  </Button>
                  <Button
                    variant="danger"
                    icon={X}
                    size="lg"
                    className="flex-1"
                    onClick={() => {
                      onClose();
                      onRequestStatusChange(booking, BOOKING_STATUSES.ANULOWANA);
                    }}
                  >
                    Anuluj
                  </Button>
                </>
              )}
              <Button
                size="lg"
                onClick={() => onClose()}
                className={booking.status === BOOKING_STATUSES.UTWORZONA.name ? 'flex-none' : 'flex-1'}
              >
                Zamknij
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default BookingDetailsModal;
