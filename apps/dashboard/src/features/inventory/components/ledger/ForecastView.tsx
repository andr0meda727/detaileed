import { Gauge, TrendingDown } from 'lucide-react';
import { Badge, EmptyState, FormSection, Skeleton } from '@detaileed/ui';
import { formatInZone } from '@detaileed/domain/studioTime';
import { useStudioTimeZone } from '@/features/studios';
import { useAccuracy, useForecast } from '@/features/inventory/api/ledger';
import { formatQuantity } from '@/features/inventory/model/ledger';

const th = 'py-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest';

/** When each item runs out (daily use, planned use by the next two weeks' bookings), and how good the estimates are. */
export default function ForecastView() {
  const timeZone = useStudioTimeZone();
  const forecast = useForecast();
  const accuracy = useAccuracy();
  // Soonest to run out first; items that never do (no use) last.
  const items = [...(forecast.data ?? [])].sort(
    (a, b) => (a.daysLeft ?? Number.POSITIVE_INFINITY) - (b.daysLeft ?? Number.POSITIVE_INFINITY),
  );

  return (
    <div className="space-y-6">
      <FormSection icon={TrendingDown} title="Prognoza zapasów">
        <div className="overflow-x-auto">
          {forecast.isLoading ? (
            <div className="p-5">
              <Skeleton width="100%" height="160px" className="rounded-xl" />
            </div>
          ) : items.length === 0 ? (
            <EmptyState message="Brak produktów do prognozy." icon={TrendingDown} />
          ) : (
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-left">
                  <th className={th}>Produkt</th>
                  <th className={`${th} text-right`}>Stan</th>
                  <th className={`${th} text-right`}>Zużycie / dzień</th>
                  <th className={`${th} text-right`}>Wystarczy na</th>
                  <th className={`${th} text-right`}>Zaplanowane (14 dni)</th>
                  <th className={`${th} text-right`}>Po zaplanowanych</th>
                  <th className={th}>Zabraknie</th>
                </tr>
              </thead>
              <tbody>
                {items.map((f) => (
                  <tr key={f.itemId} className="border-t border-slate-100">
                    <td className="py-2.5 px-3 font-semibold text-green-deep">
                      {f.name}{' '}
                      {f.isLowStock && (
                        <Badge tone="danger" size="sm">
                          Niski stan
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {formatQuantity(f.stock)} {f.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                      {formatQuantity(f.averageDailyUse)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {f.daysLeft === null ? '—' : `${Math.floor(f.daysLeft)} dni`}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">{formatQuantity(f.plannedUse)}</td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono ${f.stockAfterPlanned < 0 ? 'text-red-500 font-bold' : ''}`}
                    >
                      {formatQuantity(f.stockAfterPlanned)}
                    </td>
                    <td className="py-2.5 px-3 text-red-500 font-semibold">
                      {f.runsOutAt
                        ? formatInZone(f.runsOutAt, timeZone, { dateStyle: 'short', timeStyle: 'short' })
                        : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </FormSection>

      <FormSection icon={Gauge} title="Trafność szacunków zużycia" tone="amber">
        <div className="overflow-x-auto">
          {accuracy.isLoading ? (
            <div className="p-5">
              <Skeleton width="100%" height="96px" className="rounded-xl" />
            </div>
          ) : !accuracy.data?.length ? (
            <p className="p-5 text-sm text-slate-400">
              Brak danych: zapisuj faktyczne zużycie w zakończonych rezerwacjach, a szacunki zaczną się uczyć.
            </p>
          ) : (
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-left">
                  <th className={th}>Materiał</th>
                  <th className={`${th} text-right`}>Wizyt</th>
                  <th className={`${th} text-right`}>Współczynnik</th>
                  <th className={`${th} text-right`}>Średni błąd</th>
                </tr>
              </thead>
              <tbody>
                {accuracy.data.map((a) => (
                  <tr key={`${a.serviceId}:${a.itemId}`} className="border-t border-slate-100">
                    <td className="py-2.5 px-3 font-semibold text-green-deep">{a.itemName}</td>
                    <td className="py-2.5 px-3 text-right">{a.samples}</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      ×{formatQuantity(a.factor)}{' '}
                      {!a.factorApplied && <span className="text-slate-400">(jeszcze nie)</span>}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {a.meanAbsolutePercentageError === null ? '—' : `${Math.round(a.meanAbsolutePercentageError)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </FormSection>
    </div>
  );
}
