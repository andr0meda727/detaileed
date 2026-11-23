import { useMemo, useState } from 'react';
import { History, Package, Pencil, Plus } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  SearchInput,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@detaileed/ui';
import { MOCK_INVENTORY } from '../../model/demoData';
import { DemoHeader } from './DemoHeader';

/** The demo's stock list with a search; items under their minimum get a "Niski stan" badge. */
export function InventoryView() {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_INVENTORY.filter((i) => i.name.toLowerCase().includes(q) || i.categoryName.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="space-y-6">
      <DemoHeader title="Magazyn" subtitle="Baza produktów" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          aria-label="Szukaj produktu"
          placeholder="Szukaj produktu..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery('')}
          wrapperClassName="sm:w-80"
        />
        <Button variant="secondary" icon={Plus}>
          Dodaj produkt
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table aria-label="Produkty w magazynie" className="sm:min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead>Produkt</TableHead>
              <TableHead className="max-sm:hidden">Kategoria</TableHead>
              <TableHead className="text-right">Stan</TableHead>
              <TableHead className="w-20 text-right sm:w-24">
                <span className="sr-only">Akcje</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground max-sm:hidden">
                      <Package size={16} strokeWidth={1.75} aria-hidden />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs text-muted-foreground sm:hidden">{item.categoryName}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground max-sm:hidden">{item.categoryName}</TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col-reverse items-end gap-1 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
                    {item.stock < item.minStock && <Badge tone="warning">Niski stan</Badge>}
                    <span className="font-mono font-medium tabular-nums whitespace-nowrap">
                      {item.stock} <span className="text-faint">{item.unit}</span>
                    </span>
                  </div>
                </TableCell>
                <TableCell className="max-sm:px-2">
                  <div className="flex justify-end gap-0.5 sm:gap-1">
                    <Button variant="ghost" size="sm" icon={History} aria-label={`Historia i dostawy: ${item.name}`} />
                    <Button variant="ghost" size="sm" icon={Pencil} aria-label={`Edytuj: ${item.name}`} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && <EmptyState message="Brak produktów w magazynie" icon={Package} />}
      </Card>
    </div>
  );
}
