import { useState } from 'react';
import { Modal, SegmentedControl } from '@detaileed/ui';
import type { BookingRequest } from '@/features/booking-requests/model/types';
import { RequestSummary } from '@/features/booking-requests/components/RequestSummary';
import { AcceptRequestForm } from '@/features/booking-requests/components/AcceptRequestForm';
import { RejectRequestForm } from '@/features/booking-requests/components/RejectRequestForm';

interface RequestDetailsModalProps {
  /** The request to show; null while the list is loading or when it isn't on the loaded page. */
  request: BookingRequest | null;
  /** True when a request id is in the URL but the request isn't in the loaded list. */
  missing: boolean;
  timeZone: string;
  onClose: () => void;
}

type Mode = 'accept' | 'reject';

const MODES: { value: Mode; label: string }[] = [
  { value: 'accept', label: 'Przyjmij' },
  { value: 'reject', label: 'Odrzuć' },
];

/** A request's details; pending ones can be accepted (with the plan) or rejected here. */
export function RequestDetailsModal({ request, missing, timeZone, onClose }: RequestDetailsModalProps) {
  const [mode, setMode] = useState<Mode>('accept');
  const isOpen = request !== null || missing;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Zapytanie o rezerwację">
      {!request ? (
        <p className="text-sm text-muted-foreground">
          Nie znaleziono tego zapytania na liście. Mogło zostać już rozpatrzone; sprawdź filtr „Wszystkie”.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          <RequestSummary request={request} timeZone={timeZone} />
          {request.status === 'Pending' && (
            <div className="flex flex-col gap-4 border-t border-border pt-5">
              <SegmentedControl
                aria-label="Decyzja"
                options={MODES}
                value={mode}
                onValueChange={setMode}
                className="self-start"
              />
              {mode === 'accept' ? (
                <AcceptRequestForm request={request} timeZone={timeZone} onDone={onClose} />
              ) : (
                <RejectRequestForm requestId={request.id} onDone={onClose} />
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
