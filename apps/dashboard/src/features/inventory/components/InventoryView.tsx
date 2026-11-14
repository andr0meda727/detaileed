import React, { useState, useMemo, useEffect } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { Plus, Search, Edit2, Package, Check, X, Filter, ChevronDown } from 'lucide-react';
import { isLowStock, type InventoryItem, type InventoryItemInput } from '@/features/inventory/model/types';
import InventoryItemModal from '@/features/inventory/components/InventoryItemModal';
import { useInventory, useUpdateInventoryItem } from '@/features/inventory/api/inventory';
import { useCategories } from '@/features/inventory/api/categories';
import { useToast } from '@/shared/ui/ToastContext';
import GlobalHeader from '@/shared/ui/GlobalHeader';

import Skeleton from '@/shared/ui/Skeleton';
import EmptyState from '@/shared/ui/EmptyState';
import { getApiErrorMessage } from '@/shared/lib/errorHandler';
import { CreateBookingModal } from '@/features/bookings';
import { CreateClientModal } from '@/features/clients';

// ─── View ─────────────────────────────────────────────────────────────────────
const routeApi = getRouteApi('/_auth/s/$studioId/inventory');

const InventoryView: React.FC = () => {
  const { addToast } = useToast();
  const { data: items = [], isLoading: isInventoryLoading } = useInventory();
  const { data: categories = [] } = useCategories();
  const updateItem = useUpdateInventoryItem();

  const { category: selectedCategoryName = null } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const setSelectedCategoryName = (category: string | null) =>
    void navigate({ search: (prev) => ({ ...prev, category: category ?? undefined }), replace: true });
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const [quickEditStockId, setQuickEditStockId] = useState<string | null>(null);
  const [quickEditStockValue, setQuickEditStockValue] = useState('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [itemModal, setItemModal] = useState<{ item: InventoryItem | null; key: number } | null>(null);
  const handleOpenModal = (item?: InventoryItem) => setItemModal({ item: item ?? null, key: Date.now() });
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearchQuery(searchQuery), 140);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const filteredItems = useMemo(() => {
    const q = debouncedSearchQuery.toLowerCase();
    const filtered = items.filter((i) => {
      const matchSearch = i.name.toLowerCase().includes(q) || (i.categoryName || '').toLowerCase().includes(q);
      const matchCategory = selectedCategoryName ? i.categoryName === selectedCategoryName : true;
      return matchSearch && matchCategory;
    });

    return filtered.sort((a, b) => {
      const aLow = isLowStock(a);
      const bLow = isLowStock(b);

      if (aLow && !bLow) return -1;
      if (!aLow && bLow) return 1;

      // Secondary sort: alphabetically by name
      return a.name.localeCompare(b.name);
    });
  }, [debouncedSearchQuery, items, selectedCategoryName]);

  const handleOpenNewBooking = () => {
    setIsBookingModalOpen(true);
  };

  const handleQuickStockSave = async (item: InventoryItem) => {
    const newStock = Number(quickEditStockValue.replace(',', '.'));
    if (quickEditStockValue.trim() === '' || Number.isNaN(newStock)) return;
    const foundCategory = categories.find((c) => c.name === item.categoryName);
    const dto: InventoryItemInput = {
      name: item.name,
      categoryId: foundCategory ? foundCategory.id : null,
      unit: item.unit,
      stock: newStock,
      minStock: item.minStock || null,
      description: item.description || null,
    };
    try {
      await updateItem.mutateAsync({ id: item.id, dto });
      setQuickEditStockId(null);
      addToast('Zaktualizowano stan magazynowy', 'success');
    } catch (err) {
      console.error(err);
      addToast(getApiErrorMessage(err, 'Błąd podczas aktualizacji stanu'), 'error');
    }
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
            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-xl outline-none shadow-sm focus:ring-8 focus:ring-cream-warm/20 focus:border-cream-warm/40 transition-all font-bold text-sm sm:text-base"
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
            className={`w-full pl-14 pr-12 py-5 bg-white border rounded-xl outline-none shadow-sm transition-all font-bold text-sm sm:text-base cursor-pointer flex items-center h-full hover:border-cream-warm/60 ${isCategoryDropdownOpen ? 'border-cream-warm/60 ring-8 ring-cream-warm/20 text-green-deep' : 'border-slate-200 text-slate-700'}`}
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

      <div
        className={`bg-white rounded-2xl lg:rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-opacity duration-200 ${searchQuery !== debouncedSearchQuery ? 'opacity-70' : 'opacity-100'}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-[#fcfcfc] border-b border-slate-100">
                <th className="px-10 py-8 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Produkt
                </th>
                <th className="px-10 py-8 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Kategoria
                </th>
                <th className="px-10 py-8 text-[10px] font-semibold uppercase tracking-widest text-slate-400 text-right">
                  Stan
                </th>
                <th className="px-10 py-8 text-[10px] font-semibold uppercase tracking-widest text-slate-400 text-center">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isInventoryLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <Skeleton width="48px" height="48px" className="rounded-xl" />
                        <Skeleton width="180px" height="20px" />
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <Skeleton width="80px" height="24px" className="rounded-lg" />
                    </td>
                    <td className="px-10 py-8 text-right">
                      <Skeleton width="60px" height="32px" className="ml-auto" />
                    </td>
                    <td className="px-10 py-8 text-center">
                      <Skeleton width="40px" height="40px" className="rounded-xl mx-auto" />
                    </td>
                  </tr>
                ))
              ) : (
                <>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#f8f9fa] rounded-xl flex items-center justify-center text-slate-300 group-hover:text-green-light transition-colors">
                            <Package size={20} />
                          </div>
                          <span className="font-bold text-green-deep text-base lg:text-lg tracking-tighter">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className="px-4 py-1.5 bg-white border border-slate-100 text-slate-500 rounded-lg text-[9px] lg:text-[10px] font-semibold uppercase tracking-widest">
                          {item.categoryName || '—'}
                        </span>
                      </td>
                      <td
                        className={`px-10 py-8 text-right font-mono text-xl lg:text-2xl font-extrabold ${item.minStock !== null && item.stock < item.minStock ? 'text-red-500' : 'text-green-deep'}`}
                      >
                        {quickEditStockId === item.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="number"
                              autoFocus
                              value={quickEditStockValue}
                              onChange={(e) => setQuickEditStockValue(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleQuickStockSave(item)}
                              className="w-24 px-3 py-2 text-right bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-cream-warm/50 font-bold text-lg text-green-deep"
                            />
                            <button
                              onClick={() => handleQuickStockSave(item)}
                              disabled={updateItem.isPending}
                              className="p-2 bg-green-deep text-cream-warm rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-all"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => setQuickEditStockId(null)}
                              className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-all"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div
                            className="group/stock inline-flex items-center justify-end cursor-pointer hover:opacity-80 transition-all relative"
                            onClick={() => {
                              setQuickEditStockId(item.id);
                              setQuickEditStockValue(item.stock.toString());
                            }}
                          >
                            {item.stock}
                            <span className="text-[10px] ml-1 opacity-40 uppercase">{item.unit}</span>
                            <div className="absolute -left-6 opacity-0 group-hover/stock:opacity-100 transition-opacity bg-slate-100 p-1.5 rounded-lg text-slate-400">
                              <Edit2 size={12} />
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-10 py-8 text-center">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-green-deep hover:text-cream-warm transition-all active:scale-90"
                        >
                          <Edit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
          {filteredItems.length === 0 && <EmptyState message="Brak produktów w magazynie" icon={Package} />}
        </div>
      </div>

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
