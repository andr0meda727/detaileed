import { cn, type BadgeTone } from '@detaileed/ui';
import { timeInZone } from '@detaileed/domain/studioTime';
import { blockPosition } from '@/features/planning/model/boardLayout';
import { bookingStatusTone } from '@/features/bookings';
import type { DayBoard } from '@/features/planning/model/types';

/**
 * A booking block's colours by its status tone: the soft fill (on a `::before` layer over an opaque surface, so the
 * hour lines don't show through) with a solid edge in the tone.
 */
const BLOCK_TONES: Record<BadgeTone, string> = {
  info: 'before:bg-info-soft border-info',
  success: 'before:bg-success-soft border-success',
  warning: 'before:bg-warning-soft border-warning',
  danger: 'before:bg-danger-soft border-danger',
  neutral: 'before:bg-muted border-border-strong',
};

interface BayLaneProps {
  bay: DayBoard['bays'][number];
  day: string;
  timeZone: string;
  axis: { start: number; end: number };
  hours: number[];
}

/** One bay's row: its bookings as blocks and its free gaps, on the day's time axis. */
export function BayLane({ bay, day, timeZone, axis, hours }: BayLaneProps) {
  return (
    <div className="flex items-stretch gap-3">
      <div className="flex w-32 shrink-0 flex-col justify-center gap-0.5">
        <p className="truncate text-sm font-medium text-foreground">{bay.name}</p>
        <p className="text-xs text-faint">
          <span className="font-mono tabular-nums">{Math.round(bay.utilisationPercent)}%</span> zajęte
        </p>
      </div>
      <div
        className="relative h-14 flex-1 overflow-hidden rounded-md border border-border bg-subtle"
        role="list"
        aria-label={`Stanowisko ${bay.name}`}
      >
        {hours.map((h) => (
          <span
            key={h}
            aria-hidden
            className="absolute top-0 bottom-0 border-l border-border"
            style={{ left: `${((h * 60 - axis.start) / (axis.end - axis.start)) * 100}%` }}
          />
        ))}
        {bay.freeGaps.map((g) => {
          const pos = blockPosition(g.start, g.end, day, timeZone, axis);
          return (
            <span
              key={g.start}
              title={`Wolne ${timeInZone(g.start, timeZone)}–${timeInZone(g.end, timeZone)} (${g.minutes} min)`}
              className="absolute top-1 bottom-1 rounded-md border border-dashed border-border-strong"
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
              className={cn(
                'absolute top-1 bottom-1 overflow-hidden rounded-md border-l-2 bg-surface px-2 py-1 text-foreground',
                'before:pointer-events-none before:absolute before:inset-0 before:content-[""] [&>*]:relative',
                BLOCK_TONES[bookingStatusTone(b.status) ?? 'neutral'],
              )}
              style={{ left: `${pos.left}%`, width: `${pos.width}%` }}
            >
              <p className="truncate text-xs font-medium">
                <span className="font-mono tabular-nums">
                  {timeInZone(b.start, timeZone)}–{timeInZone(b.end, timeZone)}
                </span>{' '}
                {b.clientName}
              </p>
              <p className="truncate font-mono text-xs text-muted-foreground">{b.vehicleLicensePlate}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
