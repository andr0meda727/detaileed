import { CalendarClock } from 'lucide-react';
import type { VehicleSize } from '@detaileed/api-client';
import { FormSection, Select, Skeleton } from '@detaileed/ui';
import { timeInZone } from '@detaileed/domain/studioTime';
import { useBays, useSchedule, useStaffAvailability } from '@/features/planning';

interface FreeSlotsSectionProps {
  /** The studio day picked in the form. */
  date: string;
  serviceIds: string[];
  size: VehicleSize;
  timeZone: string;
  /** The picked start (UTC), to highlight it. */
  pickedStart: string | null;
  bayId: string | null;
  onPickSlot: (slot: { start: string; bayId: string }) => void;
  onBayChange: (bayId: string | null) => void;
}

/**
 * Free start times on the picked day for these services and the car's size, and the bay to use (or let the
 * planner choose). Shown only when the studio plans (hours and bays set).
 */
export default function FreeSlotsSection(props: FreeSlotsSectionProps) {
  const { date, serviceIds, size, timeZone, pickedStart, bayId, onPickSlot, onBayChange } = props;
  const { data: schedule } = useSchedule();
  const { data: bays = [] } = useBays();
  const planning = !!schedule?.planningEnabled;
  const availability = useStaffAvailability({ from: date, to: date, serviceIds, size }, planning);

  if (!planning) return null;

  const bayOptions = [
    { value: '', label: 'Automatycznie (najlepiej pasujące)' },
    ...bays.filter((b) => b.isActive).map((b) => ({ value: b.id, label: b.name })),
  ];

  return (
    <FormSection icon={CalendarClock} title="Wolne terminy i stanowisko" tone="amber">
      <div className="p-4 space-y-3">
        {serviceIds.length === 0 ? (
          <p className="text-sm text-slate-400">Wybierz usługi, aby zobaczyć wolne terminy w tym dniu.</p>
        ) : availability.isLoading ? (
          <Skeleton width="100%" height="48px" className="rounded-xl" />
        ) : !availability.data?.slots.length ? (
          <p className="text-sm text-slate-400">Brak wolnych terminów w tym dniu dla tych usług.</p>
        ) : (
          <>
            <p className="text-xs text-slate-500">Wizyta potrwa ok. {availability.data.durationMinutes} min.</p>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Wolne terminy">
              {availability.data.slots.map((slot) => {
                const selected = slot.start === pickedStart;
                return (
                  <button
                    key={slot.start}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => onPickSlot({ start: slot.start, bayId: slot.suggestedBayId })}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 ${selected ? 'bg-green-deep text-cream-warm border-green-deep' : 'bg-white border-slate-100 hover:border-green-deep/30'}`}
                  >
                    {timeInZone(slot.start, timeZone)} · {slot.suggestedBayName}
                  </button>
                );
              })}
            </div>
          </>
        )}
        <Select
          label="Stanowisko"
          options={bayOptions}
          value={bayId ?? ''}
          onChange={(e) => onBayChange(e.target.value || null)}
        />
      </div>
    </FormSection>
  );
}
