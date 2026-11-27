import { TrendingDown } from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from '@detaileed/ui';
import { formatInZone } from '@detaileed/domain/studioTime';
import { useStudioTimeZone } from '@/features/studios';
import { useAccuracy, useForecast } from '@/features/inventory/api/ledger';
import { formatQuantity } from '@/features/inventory/model/ledger';

const num = 'text-right font-mono tabular-nums';
/** Long heads wrap on tablets, so the forecast fits without scrolling from `md` up. */
const wrapHead = 'text-right whitespace-normal';

function AccuracyCard() {
  const accuracy = useAccuracy();
  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Trafność szacunków zużycia"
        description="Jak faktyczne zużycie różni się od normy; współczynnik poprawia szacunki"
      />
      {accuracy.isLoading ? (
        <CardContent>
          <Skeleton width="100%" height="96px" />
        </CardContent>
      ) : !accuracy.data?.length ? (
        <CardContent className="text-sm text-muted-foreground">
          Brak danych: zapisuj faktyczne zużycie w zakończonych rezerwacjach, a szacunki zaczną się uczyć.
        </CardContent>
      ) : (
        <Table aria-label="Trafność szacunków" className="min-w-[520px]" stacked>
          <TableHeader>
            <TableRow>
              <TableHead>Materiał</TableHead>
              <TableHead className="text-right">Wizyt</TableHead>
              <TableHead className="text-right">Współczynnik</TableHead>
              <TableHead className="text-right">Średni błąd</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accuracy.data.map((a) => (
              <TableRow key={`${a.serviceId}:${a.itemId}`}>
                <TableCell stack="primary" className="font-medium">
                  {a.itemName}
                </TableCell>
                <TableCell label="Wizyt" className={num}>
                  {a.samples}
                </TableCell>
                <TableCell label="Współczynnik" className={num}>
                  ×{formatQuantity(a.factor)}{' '}
                  {!a.factorApplied && <span className="font-sans text-faint">(jeszcze nie)</span>}
                </TableCell>
                <TableCell label="Średni błąd" className={num}>
                  {a.meanAbsolutePercentageError === null ? '—' : `${Math.round(a.meanAbsolutePercentageError)}%`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

/** When each item runs out (daily use, planned use by the next two weeks' bookings), and how good the estimates are. */
export function ForecastView() {
  const timeZone = useStudioTimeZone();
  const forecast = useForecast();
  // Soonest to run out first; items that never do (no use) last.
  const items = [...(forecast.data ?? [])].sort(
    (a, b) => (a.daysLeft ?? Number.POSITIVE_INFINITY) - (b.daysLeft ?? Number.POSITIVE_INFINITY),
  );

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden">
        <CardHeader
          title="Prognoza zapasów"
          description="Na ile wystarczy stan przy obecnym zużyciu i rezerwacjach z najbliższych 14 dni"
        />
        {forecast.isLoading ? (
          <CardContent>
            <Skeleton width="100%" height="160px" />
          </CardContent>
        ) : items.length === 0 ? (
          <EmptyState message="Brak produktów do prognozy." icon={TrendingDown} />
        ) : (
          <Table
            aria-label="Prognoza zapasów"
            // Tighter cells on tablets, so all seven columns fit.
            className="min-w-[640px] md:max-xl:[&_td]:px-3 md:max-xl:[&_th]:px-3"
            stacked
          >
            <TableHeader>
              <TableRow>
                <TableHead>Produkt</TableHead>
                <TableHead className="text-right">Stan</TableHead>
                <TableHead className={wrapHead}>Zużycie / dzień</TableHead>
                <TableHead className={wrapHead}>Wystarczy na</TableHead>
                <TableHead className={wrapHead}>Zaplanowane (14 dni)</TableHead>
                <TableHead className={wrapHead}>Po zaplanowanych</TableHead>
                <TableHead>Zabraknie</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((f) => (
                <TableRow key={f.itemId}>
                  <TableCell stack="primary" className="font-medium">
                    {f.name}{' '}
                    {f.isLowStock && (
                      <Badge tone="warning" size="sm" className="ml-1">
                        Niski stan
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell label="Stan" className={cn(num, 'whitespace-nowrap')}>
                    {formatQuantity(f.stock)} <span className="text-faint">{f.unit}</span>
                  </TableCell>
                  <TableCell label="Zużycie / dzień" className={cn(num, 'text-muted-foreground')}>
                    {formatQuantity(f.averageDailyUse)}
                  </TableCell>
                  <TableCell label="Wystarczy na" className={num}>
                    {f.daysLeft === null ? '—' : `${Math.floor(f.daysLeft)} dni`}
                  </TableCell>
                  <TableCell label="Zaplanowane (14 dni)" className={cn(num, 'text-muted-foreground')}>
                    {formatQuantity(f.plannedUse)}
                  </TableCell>
                  <TableCell
                    label="Po zaplanowanych"
                    className={cn(num, f.stockAfterPlanned < 0 && 'font-medium text-danger')}
                  >
                    {formatQuantity(f.stockAfterPlanned)}
                  </TableCell>
                  <TableCell
                    label="Zabraknie"
                    stack={f.runsOutAt ? undefined : 'hidden'}
                    className="font-mono whitespace-nowrap text-muted-foreground tabular-nums md:max-xl:whitespace-normal"
                  >
                    {f.runsOutAt &&
                      // Running out before the planned bookings are done is the urgent case.
                      (f.stockAfterPlanned < 0 ? (
                        <Badge tone="danger" size="sm" className="md:max-xl:whitespace-normal">
                          {formatInZone(f.runsOutAt, timeZone, { dateStyle: 'short', timeStyle: 'short' })}
                        </Badge>
                      ) : (
                        formatInZone(f.runsOutAt, timeZone, { dateStyle: 'short', timeStyle: 'short' })
                      ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <AccuracyCard />
    </div>
  );
}
