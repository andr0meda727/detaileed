import { useState } from 'react';
import { X } from 'lucide-react';
import { Button, Textarea, useToast } from '@detaileed/ui';
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
    <div className="flex flex-col gap-2">
      <Textarea
        id="reject-reason"
        label="Powód (klient go zobaczy)"
        rows={3}
        maxLength={MAX_REASON}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="np. Brak wolnych terminów w tym tygodniu"
      />
      <div className="flex justify-end">
        <Button variant="danger" icon={X} loading={reject.isPending} onClick={submit}>
          Odrzuć zapytanie
        </Button>
      </div>
    </div>
  );
}
