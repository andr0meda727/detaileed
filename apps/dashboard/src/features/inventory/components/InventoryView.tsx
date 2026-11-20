import React, { useState, useMemo } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { Plus, Search, Filter, ChevronDown } from 'lucide-react';
import { type InventoryItem } from '@/features/inventory/model/types';
import InventoryItemModal from '@/features/inventory/components/InventoryItemModal';
import InventoryTable from '@/features/inventory/components/InventoryTable';
import ItemHistoryModal from '@/features/inventory/components/ItemHistoryModal';
import ForecastView from '@/features/inventory/components/ForecastView';
import { filterInventory } from '@/features/inventory/model/filterInventory';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { useInventory } from '@/features/inventory/api/inventory';
import { useCategories } from '@/features/inventory/api/categories';

import GlobalHeader from '@/shared/ui/GlobalHeader';

import { CreateBookingModal } from '@/features/bookings';
import { CreateClientModal } from '@/features/clients';

// ─── View ─────────────────────────────────────────────────────────────────────
const routeApi = getRouteApi('/_signed-in/s/$studioId/inventory');

const InventoryView: React.FC = () => {
  const { data: items = [], isLoading: isInventoryLoading } = useInventory();
  const { data: categories = [] } = useCategories();

  const { category: selectedCategoryName = null } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const setSelectedCategoryName = (category: string | null) =>
    void navigate({ search: (prev) => ({ ...prev, category: category ?? undefined }), replace: true });
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [itemModal, setItemModal] = useState<{ item: InventoryItem | null; key: number } | null>(null);
  const handleOpenModal = (item?: InventoryItem) => setItemModal({ item: item ?? null, key: Date.now() });
  // The id only: the item is read from the list, so its stock updates after a delivery or stocktake.
  const [historyItemId, setHistoryItemId] = useState<string | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [view, setView] = useState<'stock' | 'forecast'>('stock');

  const debouncedSearchQuery = useDebouncedValue(searchQuery);

  const filteredItems = useMemo(
    () => filterInventory(items, debouncedSearchQuery, selectedCategoryName),
    [debouncedSearchQuery, items, selectedCategoryName],
  );

  const handleOpenNewBooking = () => {
    setIsBookingModalOpen(true);
  };

  // Removed full-page loading to keep layout static

  return (
    <div className="space-y-6 sm:space-y-10">
      <GlobalHeader
        title="Magazyn"
        subtitle="Baza Produktów"
        onAddBooking={handleOpenNewBooking}
        onAddClient={() => setIsClientModalOpen(true)}
      />

      <div className="flex bg-white border border-slate-100 rounded-2xl p-1.5 w-fit">
        {(
          [
            ['stock', 'Stany'],
            ['forecast', 'Prognoza'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={view === id}
            onClick={() => setView(id)}
            className={`px-5 py-2.5 rounded-xl text-[11px] font-semibold uppercase tracking-widest ${view === id ? 'bg-green-deep text-cream-warm' : 'text-slate-400 hover:text-green-deep'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'forecast' ? (
        <ForecastView />
      ) : (
        <>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 lg:flex-none lg:w-[400px] relative group">
              <Search
                size={20}
                className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-light transition-colors"
              />
              <input
                type="text"
                placeholder="Szukaj produktu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-xl outline-hidden shadow-xs focus:ring-8 focus:ring-cream-warm/20 focus:border-cream-warm/40 transition-all font-bold text-sm sm:text-base"
              />
            </div>

            {/* Custom Category Dropdown */}
            <div
              className="flex-1 relative"
              tabIndex={0}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setIsCategoryDropdownOpen(false);
                }
              }}
            >
              <div
                onClick={() => setIsCategoryDropdownOpen((p) => !p)}
                className={`w-full pl-14 pr-12 py-5 bg-white border rounded-xl outline-hidden shadow-xs transition-all font-bold text-sm sm:text-base cursor-pointer flex items-center h-full hover:border-cream-warm/60 ${isCategoryDropdownOpen ? 'border-cream-warm/60 ring-8 ring-cream-warm/20 text-green-deep' : 'border-slate-200 text-slate-700'}`}
              >
                <div
                  className={`absolute left-6 pointer-events-none transition-colors ${isCategoryDropdownOpen ? 'text-green-deep' : 'text-slate-400 group-hover:text-green-light'}`}
                >
                  <Filter size={18} />
                </div>
                <span className="truncate flex-1 select-none">{selectedCategoryName || 'Wszystkie Kategorie'}</span>
                <div
                  className={`absolute right-6 pointer-events-none transition-colors ${isCategoryDropdownOpen ? 'text-green-deep' : 'text-slate-400 group-hover:text-green-light'}`}
                >
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </div>

              <div
                className={`absolute z-10 top-[calc(100%+0.5rem)] left-0 right-0 bg-white rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden py-2 transform origin-top transition-all duration-200 ease-out ${isCategoryDropdownOpen ? 'opacity-100 scale-y-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'}`}
              >
                <div className="max-h-[300px] overflow-y-auto w-full custom-scrollbar">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryName(null);
                      setIsCategoryDropdownOpen(false);
                    }}
                    className={`w-full text-left px-6 py-3.5 text-sm font-bold transition-all border-b border-slate-50 block select-none ${!selectedCategoryName ? 'bg-amber/10 text-amber' : 'text-slate-500 hover:bg-slate-50 hover:text-green-deep'}`}
                  >
                    Wszystkie Kategorie
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryName(c.name);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={`w-full text-left px-6 py-3.5 text-sm font-bold transition-all block select-none ${selectedCategoryName === c.name ? 'bg-amber/10 text-amber' : 'text-slate-500 hover:bg-slate-50 hover:text-green-deep'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-green-deep text-cream-warm px-10 py-5 rounded-xl font-bold text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-3 shadow-[0_8px_30px_rgb(33,52,40,0.15)] hover:shadow-[0_8px_30px_rgb(33,52,40,0.25)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 shrink-0 border border-green-deep hover:border-green-light/30 relative overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
              <Plus size={18} strokeWidth={2.5} className="relative z-10" />
              <span className="relative z-10">Dodaj Produkt</span>
            </button>
          </div>

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

export default InventoryView;
