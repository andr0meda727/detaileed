'use client';

import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { FieldError, FormInput, Skeleton, Tabs, TabsContent, TabsList, TabsTrigger, cn } from '@detaileed/ui';
import { groupSlotsByDay } from '@/features/booking/model/slots';

interface TimePickerProps {
  planning: boolean | undefined;
  slots: { start: string }[];
  loading: boolean;
  timeZone: string;
  slotStart: string | null;
  onPickSlot: (start: string) => void;
  dateField: UseFormRegisterReturn;
  timeField: UseFormRegisterReturn;
  error?: string;
}

const ERROR_ID = 'time-picker-error';

/**
 * When the studio plans: its free slots for the next two weeks by day. Otherwise a preferred day and time (the studio
 * confirms or proposes another).
 */
export function TimePicker(props: TimePickerProps) {
  const { planning, slots, loading, timeZone, slotStart, onPickSlot, dateField, timeField, error } = props;
  const days = groupSlotsByDay(slots, timeZone);
  const [dayIndex, setDayIndex] = useState(0);
  const day = days[Math.min(dayIndex, Math.max(days.length - 1, 0))];

  if (loading || planning === undefined) return <Skeleton width="100%" height="96px" className="rounded-lg" />;

  if (!planning) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Podaj, kiedy chcesz przyjechać. Studio potwierdzi termin albo zaproponuje inny.
        </p>
        <div className="grid grid-cols-2 gap-x-3">
          <FormInput label="Dzień" type="date" {...dateField} />
          <FormInput label="Godzina" type="time" error={error} {...timeField} />
        </div>
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        W najbliższych dwóch tygodniach nie ma wolnych terminów na te usługi.
      </p>
    );
  }

  return (
    <Tabs value={day.day} onValueChange={(v) => setDayIndex(days.findIndex((d) => d.day === v))} className="gap-4">
      <TabsList aria-label="Dzień">
        {days.map((d) => (
          <TabsTrigger key={d.day} value={d.day}>
            {d.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={day.day} className="flex flex-col gap-2">
        <div
          className="grid grid-cols-3 gap-2 sm:grid-cols-6"
          role="radiogroup"
          aria-label="Godzina"
          aria-describedby={error ? ERROR_ID : undefined}
        >
          {day.slots.map((s) => {
            const checked = slotStart === s.start;
            return (
              <button
                key={s.start}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => onPickSlot(s.start)}
                className={cn(
                  'h-9 rounded-md border font-mono text-sm tabular-nums transition-colors duration-150',
                  'outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'focus-visible:ring-offset-background',
                  checked
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border-strong bg-surface text-foreground hover:bg-muted',
                )}
              >
                {s.time}
              </button>
            );
          })}
        </div>
        <FieldError id={ERROR_ID}>{error}</FieldError>
      </TabsContent>
    </Tabs>
  );
}
