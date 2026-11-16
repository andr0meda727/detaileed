'use client';

import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { FormInput, Skeleton } from '@detaileed/ui';
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

/**
 * When the studio plans: its free slots for the next two weeks by day. Otherwise a preferred day and time (the studio
 * confirms or proposes another).
 */
export default function TimePicker(props: TimePickerProps) {
  const { planning, slots, loading, timeZone, slotStart, onPickSlot, dateField, timeField, error } = props;
  const days = groupSlotsByDay(slots, timeZone);
  const [dayIndex, setDayIndex] = useState(0);
  const day = days[Math.min(dayIndex, Math.max(days.length - 1, 0))];

  if (loading || planning === undefined) return <Skeleton width="100%" height="96px" className="rounded-2xl" />;

  if (!planning) {
    return (
      <div className="space-y-1">
        <p className="text-sm text-green-light">
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
      <p className="text-sm text-green-light">W najbliższych dwóch tygodniach nie ma wolnych terminów na te usługi.</p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Dzień">
        {days.map((d, i) => (
          <button
            key={d.day}
            type="button"
            role="tab"
            aria-selected={d === day}
            onClick={() => setDayIndex(i)}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border-2 ${d === day ? 'bg-green-deep text-cream-warm border-green-deep' : 'bg-white border-green-deep/10'}`}
          >
            {d.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Godzina">
        {day.slots.map((s) => (
          <button
            key={s.start}
            type="button"
            role="radio"
            aria-checked={slotStart === s.start}
            onClick={() => onPickSlot(s.start)}
            className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 ${slotStart === s.start ? 'bg-amber border-amber' : 'bg-white border-green-deep/10 hover:border-green-deep/30'}`}
          >
            {s.time}
          </button>
        ))}
      </div>
      {error && <p className="text-xs font-bold text-red-500 uppercase tracking-widest">{error}</p>}
    </div>
  );
}
