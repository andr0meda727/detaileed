import { Check, ChevronRight, MoreHorizontal, X } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@detaileed/ui';
import { formatPln } from '@detaileed/domain/money';
import type { DemoBooking } from '../../model/demoData';
import { dayOf, shortMonthOf, timeOf } from '../../model/demoFormat';

const COLUMNS = ['Godzina', 'Klient i auto', 'Usługi', 'Stanowisko', 'Status'];

const countLabel = (n: number) => `${n} ${n === 1 ? 'zlecenie' : 'zleceń'}`;

/** The complete / cancel menu of a planned booking (it changes nothing in the demo). */
export function DemoBookingMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" icon={MoreHorizontal} aria-label="Więcej akcji" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem icon={Check}>Zakończ zlecenie</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem danger icon={X}>
          Anuluj zlecenie
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Today's bookings as a table, as on the dashboard's home screen. */
export function TodaySchedule({ bookings }: { bookings: DemoBooking[] }) {
  return (
    <Card className="min-w-0">
      <CardHeader title="Dzisiejszy grafik" titleAs="h4" description={`${countLabel(bookings.length)} zaplanowanych`} />
      <Table aria-label="Dzisiejsze wizyty" className="min-w-[760px]">
        <TableHeader>
          <TableRow>
            {COLUMNS.map((column) => (
              <TableHead key={column}>{column}</TableHead>
            ))}
            <TableHead className="text-right">Kwota</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Akcje</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id} className="hover:bg-muted">
              <TableCell className="font-mono tabular-nums">{timeOf(booking.scheduledAt)}</TableCell>
              <TableCell>
                <div className="whitespace-nowrap font-medium text-foreground">{booking.client.name}</div>
                <div className="text-xs whitespace-nowrap text-faint">
                  {booking.vehicle.brand} {booking.vehicle.model} ·{' '}
                  <span className="font-mono">{booking.vehicle.licensePlate}</span>
                </div>
              </TableCell>
              <TableCell className="min-w-40 text-muted-foreground">{booking.services.join(', ')}</TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">{booking.bay}</TableCell>
              <TableCell>
                <Badge tone={booking.statusTone}>{booking.status}</Badge>
              </TableCell>
              <TableCell className="text-right font-mono whitespace-nowrap tabular-nums">
                {formatPln(booking.totalPrice)} zł
              </TableCell>
              <TableCell className="py-1.5 text-right">{booking.completedAt === null && <DemoBookingMenu />}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

/** The next bookings after today, with a link to the full list. */
export function UpcomingBookings({ bookings, onShowAll }: { bookings: DemoBooking[]; onShowAll: () => void }) {
  return (
    <Card>
      <CardHeader
        title="Nadchodzące"
        titleAs="h4"
        description={`Następne ${bookings.length} rezerwacji`}
        actions={
          <Button variant="ghost" size="sm" onClick={onShowAll}>
            Wszystkie
            <ChevronRight className="size-4" strokeWidth={1.75} aria-hidden />
          </Button>
        }
      />
      <ul className="divide-y divide-border">
        {bookings.slice(0, 4).map((booking) => (
          <li
            key={booking.id}
            className="flex items-center gap-4 px-5 py-3 transition-colors duration-150 hover:bg-muted"
          >
            <span className="flex w-9 shrink-0 flex-col items-center">
              <span className="font-mono text-base font-medium tabular-nums text-foreground">
                {dayOf(booking.scheduledAt)}
              </span>
              <span className="text-xs text-faint">{shortMonthOf(booking.scheduledAt)}</span>
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium text-foreground">
                {booking.vehicle.brand} {booking.vehicle.model}
              </span>
              <span className="truncate text-xs text-muted-foreground">{booking.services.join(', ')}</span>
            </span>
            <span className="shrink-0 font-mono text-sm tabular-nums text-foreground">
              {formatPln(booking.totalPrice)} zł
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
