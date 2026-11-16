import { useState } from 'react';
import { FlaskConical, Plus, Save, X } from 'lucide-react';
import { Button, Select, Skeleton, useToast } from '@detaileed/ui';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';
import { useInventory } from '@/features/inventory/api/inventory';
import { useRecipe, useSaveRecipe } from '@/features/inventory/api/ledger';
import { QUANTITY, formatQuantity, parseQuantity, type Recipe } from '@/features/inventory/model/ledger';
import type { InventoryItem } from '@/features/inventory/model/types';

interface Line {
  itemId: string;
  quantity: string;
}

function Lines({ serviceId, recipe, items }: { serviceId: string; recipe: Recipe; items: InventoryItem[] }) {
  const { addToast } = useToast();
  const save = useSaveRecipe();
  const [lines, setLines] = useState<Line[]>(
    recipe.lines.map((l) => ({ itemId: l.itemId, quantity: formatQuantity(l.quantityForMedium) })),
  );
  const [error, setError] = useState<string | null>(null);
  const options = [
    { value: '', label: 'Wybierz materiał' },
    ...items.map((i) => ({ value: i.id, label: `${i.name} (${i.unit})` })),
  ];
  const update = (i: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l, k) => (k === i ? { ...l, ...patch } : l)));

  const submit = () => {
    const filled = lines.filter((l) => l.itemId);
    if (filled.some((l) => !QUANTITY.test(l.quantity.trim()) || parseQuantity(l.quantity) <= 0)) {
      setError('Podaj ilość większą od zera, np. 0,2');
      return;
    }
    if (new Set(filled.map((l) => l.itemId)).size !== filled.length) {
      setError('Każdy materiał może wystąpić tylko raz.');
      return;
    }
    setError(null);
    save.mutate(
      {
        serviceId,
        body: { lines: filled.map((l) => ({ itemId: l.itemId, quantityForMedium: parseQuantity(l.quantity) })) },
      },
      {
        onSuccess: () => addToast('Zapisano materiały usługi.', 'success'),
        onError: (err) => setError(getApiErrorMessage(err, 'Nie udało się zapisać materiałów.')),
      },
    );
  };

  return (
    <div className="space-y-2">
      {lines.map((line, i) => (
        <div key={i} className="grid grid-cols-[1fr_110px_auto] gap-2 items-start">
          <Select
            aria-label="Materiał"
            options={options}
            value={line.itemId}
            onChange={(e) => update(i, { itemId: e.target.value })}
          />
          <input
            aria-label="Ilość na średnie auto"
            inputMode="decimal"
            value={line.quantity}
            onChange={(e) => update(i, { quantity: e.target.value })}
            className="px-3 py-3.5 bg-slate-50 rounded-xl font-semibold text-sm outline-hidden border-2 border-transparent focus:border-cream-warm/50"
          />
          <button
            type="button"
            aria-label="Usuń materiał"
            onClick={() => setLines((ls) => ls.filter((_, k) => k !== i))}
            className="p-3 rounded-xl hover:bg-red-50 hover:text-red-600"
          >
            <X size={15} />
          </button>
        </div>
      ))}
      {error && (
        <p role="alert" className="text-xs font-bold text-red-500">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button variant="ghost" icon={Plus} onClick={() => setLines((ls) => [...ls, { itemId: '', quantity: '' }])}>
          Dodaj materiał
        </Button>
        <Button variant="secondary" icon={Save} loading={save.isPending} onClick={submit}>
          Zapisz materiały
        </Button>
      </div>
    </div>
  );
}

/**
 * What one service uses from the stock on a Medium car (other sizes are scaled by the size factors). When a booking
 * with the service is completed, this much is taken off stock.
 */
export default function RecipeEditor({ serviceId }: { serviceId: string }) {
  const recipe = useRecipe(serviceId);
  const { data: items = [], isLoading } = useInventory();
  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
        <FlaskConical size={13} /> Materiały na średnie auto
      </p>
      {recipe.isLoading || isLoading || !recipe.data ? (
        <Skeleton width="100%" height="56px" className="rounded-xl" />
      ) : (
        <Lines key={serviceId} serviceId={serviceId} recipe={recipe.data} items={items} />
      )}
    </div>
  );
}
