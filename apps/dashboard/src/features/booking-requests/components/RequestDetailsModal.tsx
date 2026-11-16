import { useState } from 'react';
import { Modal } from '@detaileed/ui';
import type { BookingRequest } from '@/features/booking-requests/model/types';
import RequestSummary from '@/features/booking-requests/components/RequestSummary';
import AcceptRequestForm from '@/features/booking-requests/components/AcceptRequestForm';
import RejectRequestForm from '@/features/booking-requests/components/RejectRequestForm';

interface RequestDetailsModalProps {
  /** The request to show; null while the list is loading or when it isn't on the loaded page. */
  request: BookingRequest | null;
  /** True when a request id is in the URL but the request isn't in the loaded list. */
  missing: boolean;
  timeZone: string;
  onClose: () => void;
}

/** A request's details; pending ones can be accepted (with the plan) or rejected here. */
export default function RequestDetailsModal({ request, missing, timeZone, onClose }: RequestDetailsModalProps) {
  const [mode, setMode] = useState<'accept' | 'reject'>('accept');
  const isOpen = request !== null || missing;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Zapytanie o rezerwację">
      {!request ? (
        <p className="text-sm text-slate-500">
          Nie znaleziono tego zapytania na liście. Mogło zostać już rozpatrzone; sprawdź filtr „Wszystkie”.
        </p>
      ) : (
        <div className="space-y-6 pb-4">
          <RequestSummary request={request} timeZone={timeZone} />
          {request.status === 'Pending' && (
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div className="flex bg-slate-50 p-1 rounded-xl w-fit">
                {(['accept', 'reject'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={mode === m}
                    onClick={() => setMode(m)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${mode === m ? 'bg-green-deep text-cream-warm' : 'text-slate-400 hover:text-green-deep'}`}
                  >
                    {m === 'accept' ? 'Przyjmij' : 'Odrzuć'}
                  </button>
                ))}
              </div>
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
