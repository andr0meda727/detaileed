import { useState } from 'react';
import { PackagePlus } from 'lucide-react';
import { StockChangeKind } from '@detaileed/api-client';
import { Button, FormInput, useToast } from '@detaileed/ui';
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
      className="space-y-2 bg-slate-50 rounded-2xl p-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="flex bg-white p-1 rounded-xl w-fit">
        {KINDS.map((k) => (
          <button
            key={k.value}
            type="button"
            aria-pressed={kind === k.value}
            onClick={() => setKind(k.value)}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest ${kind === k.value ? 'bg-green-deep text-cream-warm' : 'text-slate-400'}`}
          >
            {k.label}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-[160px_1fr] gap-x-3">
        <FormInput
          label={`${current.hint} (${unit})`}
          inputMode="decimal"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          error={error ?? undefined}
        />
        <FormInput
          label="Notatka (opcjonalnie)"
          placeholder="np. Faktura 12/11"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <Button type="submit" icon={PackagePlus} loading={add.isPending}>
        Zapisz
      </Button>
    </form>
  );
}
