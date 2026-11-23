import type { ReactNode } from 'react';
import { Avatar, Button, LicensePlate, Modal } from '@detaileed/ui';
import { formatPln } from '@detaileed/domain/money';
import type { Booking } from '@/features/bookings/model/types';

interface ArchivedBookingModalProps {
  /** The booking to show; null closes the modal. */
  booking: Booking | null;
  onClose: () => void;
}

/** Client, vehicle, services, price and notes of a finished booking (read-only). */
export function ArchivedBookingModal({ booking, onClose }: ArchivedBookingModalProps) {
  return (
    <Modal isOpen={!!booking} onClose={onClose} title="Szczegóły archiwalne">
      {booking && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-lg border border-border p-4">
            <Avatar name={booking.client.name} size="lg" decorative />
            <div className="min-w-0">
              <p className="text-xs text-faint">Klient</p>
              <p className="truncate text-sm font-medium text-foreground">{booking.client.name}</p>
            </div>
          </div>
          <dl className="divide-y divide-border rounded-lg border border-border">
            <Row label="Pojazd">
              <span className="flex flex-wrap items-center justify-end gap-2">
                <span>
                  {booking.vehicle.brand} {booking.vehicle.model}
                </span>
                <LicensePlate plate={booking.vehicle.licensePlate} />
              </span>
            </Row>
            <Row label="Usługi">{booking.services.join(', ') || '—'}</Row>
            <Row label="Cena netto">
              <span className="font-mono text-lg font-semibold tabular-nums">{formatPln(booking.totalPrice)} PLN</span>
            </Row>
            {booking.notes && (
              <div className="space-y-1 px-4 py-3">
                <dt className="text-xs text-faint">Notatki</dt>
                <dd className="whitespace-pre-line text-sm text-muted-foreground">{booking.notes}</dd>
              </div>
            )}
          </dl>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Zamknij
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <dt className="shrink-0 text-xs text-faint">{label}</dt>
      <dd className="min-w-0 text-right text-sm text-foreground">{children}</dd>
    </div>
  );
}
