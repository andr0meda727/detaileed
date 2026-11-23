import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Card, cn } from '@detaileed/ui';
import { formatDay } from '@detaileed/domain/studioTime';
import { monthGrid } from '@/features/bookings/model/filters';

interface MonthCalendarProps {
  /** The shown month as YYYY-MM. */
  month: string;
  onShiftMonth: (delta: number) => void;
  /** YYYY-MM-DD of the picked day. */
  selectedDate: string;
  onSelectDate: (date: string) => void;
  /** YYYY-MM-DD of the studio's today. */
  today: string;
  /** Whether a day has open bookings (it gets a dot). */
  hasBookings: (date: string) => boolean;
}

const WEEKDAYS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

/** A month grid of day buttons, with a dot on days that have open bookings. */
export function MonthCalendar({
  month,
  onShiftMonth,
  selectedDate,
  onSelectDate,
  today,
  hasBookings,
}: MonthCalendarProps) {
  const calendarDays = useMemo(() => monthGrid(month), [month]);

  return (
    <Card className="w-full shrink-0 self-start xl:w-[360px]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground first-letter:uppercase">
          {formatDay(`${month}-01`, { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={ChevronLeft}
            aria-label="Poprzedni miesiąc"
            onClick={() => onShiftMonth(-1)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={ChevronRight}
            aria-label="Następny miesiąc"
            onClick={() => onShiftMonth(1)}
          />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 p-3">
        {WEEKDAYS.map((d) => (
          <div key={d} aria-hidden className="py-1.5 text-center text-xs font-medium text-faint">
            {d}
          </div>
        ))}
        {calendarDays.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const date = `${month}-${String(day).padStart(2, '0')}`;
          const selected = date === selectedDate;
          const dot = hasBookings(date);
          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDate(date)}
              aria-pressed={selected}
              aria-label={`${formatDay(date, { day: 'numeric', month: 'long' })}${dot ? ', są rezerwacje' : ''}`}
              className={cn(
                'relative flex aspect-square items-center justify-center rounded-md font-mono text-sm tabular-nums',
                'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                selected ? 'bg-primary font-medium text-primary-foreground' : 'text-foreground hover:bg-muted',
                !selected && date === today && 'font-semibold inset-ring inset-ring-border-strong',
              )}
            >
              {day}
              {dot && (
                <span
                  aria-hidden
                  className={cn(
                    'absolute bottom-1 size-1 rounded-full',
                    selected ? 'bg-primary-foreground' : 'bg-info',
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
