import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Modal, Skeleton } from '@detaileed/ui';
import { formatInZone } from '@detaileed/domain/studioTime';
import { useStudioTimeZone } from '@/features/studios';
import { useMovements } from '@/features/inventory/api/ledger';
import { MOVEMENT_LABELS, formatQuantity } from '@/features/inventory/model/ledger';
import type { InventoryItem } from '@/features/inventory/model/types';
import MovementForm from '@/features/inventory/components/MovementForm';

interface ItemHistoryModalProps {
  /** The item to show, or null when closed. */
  item: InventoryItem | null;
  onClose: () => void;
}

function History({ item }: { item: InventoryItem }) {
  const timeZone = useStudioTimeZone();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMovements(item.id, page);

  if (isLoading) return <Skeleton width="100%" height="160px" className="rounded-xl" />;
  if (!data?.items.length) return <p className="text-sm text-slate-400">Brak ruchów magazynowych.</p>;

  return (
    <div className="space-y-2">
      <ul className="divide-y divide-slate-100 border border-slate-100 rounded-xl">
        {data.items.map((m) => (
          <li key={m.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
            <span className="w-36 shrink-0 text-xs text-slate-400">
              {formatInZone(m.createdAt, timeZone, { dateStyle: 'short', timeStyle: 'short' })}
            </span>
            <span className="flex-1 font-semibold text-green-deep">
              {MOVEMENT_LABELS[m.type] ?? m.type}
              {m.note && <span className="font-normal text-slate-500"> · {m.note}</span>}
            </span>
            <span className={`font-mono font-bold ${m.quantity < 0 ? 'text-red-500' : 'text-green-light'}`}>
              {m.quantity > 0 ? '+' : ''}
              {formatQuantity(m.quantity)} {item.unit}
            </span>
          </li>
        ))}
      </ul>
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
          <button
            type="button"
            aria-label="Nowsze"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="p-1.5 disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          {page} / {data.totalPages}
          <button
            type="button"
            aria-label="Starsze"
            disabled={page >= data.totalPages}
            onClick={() => setPage(page + 1)}
            className="p-1.5 disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

/** An item's stock and its history (deliveries, stocktakes, what visits used), with a delivery/stocktake form. */
export default function ItemHistoryModal({ item, onClose }: ItemHistoryModalProps) {
  return (
    <Modal isOpen={item !== null} onClose={onClose} title={item ? item.name : ''}>
      {item && (
        <div className="space-y-5 pb-4">
          <p className="text-sm text-slate-500">
            Stan: <strong className="text-2xl font-mono text-green-deep">{formatQuantity(item.stock)}</strong>{' '}
            {item.unit}
            {item.minStock !== null && <span> · minimum {formatQuantity(item.minStock)}</span>}
          </p>
          <MovementForm itemId={item.id} unit={item.unit} />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Historia</p>
            <History item={item} />
          </div>
        </div>
      )}
    </Modal>
  );
}
