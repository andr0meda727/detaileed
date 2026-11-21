import { getRouteApi, Link } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { Button, Skeleton } from '@detaileed/ui';
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
    <div className="space-y-6">
      <GlobalHeader title="Grafik" subtitle="Stanowiska, rezerwacje i wolne okna w wybranym dniu" />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          aria-label="Poprzedni dzień"
          onClick={() => goTo(addDays(date, -1))}
          className="p-2 rounded-xl hover:bg-white"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-xl font-bold text-green-deep first-letter:uppercase min-w-56 text-center">
          {formatDay(date, { weekday: 'long', day: 'numeric', month: 'long' })}
        </h2>
        <button
          type="button"
          aria-label="Następny dzień"
          onClick={() => goTo(addDays(date, 1))}
          className="p-2 rounded-xl hover:bg-white"
        >
          <ChevronRight size={18} />
        </button>
        {date !== today && (
          <Button variant="ghost" onClick={() => goTo(today)}>
            Dziś
          </Button>
        )}
        {board?.planningEnabled && (
          <p className="ml-auto text-sm font-semibold text-slate-500">
            Obłożenie dnia: {Math.round(board.utilisationPercent)}%
          </p>
        )}
      </div>

      {isLoading || !board ? (
        <Skeleton width="100%" height="240px" className="rounded-2xl" />
      ) : !board.planningEnabled ? (
        <p className="bg-amber/10 rounded-2xl p-5 text-sm text-green-deep">
          Grafik działa, gdy studio ma stanowiska i godziny otwarcia.{' '}
          <Link to="/s/$studioId/settings/studio" params={{ studioId }} className="font-bold underline">
            Ustaw je w ustawieniach (Planowanie)
          </Link>
          .
        </p>
      ) : (
        <div className="floating-card-static p-5 space-y-2 overflow-x-auto">
          <div className="flex gap-3 min-w-[640px]">
            <div className="w-32 shrink-0" />
            <div className="relative flex-1 h-5">
              {hours.map((h) => (
                <span
                  key={h}
                  className="absolute -translate-x-1/2 text-[10px] font-bold text-slate-400"
                  style={{ left: `${((h * 60 - axis.start) / (axis.end - axis.start)) * 100}%` }}
                >
                  {String(h).padStart(2, '0')}:00
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-2 min-w-[640px]">
            {board.bays.map((bay) => (
              <BayLane key={bay.bayId} bay={bay} day={date} timeZone={timeZone} axis={axis} hours={hours} />
            ))}
          </div>
        </div>
      )}

      {board && board.unassigned.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Rezerwacje bez stanowiska</h3>
          <ul className="space-y-1.5">
            {board.unassigned.map((b) => (
              <li key={b.id} className="text-sm bg-white rounded-xl px-4 py-2.5">
                <strong>
                  {timeInZone(b.start, timeZone)}–{timeInZone(b.end, timeZone)}
                </strong>{' '}
                {b.clientName} · <span className="font-mono">{b.vehicleLicensePlate}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {board && board.pendingRequests.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Zapytania na ten dzień</h3>
          <ul className="space-y-1.5">
            {board.pendingRequests.map((r) => (
              <li key={r.id}>
                <Link
                  to="/s/$studioId/requests"
                  params={{ studioId }}
                  search={{ id: r.id }}
                  className="flex items-center gap-2 text-sm bg-amber/10 rounded-xl px-4 py-2.5 hover:bg-amber/20"
                >
                  <Inbox size={14} /> <strong>{timeInZone(r.preferredAt, timeZone)}</strong> {r.customerName} ·{' '}
                  <span className="font-mono">{r.vehicleLicensePlate}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
