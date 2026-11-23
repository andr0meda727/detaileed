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
        <Table aria-label="Trafność szacunków" className="min-w-[520px]">
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
                <TableCell className="font-medium">{a.itemName}</TableCell>
                <TableCell className={num}>{a.samples}</TableCell>
                <TableCell className={num}>
                  ×{formatQuantity(a.factor)}{' '}
                  {!a.factorApplied && <span className="font-sans text-faint">(jeszcze nie)</span>}
                </TableCell>
                <TableCell className={num}>
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
          <Table aria-label="Prognoza zapasów" className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead>Produkt</TableHead>
                <TableHead className="text-right">Stan</TableHead>
                <TableHead className="text-right">Zużycie / dzień</TableHead>
                <TableHead className="text-right">Wystarczy na</TableHead>
                <TableHead className="text-right">Zaplanowane (14 dni)</TableHead>
                <TableHead className="text-right">Po zaplanowanych</TableHead>
                <TableHead>Zabraknie</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((f) => (
                <TableRow key={f.itemId}>
                  <TableCell className="font-medium">
                    {f.name}{' '}
                    {f.isLowStock && (
                      <Badge tone="warning" size="sm" className="ml-1">
                        Niski stan
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className={cn(num, 'whitespace-nowrap')}>
                    {formatQuantity(f.stock)} <span className="text-faint">{f.unit}</span>
                  </TableCell>
                  <TableCell className={cn(num, 'text-muted-foreground')}>
                    {formatQuantity(f.averageDailyUse)}
                  </TableCell>
                  <TableCell className={num}>{f.daysLeft === null ? '—' : `${Math.floor(f.daysLeft)} dni`}</TableCell>
                  <TableCell className={cn(num, 'text-muted-foreground')}>{formatQuantity(f.plannedUse)}</TableCell>
                  <TableCell className={cn(num, f.stockAfterPlanned < 0 && 'font-medium text-danger')}>
                    {formatQuantity(f.stockAfterPlanned)}
                  </TableCell>
                  <TableCell className="font-mono whitespace-nowrap text-muted-foreground tabular-nums">
                    {f.runsOutAt &&
                      // Running out before the planned bookings are done is the urgent case.
                      (f.stockAfterPlanned < 0 ? (
                        <Badge tone="danger" size="sm">
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
