import { useState } from 'react';
import { Check, Pencil, Plus, Trash2, Warehouse, X } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, FormInput, Skeleton, useToast } from '@detaileed/ui';
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
      <li className="flex items-start gap-2 px-4 pt-2">
        <FormInput aria-label="Nazwa stanowiska" value={name} onChange={(e) => setName(e.target.value)} />
        <Button
          icon={Check}
          aria-label="Zapisz nazwę"
          disabled={!name.trim()}
          loading={rename.isPending}
          onClick={() =>
            rename.mutate({ id: bay.id, name: name.trim() }, { onSuccess: () => setName(null), onError: fail })
          }
        />
        <Button variant="secondary" icon={X} aria-label="Anuluj" onClick={() => setName(null)} />
      </li>
    );
  }

  return (
    <li className="flex min-h-13 items-center gap-3 px-4 py-2">
      <Warehouse size={16} strokeWidth={1.75} className="text-muted-foreground" aria-hidden />
      <span className="flex-1 text-sm font-medium text-foreground">{bay.name}</span>
      {canEdit && (
        <div className="flex gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            icon={Pencil}
            aria-label={`Zmień nazwę: ${bay.name}`}
            onClick={() => setName(bay.name)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            aria-label={`Wyłącz: ${bay.name}`}
            onClick={() =>
              remove.mutate(bay.id, { onSuccess: () => addToast('Stanowisko wyłączone.', 'success'), onError: fail })
            }
          />
        </div>
      )}
    </li>
  );
}

/** The studio's bays (stations a car stands on); with hours set, bookings are placed on them automatically. */
export function BaysSettings({ canEdit }: { canEdit: boolean }) {
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
    <Card>
      <CardHeader
        title={`Stanowiska (${active.length}/${MAX_BAYS})`}
        description="Każde stanowisko to miejsce na jedno auto naraz. Rezerwacje trafiają na wolne stanowisko automatycznie."
      />
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <Skeleton width="100%" height="96px" className="rounded-md" />
        ) : active.length === 0 ? (
          <p className="text-sm text-faint">Brak stanowisk.</p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {active.map((bay) => (
              <BayRow key={bay.id} bay={bay} canEdit={canEdit} />
            ))}
          </ul>
        )}
        {canEdit && active.length < MAX_BAYS && (
          <form
            className="flex items-start gap-2"
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
            <Button variant="secondary" type="submit" icon={Plus} loading={create.isPending} disabled={!newName.trim()}>
              Dodaj
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
