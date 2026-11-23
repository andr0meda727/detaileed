import { getRouteApi, Link } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { Alert, Button, Card, CardContent, CardHeader, LicensePlate, Skeleton } from '@detaileed/ui';
import { addDays, formatDay, timeInZone, todayInZone } from '@detaileed/domain/studioTime';
import { GlobalHeader } from '@/shared/ui/GlobalHeader';
import { useStudioTimeZone } from '@/features/studios';
import { useDayBoard, useSchedule } from '@/features/planning/api/planning';
import { axisHours, boardAxis } from '@/features/planning/model/boardLayout';
import { BayLane } from '@/features/planning/components/board/BayLane';

const routeApi = getRouteApi('/_signed-in/s/$studioId/board');

/** One studio day by bay: bookings, free gaps and utilisation, plus bookings without a bay and pending requests. */
export function DayBoardView() {
  const timeZone = useStudioTimeZone();
  const today = todayInZone(timeZone);
  const { date = today } = routeApi.useSearch();
  const { studioId } = routeApi.useParams();
  const navigate = routeApi.useNavigate();
  const { data: board, isLoading } = useDayBoard(date);
  const { data: schedule } = useSchedule();
  const goTo = (day: string) => navigate({ search: { date: day === today ? undefined : day } });

  const axis = board ? boardAxis(board, schedule, timeZone) : { start: 480, end: 1080 };
  const hours = axisHours(axis);

  return (
    <div className="flex flex-col gap-6">
      <GlobalHeader title="Grafik" subtitle="Stanowiska, rezerwacje i wolne okna w wybranym dniu" />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          icon={ChevronLeft}
          aria-label="Poprzedni dzień"
          onClick={() => goTo(addDays(date, -1))}
        />
        <h2 className="min-w-48 text-center text-lg font-semibold text-foreground first-letter:uppercase sm:min-w-56">
          {formatDay(date, { weekday: 'long', day: 'numeric', month: 'long' })}
        </h2>
        <Button
          variant="secondary"
          icon={ChevronRight}
          aria-label="Następny dzień"
          onClick={() => goTo(addDays(date, 1))}
        />
        {date !== today && (
          <Button variant="ghost" onClick={() => goTo(today)}>
            Dziś
          </Button>
        )}
        {board?.planningEnabled && (
          <p className="ml-auto text-sm text-muted-foreground">
            Obłożenie dnia:{' '}
            <span className="font-mono font-medium text-foreground tabular-nums">
              {Math.round(board.utilisationPercent)}%
            </span>
          </p>
        )}
      </div>

      {isLoading || !board ? (
        <Skeleton width="100%" height="240px" className="rounded-lg" />
      ) : !board.planningEnabled ? (
        <Alert
          tone="info"
          action={
            <Button asChild size="sm" variant="secondary">
              <Link to="/s/$studioId/settings/studio" params={{ studioId }}>
                Ustaw je w ustawieniach (Planowanie)
              </Link>
            </Button>
          }
        >
          Grafik działa, gdy studio ma stanowiska i godziny otwarcia.
        </Alert>
      ) : (
        <Card className="overflow-x-auto">
          <CardContent className="flex min-w-[640px] flex-col gap-2">
            <div className="flex gap-3">
              <div className="w-32 shrink-0" />
              <div className="relative h-5 flex-1">
                {hours.map((h) => (
                  <span
                    key={h}
                    className="absolute -translate-x-1/2 font-mono text-xs text-faint tabular-nums"
                    style={{ left: `${((h * 60 - axis.start) / (axis.end - axis.start)) * 100}%` }}
                  >
                    {String(h).padStart(2, '0')}:00
                  </span>
                ))}
              </div>
            </div>
            {board.bays.map((bay) => (
              <BayLane key={bay.bayId} bay={bay} day={date} timeZone={timeZone} axis={axis} hours={hours} />
            ))}
          </CardContent>
        </Card>
      )}

      {board && board.unassigned.length > 0 && (
        <Card>
          <CardHeader title="Rezerwacje bez stanowiska" />
          <ul className="divide-y divide-border">
            {board.unassigned.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 px-5 py-3 text-sm">
                <span className="font-mono font-medium tabular-nums">
                  {timeInZone(b.start, timeZone)}–{timeInZone(b.end, timeZone)}
                </span>
                <span className="text-foreground">{b.clientName}</span>
                <LicensePlate plate={b.vehicleLicensePlate} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      {board && board.pendingRequests.length > 0 && (
        <Card>
          <CardHeader title="Zapytania na ten dzień" />
          <ul className="divide-y divide-border">
            {board.pendingRequests.map((r) => (
              <li key={r.id}>
                <Link
                  to="/s/$studioId/requests"
                  params={{ studioId }}
                  search={{ id: r.id }}
                  className="flex flex-wrap items-center gap-x-2 gap-y-1 px-5 py-3 text-sm transition-colors duration-150 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                >
                  <Inbox size={16} strokeWidth={1.75} className="text-warning" aria-hidden />
                  <span className="font-mono font-medium tabular-nums">{timeInZone(r.preferredAt, timeZone)}</span>
                  <span className="text-foreground">{r.customerName}</span>
                  <LicensePlate plate={r.vehicleLicensePlate} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
