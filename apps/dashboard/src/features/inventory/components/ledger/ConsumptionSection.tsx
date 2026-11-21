import { useState } from 'react';
import { FlaskConical, Save } from 'lucide-react';
import { Button, Skeleton, useToast } from '@detaileed/ui';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';
import { useConsumption, useCorrectConsumption } from '@/features/inventory/api/ledger';
import { QUANTITY, formatQuantity, parseQuantity, type Consumption } from '@/features/inventory/model/ledger';

const lineKey = (l: { serviceId: string; itemId: string }) => `${l.serviceId}:${l.itemId}`;

function Lines({ consumption }: { consumption: Consumption }) {
  const { addToast } = useToast();
  const correct = useCorrectConsumption();
  const [actual, setActual] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      consumption.lines.map((l) => [lineKey(l), l.actualQuantity === null ? '' : formatQuantity(l.actualQuantity)]),
    ),
  );
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const filled = consumption.lines.filter((l) => actual[lineKey(l)]?.trim());
    if (filled.some((l) => !QUANTITY.test(actual[lineKey(l)].trim()))) {
      setError('Podaj ilości, np. 0,3 (najwyżej 3 miejsca po przecinku).');
      return;
    }
    setError(null);
    correct.mutate(
      {
        bookingId: consumption.bookingId,
        lines: filled.map((l) => ({
          serviceId: l.serviceId,
          itemId: l.itemId,
          actualQuantity: parseQuantity(actual[lineKey(l)]),
        })),
      },
      {
        onSuccess: () => addToast('Zapisano zużycie. Stan magazynu został poprawiony.', 'success'),
        onError: (err) => setError(getApiErrorMessage(err, 'Nie udało się zapisać zużycia.')),
      },
    );
  };

  return (
    <div className="space-y-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">
            <th className="py-1">Materiał</th>
            <th className="py-1 text-right">Norma</th>
            <th className="py-1 text-right">Zdjęto ze stanu</th>
            <th className="py-1 text-right">Faktycznie</th>
          </tr>
        </thead>
        <tbody>
          {consumption.lines.map((l) => (
            <tr key={lineKey(l)} className="border-t border-slate-100">
              <td className="py-2 font-semibold text-green-deep">{l.itemName}</td>
              <td className="py-2 text-right text-slate-500">
                {formatQuantity(l.baseQuantity)} {l.unit}
              </td>
              <td className="py-2 text-right text-slate-500">
                {formatQuantity(l.estimatedQuantity)} {l.unit}
              </td>
              <td className="py-2 text-right">
                <input
                  aria-label={`Faktyczne zużycie: ${l.itemName}`}
                  inputMode="decimal"
                  placeholder="—"
                  value={actual[lineKey(l)] ?? ''}
                  onChange={(e) => setActual((a) => ({ ...a, [lineKey(l)]: e.target.value }))}
                  className="w-20 px-2 py-1.5 text-right bg-slate-50 rounded-lg font-semibold outline-hidden border-2 border-transparent focus:border-cream-warm/50"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {error && (
        <p role="alert" className="text-xs font-bold text-red-500">
          {error}
        </p>
      )}
      <Button variant="secondary" icon={Save} loading={correct.isPending} onClick={submit}>
        Zapisz zużycie
      </Button>
    </div>
  );
}

/**
 * What a completed visit used from the stock: the norm for the car's size, what was taken off, and the actual
 * amounts the staff record (stock moves by the difference and the estimates learn from them).
 */
export function ConsumptionSection({ bookingId }: { bookingId: string }) {
  const { data, isLoading } = useConsumption(bookingId);
  return (
    <section className="space-y-2">
      <p className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <FlaskConical size={13} /> Zużyte materiały
      </p>
      {isLoading ? (
        <Skeleton width="100%" height="72px" className="rounded-xl" />
      ) : !data ? (
        <p className="text-sm text-slate-400">
          Zużycie liczy się chwilę po zakończeniu wizyty, jeśli usługi mają przypisane materiały.
        </p>
      ) : data.lines.length === 0 ? (
        <p className="text-sm text-slate-400">Usługi tej wizyty nie mają przypisanych materiałów.</p>
      ) : (
        <Lines key={bookingId} consumption={data} />
      )}
    </section>
  );
}
