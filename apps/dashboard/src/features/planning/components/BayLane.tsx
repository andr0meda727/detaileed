import { timeInZone } from '@detaileed/domain/studioTime';
import { blockPosition } from '@/features/planning/model/boardLayout';
import type { DayBoard } from '@/features/planning/model/types';

interface BayLaneProps {
  bay: DayBoard['bays'][number];
  day: string;
  timeZone: string;
  axis: { start: number; end: number };
  hours: number[];
}

/** One bay's row: its bookings as blocks and its free gaps, on the day's time axis. */
export default function BayLane({ bay, day, timeZone, axis, hours }: BayLaneProps) {
  return (
    <div className="flex items-stretch gap-3">
      <div className="w-32 shrink-0 py-2">
        <p className="font-semibold text-sm text-green-deep truncate">{bay.name}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {Math.round(bay.utilisationPercent)}% zajęte
        </p>
      </div>
      <div
        className="relative flex-1 h-14 rounded-xl bg-slate-50 overflow-hidden"
        role="list"
        aria-label={`Stanowisko ${bay.name}`}
      >
        {hours.map((h) => (
          <span
            key={h}
            aria-hidden
            className="absolute top-0 bottom-0 border-l border-slate-200/70"
            style={{ left: `${((h * 60 - axis.start) / (axis.end - axis.start)) * 100}%` }}
          />
        ))}
        {bay.freeGaps.map((g) => {
          const pos = blockPosition(g.start, g.end, day, timeZone, axis);
          return (
            <span
              key={g.start}
              title={`Wolne ${timeInZone(g.start, timeZone)}–${timeInZone(g.end, timeZone)} (${g.minutes} min)`}
              className="absolute top-1 bottom-1 rounded-lg border-2 border-dashed border-green-light/30"
              style={{ left: `${pos.left}%`, width: `${pos.width}%` }}
            />
          );
        })}
        {bay.bookings.map((b) => {
          const pos = blockPosition(b.start, b.end, day, timeZone, axis);
          return (
            <div
              key={b.id}
              role="listitem"
              title={`${b.clientName}, ${b.vehicleLicensePlate}`}
              className="absolute top-1 bottom-1 rounded-lg bg-green-deep text-cream-warm px-2 py-1 overflow-hidden"
              style={{ left: `${pos.left}%`, width: `${pos.width}%` }}
            >
              <p className="text-[11px] font-bold truncate">
                {timeInZone(b.start, timeZone)}–{timeInZone(b.end, timeZone)} {b.clientName}
              </p>
              <p className="text-[10px] font-mono truncate opacity-70">{b.vehicleLicensePlate}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
