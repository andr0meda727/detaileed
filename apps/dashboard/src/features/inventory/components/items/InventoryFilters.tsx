import { Plus } from 'lucide-react';
import { Button, SearchInput, Select } from '@detaileed/ui';
import type { InventoryCategory } from '@/features/inventory/model/types';

interface InventoryFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  categories: InventoryCategory[];
  /** The chosen category's name, or null for all. */
  category: string | null;
  onCategoryChange: (category: string | null) => void;
  onAdd: () => void;
}

const ALL = '';

/** The search, the category filter and the "add item" button above the stock table. */
export function InventoryFilters({
  search,
  onSearchChange,
  categories,
  category,
  onCategoryChange,
  onAdd,
}: InventoryFiltersProps) {
  const names = categories.map((c) => c.name);
  // A category from the URL stays visible while the list loads (or after it was renamed).
  if (category && !names.includes(category)) names.push(category);
  const options = [
    { value: ALL, label: 'Wszystkie kategorie' },
    ...names.map((name) => ({ value: name, label: name })),
  ];
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <SearchInput
        aria-label="Szukaj produktu"
        placeholder="Szukaj produktu…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onClear={() => onSearchChange('')}
        wrapperClassName="sm:max-w-80"
      />
      <div className="sm:w-56">
        <Select
          aria-label="Kategoria"
          options={options}
          value={category ?? ALL}
          onChange={(e) => onCategoryChange(e.target.value || null)}
        />
      </div>
      <Button variant="secondary" icon={Plus} onClick={onAdd} className="sm:ml-auto">
        Dodaj produkt
      </Button>
    </div>
  );
}
