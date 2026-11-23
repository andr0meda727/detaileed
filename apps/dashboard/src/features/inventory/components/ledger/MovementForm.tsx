import { useState } from 'react';
import { PackagePlus } from 'lucide-react';
import { StockChangeKind } from '@detaileed/api-client';
import { Button, FormInput, SegmentedControl, useToast } from '@detaileed/ui';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';
import { useAddMovement } from '@/features/inventory/api/ledger';
import { QUANTITY, parseQuantity } from '@/features/inventory/model/ledger';

const KINDS = [
  { value: StockChangeKind.Purchase, label: 'Dostawa', hint: 'Ile przyszło (dodane do stanu)' },
  { value: StockChangeKind.Stocktake, label: 'Inwentaryzacja', hint: 'Ile jest naprawdę (ustawia stan)' },
];

/** Records a delivery (adds to stock) or a stocktake (sets the counted stock), with an optional note. */
export function MovementForm({ itemId, unit }: { itemId: string; unit: string }) {
  const { addToast } = useToast();
  const add = useAddMovement();
  const [kind, setKind] = useState<StockChangeKind>(StockChangeKind.Purchase);
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const current = KINDS.find((k) => k.value === kind)!;

  const submit = () => {
    if (!QUANTITY.test(quantity.trim())) {
      setError('Podaj ilość, np. 2,5 (najwyżej 3 miejsca po przecinku)');
      return;
    }
    setError(null);
    add.mutate(
      { itemId, kind, quantity: parseQuantity(quantity), note: note.trim() || null },
      {
        onSuccess: () => {
          setQuantity('');
          setNote('');
          addToast(kind === StockChangeKind.Purchase ? 'Dodano dostawę.' : 'Zapisano inwentaryzację.', 'success');
        },
        onError: (err) => setError(getApiErrorMessage(err, 'Nie udało się zapisać zmiany stanu.')),
      },
    );
  };

  return (
    <form
      className="flex flex-col gap-3 rounded-lg border border-border bg-subtle p-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <SegmentedControl
        aria-label="Rodzaj zmiany stanu"
        size="sm"
        options={KINDS}
        value={kind}
        onValueChange={setKind}
        className="self-start"
      />
      <div className="grid gap-x-3 sm:grid-cols-2">
        <FormInput
          label={`${current.hint} (${unit})`}
          inputMode="decimal"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          error={error ?? undefined}
          className="font-mono tabular-nums"
        />
        <FormInput
          label="Notatka (opcjonalnie)"
          placeholder="np. Faktura 12/11"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <Button type="submit" icon={PackagePlus} loading={add.isPending} className="self-end">
        Zapisz
      </Button>
    </form>
  );
}
