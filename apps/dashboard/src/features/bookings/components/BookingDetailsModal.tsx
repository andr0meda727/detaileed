import React from 'react';
import { Check, MessageSquare, Phone, X, type LucideIcon } from 'lucide-react';
import { Avatar, Button, Modal } from '@detaileed/ui';
import { formatPln } from '@detaileed/domain/money';
import type { Booking } from '@/features/bookings/model/types';
import { BOOKING_STATUSES, type BookingStatus } from '@/features/bookings/model/statuses';
import { formatBookingTime } from '@/features/bookings/model/format';
import { BookingStatusBadge } from '@/features/bookings/components/BookingStatusBadge';
import { useStudioTimeZone } from '@/features/studios';
import { ConsumptionSection } from '@/features/inventory';
import { formatInZone } from '@detaileed/domain/studioTime';

interface BookingDetailsModalProps {
  /** The booking to show; null closes the modal. */
  booking: Booking | null;
  onClose: () => void;
  onRequestStatusChange: (booking: Booking, status: BookingStatus) => void;
}

/** Client, date, price, services and notes of a booking, with complete/cancel for open ones. */
export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  onClose,
  onRequestStatusChange,
}) => {
  const timeZone = useStudioTimeZone();
  const finish = (status: BookingStatus) => {
    if (!booking) return;
    onClose();
    onRequestStatusChange(booking, status);
  };
  return (
    <Modal isOpen={booking !== null} onClose={onClose} title="Detale zlecenia">
      {booking && (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={booking.client.name} size="lg" decorative />
              <div className="min-w-0">
                <p className="text-xs text-faint">Klient</p>
                <p className="truncate text-sm font-medium text-foreground">{booking.client.name}</p>
                {booking.client.phone && (
                  <p className="font-mono text-sm text-muted-foreground tabular-nums">{booking.client.phone}</p>
                )}
              </div>
            </div>
            {booking.client.phone && (
              <div className="flex shrink-0 gap-2">
                <ContactLink href={`tel:${booking.client.phone}`} icon={Phone} label="Zadzwoń do klienta" />
                <ContactLink href={`sms:${booking.client.phone}`} icon={MessageSquare} label="Wyślij SMS" />
              </div>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-lg border border-border p-4">
            <div className="space-y-1">
              <dt className="text-xs text-faint">Termin</dt>
              <dd className="font-mono text-sm text-foreground tabular-nums">
                {formatInZone(booking.scheduledAt, timeZone, { dateStyle: 'short' })} ·{' '}
                {formatBookingTime(booking.scheduledAt, timeZone)}–{formatBookingTime(booking.endsAt, timeZone)}
              </dd>
              {booking.bay && <dd className="text-sm text-muted-foreground">{booking.bay.name}</dd>}
            </div>
            <div className="space-y-1 text-right">
              <dt className="text-xs text-faint">Status</dt>
              <dd>
                <BookingStatusBadge booking={booking} />
              </dd>
            </div>
            <div className="col-span-2 flex items-baseline justify-between gap-3 border-t border-border pt-4">
              <dt className="text-xs text-faint">Cena netto</dt>
              <dd className="font-mono text-2xl font-semibold text-foreground tabular-nums">
                {formatPln(booking.totalPrice)}
              </dd>
            </div>
          </dl>

          <section className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">Zakres prac</h3>
            {booking.services.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {booking.services.map((s) => (
                  <span key={s} className="rounded-md bg-muted px-2 py-1 text-sm text-foreground">
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Brak przypisanych usług</p>
            )}
          </section>

          {booking.notes && (
            <section className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Notatki</h3>
              <p className="whitespace-pre-line rounded-lg bg-subtle p-3 text-sm text-muted-foreground">
                {booking.notes}
              </p>
            </section>
          )}

          {booking.status === BOOKING_STATUSES.ZAKONCZONA.name && <ConsumptionSection bookingId={booking.id} />}

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onClose}>
              Zamknij
            </Button>
            {booking.status === BOOKING_STATUSES.UTWORZONA.name && (
              <>
                <Button variant="danger" icon={X} onClick={() => finish(BOOKING_STATUSES.ANULOWANA)}>
                  Anuluj
                </Button>
                <Button icon={Check} onClick={() => finish(BOOKING_STATUSES.ZAKONCZONA)}>
                  Zakończ
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

/** A square outline link (call, text) next to the client's name. */
function ContactLink({ href, icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Button asChild variant="secondary" icon={icon} className="size-9 px-0">
      <a href={href} aria-label={label} />
    </Button>
  );
}
