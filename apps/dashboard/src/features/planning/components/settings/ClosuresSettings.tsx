import { useState } from 'react';
import { CalendarOff, Plus, Trash2 } from 'lucide-react';
import { Button, FormInput, FormSection, useToast } from '@detaileed/ui';
import { formatDay, todayInZone } from '@detaileed/domain/studioTime';
import { useStudioTimeZone } from '@/features/studios';
import { useAddClosure, useRemoveClosure } from '@/features/planning/api/planning';
import { planningErrorMessage } from '@/features/planning/model/errors';
import type { Schedule } from '@/features/planning/model/types';

/** Days the studio is closed (holidays, stocktaking): no bookings or free times on them. */
export function ClosuresSettings({ closures, canEdit }: { closures: Schedule['closures']; canEdit: boolean }) {
  const { addToast } = useToast();
  const timeZone = useStudioTimeZone();
  const add = useAddClosure();
  const remove = useRemoveClosure();
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const today = todayInZone(timeZone);
  const upcoming = closures.filter((c) => c.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const fail = (err: unknown) => addToast(planningErrorMessage(err, 'Nie udało się zapisać dnia zamknięcia.'), 'error');

  const submit = () =>
    add.mutate(
      { date, reason: reason.trim() || null },
      {
        onSuccess: () => {
          setDate('');
          setReason('');
          addToast('Dodano dzień zamknięcia.', 'success');
        },
        onError: fail,
      },
    );

  return (
    <FormSection icon={CalendarOff} title="Dni zamknięcia">
      <div className="p-5 space-y-3">
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-400">Brak zaplanowanych dni zamknięcia.</p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((c) => (
              <li key={c.date} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50">
                <span className="font-semibold text-green-deep first-letter:uppercase">
                  {formatDay(c.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="flex-1 text-sm text-slate-500">{c.reason}</span>
                {canEdit && (
                  <button
                    type="button"
                    aria-label={`Usuń zamknięcie ${c.date}`}
                    onClick={() => remove.mutate(c.date, { onError: fail })}
                    className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {canEdit && (
          <form
            className="grid sm:grid-cols-[180px_1fr_auto] gap-x-3 items-start"
            onSubmit={(e) => {
              e.preventDefault();
              if (date) submit();
            }}
          >
            <FormInput
              type="date"
              aria-label="Dzień zamknięcia"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <FormInput
              aria-label="Powód"
              placeholder="np. Wigilia"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button type="submit" icon={Plus} loading={add.isPending} disabled={!date}>
              Dodaj
            </Button>
          </form>
        )}
      </div>
    </FormSection>
  );
}
