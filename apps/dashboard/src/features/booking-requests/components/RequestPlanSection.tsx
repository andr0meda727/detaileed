import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@detaileed/ui';
import { formatInZone, timeInZone } from '@/shared/lib/studioTime';
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

/** The planner's view: does the preferred time fit, the closest times that do, and requests competing for it. */
export default function RequestPlanSection({ requestId, timeZone, picked, onPick }: RequestPlanSectionProps) {
  const { data: plan, isLoading } = useRequestPlan(requestId);
  if (isLoading) return <Skeleton width="100%" height="80px" className="rounded-xl" />;
  if (!plan) return null;

  if (!plan.planningEnabled) {
    return (
      <p className="text-sm text-slate-500 bg-slate-50 rounded-xl p-4">
        Studio nie ma ustawionych godzin otwarcia i stanowisk, więc termin nie jest sprawdzany automatycznie.
      </p>
    );
  }

  const { preferred } = plan;
  return (
    <div className="space-y-4">
      <div
        className={`flex gap-2 text-sm rounded-xl p-4 ${preferred.fits ? 'bg-green-pale/30 text-green-deep' : 'bg-amber/10 text-amber-800'}`}
      >
        {preferred.fits ? (
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
        )}
        <span>
          {preferred.fits
            ? `Preferowany termin jest wolny${preferred.bayName ? ` (${preferred.bayName})` : ''}. Wizyta potrwa ok. ${plan.durationMinutes} min.`
            : preferred.withinOpeningHours
              ? 'W preferowanym terminie nie ma wolnego stanowiska. Wybierz jeden z wolnych terminów poniżej.'
              : 'Preferowany termin wypada poza godzinami otwarcia. Wybierz jeden z wolnych terminów poniżej.'}
        </span>
      </div>

      {plan.alternatives.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Najbliższe wolne terminy
          </p>
          <div className="flex flex-wrap gap-2">
            {plan.alternatives.map((a) => {
              const selected = picked?.start === a.start && picked.bayId === a.bayId;
              return (
                <button
                  key={`${a.start}-${a.bayId}`}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onPick({ start: a.start, bayId: a.bayId })}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${selected ? 'bg-green-deep text-cream-warm border-green-deep' : 'bg-white text-green-deep border-slate-100 hover:border-green-deep/30'}`}
                >
                  {range(a.start, a.end, timeZone)} · {a.bayName}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {plan.competingRequests.length > 0 && (
        <p className="text-xs text-slate-500">
          Na ten czas czekają też zapytania: {plan.competingRequests.map((c) => c.customerName).join(', ')}.
        </p>
      )}
    </div>
  );
}
