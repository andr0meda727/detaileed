import { useState } from 'react';
import { FlaskConical, Save } from 'lucide-react';
import {
  Button,
  FormInput,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from '@detaileed/ui';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';
import { useConsumption, useCorrectConsumption } from '@/features/inventory/api/ledger';
import { QUANTITY, formatQuantity, parseQuantity, type Consumption } from '@/features/inventory/model/ledger';

const lineKey = (l: { serviceId: string; itemId: string }) => `${l.serviceId}:${l.itemId}`;
const num = 'text-right font-mono tabular-nums whitespace-nowrap text-muted-foreground';

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
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-lg border border-border">
        <Table aria-label="Zużyte materiały" className="min-w-[440px]" stacked>
          <TableHeader>
            <TableRow>
              <TableHead>Materiał</TableHead>
              <TableHead className="text-right">Norma</TableHead>
              <TableHead className="text-right">Zdjęto ze stanu</TableHead>
              <TableHead className="text-right">Faktycznie</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consumption.lines.map((l) => (
              <TableRow key={lineKey(l)}>
                <TableCell stack="primary" className="font-medium">
                  {l.itemName}
                </TableCell>
                <TableCell label="Norma" className={num}>
                  {formatQuantity(l.baseQuantity)} {l.unit}
                </TableCell>
                <TableCell label="Zdjęto ze stanu" className={num}>
                  {formatQuantity(l.estimatedQuantity)} {l.unit}
                </TableCell>
                <TableCell label="Faktycznie" className="w-28 pb-0">
                  <FormInput
                    aria-label={`Faktyczne zużycie: ${l.itemName}`}
                    inputMode="decimal"
                    placeholder="—"
                    value={actual[lineKey(l)] ?? ''}
                    onChange={(e) => setActual((a) => ({ ...a, [lineKey(l)]: e.target.value }))}
                    className="h-8 text-right font-mono tabular-nums"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      <Button variant="secondary" icon={Save} loading={correct.isPending} onClick={submit} className="self-start">
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
    <section className="flex flex-col gap-3">
      <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
        <FlaskConical size={16} strokeWidth={1.75} className="text-muted-foreground" aria-hidden />
        Zużyte materiały
      </h3>
      {isLoading ? (
        <Skeleton width="100%" height="72px" className="rounded-lg" />
      ) : !data ? (
        <p className="text-sm text-muted-foreground">
          Zużycie liczy się chwilę po zakończeniu wizyty, jeśli usługi mają przypisane materiały.
        </p>
      ) : data.lines.length === 0 ? (
        <p className="text-sm text-muted-foreground">Usługi tej wizyty nie mają przypisanych materiałów.</p>
      ) : (
        <Lines key={bookingId} consumption={data} />
      )}
    </section>
  );
}
