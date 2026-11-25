import { useState } from 'react';
import { Modal, Pagination, Skeleton, Stat, type StatTone } from '@detaileed/ui';
import { formatInZone } from '@detaileed/domain/studioTime';
import { useStudioTimeZone } from '@/features/studios';
import { useMovements } from '@/features/inventory/api/ledger';
import { MOVEMENT_LABELS, formatQuantity } from '@/features/inventory/model/ledger';
import { stockLevel, type InventoryItem } from '@/features/inventory/model/types';
import { MovementForm } from '@/features/inventory/components/ledger/MovementForm';

interface ItemHistoryModalProps {
  /** The item to show, or null when closed. */
  item: InventoryItem | null;
  onClose: () => void;
}

const STOCK_TONES: Record<ReturnType<typeof stockLevel>, StatTone> = { out: 'danger', low: 'warning', ok: 'neutral' };

function History({ item }: { item: InventoryItem }) {
  const timeZone = useStudioTimeZone();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMovements(item.id, page);

  if (isLoading) return <Skeleton width="100%" height="160px" className="rounded-lg" />;
  if (!data?.items.length) return <p className="text-sm text-muted-foreground">Brak ruchów magazynowych.</p>;

  return (
    <div className="flex flex-col gap-3">
      <ul className="divide-y divide-border rounded-lg border border-border">
        {data.items.map((m) => (
          <li key={m.id} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-4 py-2.5 text-sm">
            <span className="w-full shrink-0 font-mono text-xs text-faint tabular-nums sm:w-32">
              {formatInZone(m.createdAt, timeZone, { dateStyle: 'short', timeStyle: 'short' })}
            </span>
            <span className="min-w-0 flex-1 font-medium text-foreground">
              {MOVEMENT_LABELS[m.type] ?? m.type}
              {m.note && <span className="font-normal text-muted-foreground"> · {m.note}</span>}
            </span>
            <span className="font-mono font-medium whitespace-nowrap tabular-nums">
              {m.quantity > 0 ? '+' : ''}
              {formatQuantity(m.quantity)} {item.unit}
            </span>
          </li>
        ))}
      </ul>
      <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} label="Strony historii" />
    </div>
  );
}

/** An item's stock and its history (deliveries, stocktakes, what visits used), with a delivery/stocktake form. */
export function ItemHistoryModal({ item, onClose }: ItemHistoryModalProps) {
  return (
    <Modal
      isOpen={item !== null}
      onClose={onClose}
      title={item ? item.name : ''}
      description="Dostawy, inwentaryzacje i zużycie w wizytach"
    >
      {item && (
        <div className="flex flex-col gap-5">
          <Stat
            label="Stan"
            value={`${formatQuantity(item.stock)} ${item.unit}`}
            hint={item.minStock !== null ? `Minimum ${formatQuantity(item.minStock)} ${item.unit}` : undefined}
            tone={STOCK_TONES[stockLevel(item)]}
          />
          <MovementForm itemId={item.id} unit={item.unit} />
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-foreground">Historia</h3>
            <History item={item} />
          </section>
        </div>
      )}
    </Modal>
  );
}
