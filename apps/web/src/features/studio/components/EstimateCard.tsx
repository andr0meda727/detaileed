import Link from 'next/link';
import { Send } from 'lucide-react';
import type { EstimateDto } from '@detaileed/api-client';
import { Button } from '@detaileed/ui';
import { formatPln } from '@detaileed/domain/money';

interface EstimateCardProps {
  /** Short size label in lower case ("średnie"). */
  sizeLabel: string;
  selectedCount: number;
  estimate: EstimateDto | undefined;
  /** The request page with the picked services and size. */
  bookHref: string;
}

/** The estimate for the picked services and the call to send a request; the link appears once a service is picked. */
export function EstimateCard({ sizeLabel, selectedCount, estimate, bookHref }: EstimateCardProps) {
  return (
    <div className="flex flex-col gap-3.5 rounded-lg border border-border bg-surface p-5">
      <div aria-live="polite" className="flex flex-col gap-3.5">
        <div>
          <p className="text-sm text-muted-foreground">Szacunkowo dla auta: {sizeLabel}</p>
          <p className="mt-1.5 font-mono text-3xl font-medium tracking-tight tabular-nums text-foreground">
            {selectedCount === 0 ? '—' : estimate ? `${formatPln(Number(estimate.total))} zł` : '…'}
          </p>
          {selectedCount > 0 && estimate?.hasUnpricedServices && (
            <p className="mt-1 text-sm text-muted-foreground">+ wycena części usług</p>
          )}
        </div>
        {selectedCount === 0 ? (
          <p className="text-sm text-muted-foreground">Zaznacz usługi, aby zobaczyć szacunkową cenę.</p>
        ) : (
          estimate && (
            <ul className="flex flex-col gap-2 border-t border-border pt-3">
              {estimate.services.map((s) => (
                <li key={s.serviceId} className="flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="whitespace-nowrap font-mono tabular-nums text-foreground">
                    {s.price == null ? 'na zapytanie' : `${formatPln(Number(s.price))} zł`}
                  </span>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
      {selectedCount > 0 ? (
        <Button asChild size="lg" fullWidth icon={Send}>
          <Link href={bookHref}>Wyślij zapytanie o termin</Link>
        </Button>
      ) : (
        <Button size="lg" fullWidth icon={Send} disabled>
          Wyślij zapytanie o termin
        </Button>
      )}
      <p className="text-xs leading-relaxed text-faint">
        To jeszcze nie rezerwacja. Studio odpisze z wolnym terminem i potwierdzi cenę.
      </p>
    </div>
  );
}
