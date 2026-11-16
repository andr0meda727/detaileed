import { useState } from 'react';
import { Check, Pencil, Plus, Trash2, Warehouse, X } from 'lucide-react';
import { Button, FormInput, FormSection, Skeleton, useToast } from '@detaileed/ui';
import { useBays, useCreateBay, useDeleteBay, useRenameBay } from '@/features/planning/api/planning';
import { planningErrorMessage } from '@/features/planning/model/errors';
import type { Bay } from '@/features/planning/model/types';

const MAX_BAYS = 20;

function BayRow({ bay, canEdit }: { bay: Bay; canEdit: boolean }) {
  const { addToast } = useToast();
  const rename = useRenameBay();
  const remove = useDeleteBay();
  const [name, setName] = useState<string | null>(null);
  const fail = (err: unknown) => addToast(planningErrorMessage(err, 'Nie udało się zapisać stanowiska.'), 'error');

  if (name !== null) {
    return (
      <li className="flex items-center gap-2">
        <input
          aria-label="Nazwa stanowiska"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 px-4 py-3 bg-slate-50 rounded-xl font-semibold text-sm outline-hidden border-2 border-transparent focus:border-cream-warm/50"
        />
        <button
          type="button"
          aria-label="Zapisz nazwę"
          disabled={!name.trim()}
          onClick={() =>
            rename.mutate({ id: bay.id, name: name.trim() }, { onSuccess: () => setName(null), onError: fail })
          }
          className="p-3 rounded-xl bg-green-deep text-cream-warm disabled:opacity-50"
        >
          <Check size={16} />
        </button>
        <button type="button" aria-label="Anuluj" onClick={() => setName(null)} className="p-3 rounded-xl bg-slate-100">
          <X size={16} />
        </button>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50">
      <Warehouse size={16} className="text-green-light" />
      <span className="flex-1 font-semibold text-green-deep">{bay.name}</span>
      {canEdit && (
        <>
          <button
            type="button"
            aria-label={`Zmień nazwę: ${bay.name}`}
            onClick={() => setName(bay.name)}
            className="p-2 rounded-lg hover:bg-white"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            aria-label={`Wyłącz: ${bay.name}`}
            onClick={() =>
              remove.mutate(bay.id, { onSuccess: () => addToast('Stanowisko wyłączone.', 'success'), onError: fail })
            }
            className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={15} />
          </button>
        </>
      )}
    </li>
  );
}

/** The studio's bays (stations a car stands on); with hours set, bookings are placed on them automatically. */
export default function BaysSettings({ canEdit }: { canEdit: boolean }) {
  const { addToast } = useToast();
  const { data: bays = [], isLoading } = useBays();
  const create = useCreateBay();
  const [newName, setNewName] = useState('');
  const active = bays.filter((b) => b.isActive);

  const add = () =>
    create.mutate(newName.trim(), {
      onSuccess: () => {
        setNewName('');
        addToast('Dodano stanowisko.', 'success');
      },
      onError: (err) => addToast(planningErrorMessage(err, 'Nie udało się dodać stanowiska.'), 'error'),
    });

  return (
    <FormSection icon={Warehouse} title={`Stanowiska (${active.length}/${MAX_BAYS})`}>
      <div className="p-5 space-y-3">
        <p className="text-sm text-slate-500">
          Każde stanowisko to miejsce na jedno auto naraz. Rezerwacje trafiają na wolne stanowisko automatycznie.
        </p>
        {isLoading ? (
          <Skeleton width="100%" height="96px" className="rounded-xl" />
        ) : (
          <ul className="space-y-2">
            {active.map((bay) => (
              <BayRow key={bay.id} bay={bay} canEdit={canEdit} />
            ))}
            {active.length === 0 && <li className="text-sm text-slate-400">Brak stanowisk.</li>}
          </ul>
        )}
        {canEdit && active.length < MAX_BAYS && (
          <form
            className="flex gap-2 items-start"
            onSubmit={(e) => {
              e.preventDefault();
              if (newName.trim()) add();
            }}
          >
            <FormInput
              aria-label="Nowe stanowisko"
              placeholder="np. Stanowisko 1"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Button type="submit" icon={Plus} loading={create.isPending} disabled={!newName.trim()}>
              Dodaj
            </Button>
          </form>
        )}
      </div>
    </FormSection>
  );
}
