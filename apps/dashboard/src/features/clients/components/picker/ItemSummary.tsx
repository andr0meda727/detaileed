import type { LucideIcon } from 'lucide-react';
import { LicensePlate, cn } from '@detaileed/ui';

/** What a search result or a picked item shows: a title, a subtitle and an optional badge (a plate). */
export interface ItemSummary {
  key: string;
  title: string;
  subtitle: string;
  badge?: string;
}

function Texts({ item }: { item: ItemSummary }) {
  return (
    <div className="min-w-0 text-left">
      <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
      <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
    </div>
  );
}

/** A search result row. */
export function ResultRow({ item, onPick }: { item: ItemSummary; onPick: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 transition-colors duration-150 hover:bg-muted',
        'outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      )}
    >
      <Texts item={item} />
      {item.badge && <LicensePlate plate={item.badge} />}
    </button>
  );
}

/** The highlighted card of the item that is currently picked. */
export function PickedItem({ item, icon: Icon }: { item: ItemSummary; icon: LucideIcon }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-primary bg-muted px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface text-foreground">
          <Icon size={16} strokeWidth={1.75} aria-hidden />
        </span>
        <Texts item={item} />
      </div>
      {item.badge && <LicensePlate plate={item.badge} />}
    </div>
  );
}
