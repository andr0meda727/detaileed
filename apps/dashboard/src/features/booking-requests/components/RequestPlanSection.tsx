import { Alert, RadioCardGroup, Skeleton } from '@detaileed/ui';
import { formatInZone, timeInZone } from '@detaileed/domain/studioTime';
import { useRequestPlan } from '@/features/booking-requests/api/requests';

export interface PickedSlot {
  start: string;
  bayId: string;
}

interface RequestPlanSectionProps {
  requestId: string;
  timeZone: string;
  picked: PickedSlot | null;
  onPick: (slot: PickedSlot) => void;
}

const range = (start: string, end: string, timeZone: string) =>
  `${formatInZone(start, timeZone, { weekday: 'short', day: 'numeric', month: 'short' })}, ${timeInZone(start, timeZone)}–${timeInZone(end, timeZone)}`;

/** A free slot's key in the radio group: its start and bay. */
const slotKey = (slot: PickedSlot) => `${slot.start}|${slot.bayId}`;

/** The planner's view: does the preferred time fit, the closest times that do, and requests competing for it. */
export function RequestPlanSection({ requestId, timeZone, picked, onPick }: RequestPlanSectionProps) {
  const { data: plan, isLoading } = useRequestPlan(requestId);
  if (isLoading) return <Skeleton width="100%" height="80px" className="rounded-lg" />;
  if (!plan) return null;

  if (!plan.planningEnabled) {
    return (
      <Alert>
        Studio nie ma ustawionych godzin otwarcia i stanowisk, więc termin nie jest sprawdzany automatycznie.
      </Alert>
    );
  }

  const { preferred } = plan;
  return (
    <div className="flex flex-col gap-4">
      <Alert tone={preferred.fits ? 'success' : 'warning'}>
        {preferred.fits
          ? `Preferowany termin jest wolny${preferred.bayName ? ` (${preferred.bayName})` : ''}. Wizyta potrwa ok. ${plan.durationMinutes} min.`
          : preferred.withinOpeningHours
            ? 'W preferowanym terminie nie ma wolnego stanowiska. Wybierz jeden z wolnych terminów poniżej.'
            : 'Preferowany termin wypada poza godzinami otwarcia. Wybierz jeden z wolnych terminów poniżej.'}
      </Alert>

      {plan.alternatives.length > 0 && (
        <div className="flex flex-col gap-2">
          <p id={`free-slots-${requestId}`} className="text-sm font-medium text-foreground">
            Najbliższe wolne terminy
          </p>
          <RadioCardGroup
            aria-labelledby={`free-slots-${requestId}`}
            columns={2}
            value={picked ? slotKey(picked) : ''}
            onValueChange={(key) => {
              const slot = plan.alternatives.find((a) => slotKey(a) === key);
              if (slot) onPick({ start: slot.start, bayId: slot.bayId });
            }}
            options={plan.alternatives.map((a) => ({
              value: slotKey(a),
              label: `${range(a.start, a.end, timeZone)} · ${a.bayName}`,
            }))}
          />
        </div>
      )}

      {plan.competingRequests.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Na ten czas czekają też zapytania: {plan.competingRequests.map((c) => c.customerName).join(', ')}.
        </p>
      )}
    </div>
  );
}
