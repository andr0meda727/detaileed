import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { InventoryItem } from '@/features/inventory';
import { Badge, Card, CardHeader, EmptyState, Skeleton } from '@detaileed/ui';

interface StockAlertsProps {
  items: InventoryItem[];
  loading: boolean;
}

/** Inventory items below their minimum stock. */
export const StockAlerts: React.FC<StockAlertsProps> = ({ items, loading }) => (
  <Card>
    <CardHeader
      title="Alerty magazynowe"
      actions={!loading && items.length > 0 && <Badge tone="warning">{items.length} do uzupełnienia</Badge>}
    />
    {loading ? (
      <ul aria-hidden className="divide-y divide-border">
        {[1, 2].map((i) => (
          <li key={i} className="flex items-center justify-between gap-3 px-5 py-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton width="60%" height="14px" />
              <Skeleton width="40%" height="12px" />
            </div>
            <Skeleton width="56px" height="14px" />
          </li>
        ))}
      </ul>
    ) : items.length === 0 ? (
      <EmptyState icon={CheckCircle2} message="Wszystko w normie" className="py-8" />
    ) : (
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
              <p className="truncate text-xs text-faint">{item.categoryName || 'Brak kategorii'}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-sm tabular-nums text-warning">
                {item.stock} {item.unit}
              </p>
              <p className="font-mono text-xs tabular-nums text-faint">min. {item.minStock}</p>
            </div>
          </li>
        ))}
      </ul>
    )}
  </Card>
);
