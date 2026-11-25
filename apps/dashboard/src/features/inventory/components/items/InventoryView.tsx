import React, { useState, useMemo } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { SegmentedControl } from '@detaileed/ui';
import { type InventoryItem } from '@/features/inventory/model/types';
import { InventoryItemModal } from '@/features/inventory/components/items/InventoryItemModal';
import { InventoryFilters } from '@/features/inventory/components/items/InventoryFilters';
import { InventoryTable } from '@/features/inventory/components/items/InventoryTable';
import { ItemHistoryModal } from '@/features/inventory/components/ledger/ItemHistoryModal';
import { ForecastView } from '@/features/inventory/components/ledger/ForecastView';
import { filterInventory } from '@/features/inventory/model/filterInventory';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { useInventory } from '@/features/inventory/api/inventory';
import { useCategories } from '@/features/inventory/api/categories';

import { GlobalHeader } from '@/shared/ui/GlobalHeader';

import { CreateBookingModal } from '@/features/bookings';
import { CreateClientModal } from '@/features/clients';

const routeApi = getRouteApi('/_signed-in/s/$studioId/inventory');

type InventorySection = 'stock' | 'forecast';

const SECTIONS = [
  { value: 'stock', label: 'Stany' },
  { value: 'forecast', label: 'Prognoza' },
] as const;

export const InventoryView: React.FC = () => {
  const { data: items = [], isLoading: isInventoryLoading } = useInventory();
  const { data: categories = [] } = useCategories();

  const { category: selectedCategoryName = null } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const setSelectedCategoryName = (category: string | null) =>
    void navigate({ search: (prev) => ({ ...prev, category: category ?? undefined }), replace: true });

  const [searchQuery, setSearchQuery] = useState('');

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [itemModal, setItemModal] = useState<{ item: InventoryItem | null; key: number } | null>(null);
  const handleOpenModal = (item?: InventoryItem) => setItemModal({ item: item ?? null, key: Date.now() });
  // The id only: the item is read from the list, so its stock updates after a delivery or stocktake.
  const [historyItemId, setHistoryItemId] = useState<string | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [view, setView] = useState<InventorySection>('stock');

  const debouncedSearchQuery = useDebouncedValue(searchQuery);

  const filteredItems = useMemo(
    () => filterInventory(items, debouncedSearchQuery, selectedCategoryName),
    [debouncedSearchQuery, items, selectedCategoryName],
  );

  return (
    <div className="flex flex-col gap-6">
      <GlobalHeader
        title="Magazyn"
        subtitle="Baza produktów"
        onAddBooking={() => setIsBookingModalOpen(true)}
        onAddClient={() => setIsClientModalOpen(true)}
      />

      <SegmentedControl
        aria-label="Widok magazynu"
        options={SECTIONS}
        value={view}
        onValueChange={setView}
        className="self-start"
      />

      {view === 'forecast' ? (
        <ForecastView />
      ) : (
        <>
          <InventoryFilters
            search={searchQuery}
            onSearchChange={setSearchQuery}
            categories={categories}
            category={selectedCategoryName}
            onCategoryChange={setSelectedCategoryName}
            onAdd={() => handleOpenModal()}
          />

          <InventoryTable
            items={filteredItems}
            isLoading={isInventoryLoading}
            dimmed={searchQuery !== debouncedSearchQuery}
            onEdit={handleOpenModal}
            onOpenHistory={(item) => setHistoryItemId(item.id)}
          />
        </>
      )}
      <ItemHistoryModal
        item={items.find((i) => i.id === historyItemId) ?? null}
        onClose={() => setHistoryItemId(null)}
      />

      <InventoryItemModal
        key={itemModal?.key ?? 'closed'}
        isOpen={itemModal !== null}
        item={itemModal?.item ?? null}
        onClose={() => setItemModal(null)}
      />

      <CreateBookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />

      <CreateClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} />
    </div>
  );
};
