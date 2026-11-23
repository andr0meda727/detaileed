import React from 'react';
import { History, Package, Pencil } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
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
import { formatQuantity } from '@/features/inventory/model/ledger';
import { stockLevel, type InventoryItem } from '@/features/inventory/model/types';

interface InventoryTableProps {
  items: InventoryItem[];
  isLoading: boolean;
  /** Fades the list while a new search is pending. */
  dimmed: boolean;
  onEdit: (item: InventoryItem) => void;
  /** Opens the item's stock history with deliveries and stocktakes. */
  onOpenHistory: (item: InventoryItem) => void;
}

function StockBadge({ item }: { item: InventoryItem }) {
  const level = stockLevel(item);
  if (level === 'out') return <Badge tone="danger">Brak</Badge>;
  if (level === 'low') return <Badge tone="warning">Niski stan</Badge>;
  return null;
}

function LoadingRows() {
  return [1, 2, 3, 4, 5].map((i) => (
    <TableRow key={i}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton width="32px" height="32px" className="rounded-md" />
          <Skeleton width="180px" height="16px" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton width="80px" height="16px" />
      </TableCell>
      <TableCell>
        <Skeleton width="72px" height="16px" className="ml-auto" />
      </TableCell>
      <TableCell>
        <Skeleton width="64px" height="32px" className="ml-auto" />
      </TableCell>
    </TableRow>
  ));
}

/** Stock items with their category and stock level (low and empty stock flagged), plus history and edit actions. */
export const InventoryTable: React.FC<InventoryTableProps> = ({ items, isLoading, dimmed, onEdit, onOpenHistory }) => {
  return (
    <Card className={cn('overflow-hidden transition-opacity duration-150', dimmed && 'opacity-70')}>
      <Table aria-label="Produkty w magazynie" className="min-w-[640px]">
        <TableHeader>
          <TableRow>
            <TableHead>Produkt</TableHead>
            <TableHead>Kategoria</TableHead>
            <TableHead className="text-right">Stan</TableHead>
            <TableHead className="w-24 text-right">
              <span className="sr-only">Akcje</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <LoadingRows />
          ) : (
            items.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Package size={16} strokeWidth={1.75} aria-hidden />
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{item.categoryName || '—'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <StockBadge item={item} />
                    <span className="font-mono font-medium tabular-nums whitespace-nowrap">
                      {formatQuantity(item.stock)} <span className="text-faint">{item.unit}</span>
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={History}
                      aria-label={`Historia i dostawy: ${item.name}`}
                      onClick={() => onOpenHistory(item)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Pencil}
                      aria-label={`Edytuj: ${item.name}`}
                      onClick={() => onEdit(item)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {!isLoading && items.length === 0 && <EmptyState message="Brak produktów w magazynie" icon={Package} />}
    </Card>
  );
};
