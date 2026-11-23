import { CalendarClock } from 'lucide-react';
import type { VehicleSize } from '@detaileed/api-client';
import { FormSection, RadioCardGroup, Select, Skeleton } from '@detaileed/ui';
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
export function FreeSlotsSection(props: FreeSlotsSectionProps) {
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
  const slots = availability.data?.slots ?? [];
  const pickSlot = (start: string) => {
    const slot = slots.find((s) => s.start === start);
    if (slot) onPickSlot({ start: slot.start, bayId: slot.suggestedBayId });
  };

  return (
    <FormSection icon={CalendarClock} title="Wolne terminy i stanowisko">
      <div className="space-y-4 p-5">
        {serviceIds.length === 0 ? (
          <p className="text-sm text-muted-foreground">Wybierz usługi, aby zobaczyć wolne terminy w tym dniu.</p>
        ) : availability.isLoading ? (
          <Skeleton width="100%" height="48px" />
        ) : slots.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak wolnych terminów w tym dniu dla tych usług.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-faint">
              Wizyta potrwa ok. <span className="font-mono tabular-nums">{availability.data?.durationMinutes}</span>{' '}
              min.
            </p>
            <RadioCardGroup
              aria-label="Wolne terminy"
              columns={3}
              options={slots.map((slot) => ({
                value: slot.start,
                label: `${timeInZone(slot.start, timeZone)} · ${slot.suggestedBayName}`,
              }))}
              value={slots.some((s) => s.start === pickedStart) ? (pickedStart ?? '') : ''}
              onValueChange={pickSlot}
            />
          </div>
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
