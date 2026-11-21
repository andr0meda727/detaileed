import { useState } from 'react';
import { X } from 'lucide-react';
import { Button, useToast } from '@detaileed/ui';
import { useRejectRequest } from '@/features/booking-requests/api/requests';
import { requestErrorMessage } from '@/features/booking-requests/model/errors';

const MAX_REASON = 500;

/** Rejects a request with an optional reason, which the customer gets by email. */
export function RejectRequestForm({ requestId, onDone }: { requestId: string; onDone: () => void }) {
  const { addToast } = useToast();
  const reject = useRejectRequest();
  const [reason, setReason] = useState('');

  const submit = () =>
    reject.mutate(
      { id: requestId, reason: reason.trim() || null },
      {
        onSuccess: () => {
          addToast('Zapytanie odrzucone, klient dostanie e-mail.', 'success');
          onDone();
        },
        onError: (err) => addToast(requestErrorMessage(err, 'Nie udało się odrzucić zapytania.'), 'error'),
      },
    );

  return (
    <div className="space-y-3">
      <label htmlFor="reject-reason" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
        Powód (klient go zobaczy)
      </label>
      <textarea
        id="reject-reason"
        rows={3}
        maxLength={MAX_REASON}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="np. Brak wolnych terminów w tym tygodniu"
        className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-hidden font-semibold text-sm focus:border-cream-warm/50"
      />
      <Button size="lg" fullWidth variant="danger" icon={X} loading={reject.isPending} onClick={submit}>
        Odrzuć zapytanie
      </Button>
    </div>
  );
}
