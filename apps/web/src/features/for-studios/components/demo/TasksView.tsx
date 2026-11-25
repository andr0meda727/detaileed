import { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, LayoutList, Search } from 'lucide-react';
import {
  Card,
  EmptyState,
  SearchInput,
  SegmentedControl,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@detaileed/ui';
import { MOCK_BOOKINGS, type DemoBooking } from '../../model/demoData';
import { dateOf, longDateOf } from '../../model/demoFormat';
import { DemoHeader } from './DemoHeader';
import { DemoBookingCard } from './DemoBookingCard';

type StatusFilter = 'all' | 'created' | 'completed';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'created', label: 'W toku' },
  { value: 'completed', label: 'Ukończone' },
];

const matches = (b: DemoBooking, q: string) =>
  !q ||
  b.client.name.toLowerCase().includes(q) ||
  b.vehicle.brand.toLowerCase().includes(q) ||
  b.vehicle.model.toLowerCase().includes(q) ||
  b.vehicle.licensePlate.toLowerCase().includes(q) ||
  b.services.join(' ').toLowerCase().includes(q);

const sorted = [...MOCK_BOOKINGS].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

/** The bookings of one list grouped by day, under a day heading. */
function BookingsByDay({ bookings }: { bookings: DemoBooking[] }) {
  const groups = new Map<string, DemoBooking[]>();
  for (const b of bookings) groups.set(dateOf(b.scheduledAt), [...(groups.get(dateOf(b.scheduledAt)) ?? []), b]);
  return (
    <div className="space-y-6">
      {[...groups.entries()].map(([date, items]) => (
        <section key={date} className="space-y-3">
          <h4 className="border-b border-border pb-2 text-sm font-medium text-muted-foreground first-letter:uppercase">
            {longDateOf(date)}
          </h4>
          <div className="space-y-2">
            {items.map((b) => (
              <DemoBookingCard key={b.id} booking={b} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/** The demo's bookings screen: the list by day with a status filter, a calendar placeholder and a search. */
export function TasksView() {
  const [status, setStatus] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');

  const byStatus = useMemo(
    () => sorted.filter((b) => status === 'all' || (status === 'created') === (b.completedAt === null)),
    [status],
  );
  const found = useMemo(() => sorted.filter((b) => matches(b, query.trim().toLowerCase())), [query]);

  return (
    <div className="space-y-6">
      <DemoHeader title="Rezerwacje" subtitle="Harmonogram" />

      <Tabs defaultValue="in-progress">
        <TabsList aria-label="Widok rezerwacji">
          <TabsTrigger value="in-progress">
            <LayoutList strokeWidth={1.75} aria-hidden /> Zlecenia
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarDays strokeWidth={1.75} aria-hidden /> Kalendarz
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search strokeWidth={1.75} aria-hidden /> Wyszukiwarka
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress" className="space-y-6">
          <div className="min-w-0 overflow-x-auto [scrollbar-width:none]">
            <SegmentedControl
              aria-label="Status zleceń"
              options={STATUS_FILTERS}
              value={status}
              onValueChange={setStatus}
              className="w-max max-w-none"
            />
          </div>
          <BookingsByDay bookings={byStatus} />
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <EmptyState icon={CalendarDays} message="Podgląd kalendarza dostępny w pełnej wersji." />
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <SearchInput
            aria-label="Szukaj rezerwacji"
            placeholder="Tablica, klient, model, usługa..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
            wrapperClassName="md:w-96"
          />
          {query.trim() ? (
            found.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Znaleziono: <span className="font-mono tabular-nums">{found.length}</span>
                </p>
                <div className="space-y-2">
                  {found.map((b) => (
                    <DemoBookingCard key={b.id} booking={b} />
                  ))}
                </div>
              </div>
            ) : (
              <Card>
                <EmptyState icon={CheckCircle2} message="Brak rezerwacji pasujących do wyszukiwania." />
              </Card>
            )
          ) : (
            <Card>
              <EmptyState icon={Search} message="Wpisz frazę, aby wyszukać rezerwację." />
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
