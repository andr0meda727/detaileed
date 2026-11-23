import { useState } from 'react';
import { CalendarOff, Plus, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, FormInput, useToast } from '@detaileed/ui';
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
    <Card>
      <CardHeader title="Dni zamknięcia" />
      <CardContent className="flex flex-col gap-4">
        {upcoming.length === 0 ? (
          <p className="text-sm text-faint">Brak zaplanowanych dni zamknięcia.</p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {upcoming.map((c) => (
              <li key={c.date} className="flex min-h-13 flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2">
                <CalendarOff size={16} strokeWidth={1.75} className="text-muted-foreground" aria-hidden />
                <span className="text-sm font-medium text-foreground first-letter:uppercase">
                  {formatDay(c.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="flex-1 text-sm text-muted-foreground">{c.reason}</span>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    aria-label={`Usuń zamknięcie ${c.date}`}
                    onClick={() => remove.mutate(c.date, { onError: fail })}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
        {canEdit && (
          <form
            className="grid items-start gap-x-3 sm:grid-cols-[180px_1fr_auto]"
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
              className="font-mono tabular-nums"
            />
            <FormInput
              aria-label="Powód"
              placeholder="np. Wigilia"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button variant="secondary" type="submit" icon={Plus} loading={add.isPending} disabled={!date}>
              Dodaj
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
