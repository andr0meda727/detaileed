import React, { useState, useMemo, useEffect } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { Plus, Search, Edit2, Package, Check, X, UserPlus, Car as CarIcon, Save, Calendar, Wrench } from 'lucide-react';
import { InventoryCreateDto, ClientResponseDto, VehicleInfoDto, BookingCreateDto } from '../../types';
import {
  useInventory,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useCategories,
  useCreateCategory,
} from '../../hooks';
import { useToast } from '../../contexts/ToastContext';
import GlobalHeader from '../../components/GlobalHeader';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { getApiErrorMessage } from '../../utils/errorHandler';
import { Filter, ChevronDown } from 'lucide-react';
import CreateBookingModal from '../../components/modals/CreateBookingModal';
import CreateClientModal from '../../components/modals/CreateClientModal';

const DEFAULT_UNITS = ['ml', 'L', 'szt', 'm²', 'kg'];

// ─── Form ────────────────────────────────────────────────────────────────────
interface ItemFormData {
  name: string;
  categoryId: string | null;
  unit: string;
  stock: number;
  minStock: number;
  description: string;
}

const defaultForm = (): ItemFormData => ({
  name: '',
  categoryId: null,
  unit: 'ml',
  stock: 0,
  minStock: 0,
  description: '',
});

// ─── View ─────────────────────────────────────────────────────────────────────
const routeApi = getRouteApi('/_auth/s/$studioId/inventory');

const InventoryView: React.FC = () => {
  const { addToast } = useToast();
  const { data: items = [], isLoading: isInventoryLoading } = useInventory();
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();
  const createCategory = useCreateCategory();

  const { category: selectedCategoryName = null } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const setSelectedCategoryName = (category: string | null) =>
    void navigate({ search: (prev) => ({ ...prev, category: category ?? undefined }), replace: true });
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isFormCategoryDropdownOpen, setIsFormCategoryDropdownOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ItemFormData>(defaultForm());
  const [customUnit, setCustomUnit] = useState('');

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [quickEditStockId, setQuickEditStockId] = useState<string | null>(null);
  const [quickEditStockValue, setQuickEditStockValue] = useState('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
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
      const aLow = a.minStock !== null && a.stock < a.minStock;
      const bLow = b.minStock !== null && b.stock < b.minStock;

      if (aLow && !bLow) return -1;
      if (!aLow && bLow) return 1;

      // Secondary sort: alphabetically by name
      return a.name.localeCompare(b.name);
    });
  }, [debouncedSearchQuery, items, selectedCategoryName]);

  const handleOpenModal = (item?: (typeof items)[0]) => {
    if (item) {
      setEditingId(item.id);
      const foundCategory = categories.find((c) => c.name === item.categoryName);
      setFormData({
        name: item.name,
        categoryId: foundCategory ? foundCategory.id : null,
        unit: item.unit,
        stock: item.stock,
        minStock: item.minStock ?? 0,
        description: item.description ?? '',
      });
      setCustomUnit(DEFAULT_UNITS.includes(item.unit) ? '' : item.unit);
    } else {
      setEditingId(null);
      setFormData(defaultForm());
      setCustomUnit('');
    }
    setIsAddingCategory(false);
    setNewCategoryName('');
    setIsModalOpen(true);
  };

  const handleOpenNewBooking = () => {
    setIsBookingModalOpen(true);
  };

  const handleCreateCategoryInline = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const created = await createCategory.mutateAsync({ name: newCategoryName.trim() });
      setFormData((prev) => ({ ...prev, categoryId: created.id }));
      setIsAddingCategory(false);
      setNewCategoryName('');
      addToast('Kategoria dodana', 'success');
    } catch (e) {
      console.error(e);
      addToast(getApiErrorMessage(e, 'Błąd podczas dodawania kategorii'), 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalUnit = customUnit.trim() || formData.unit;
    const dto: InventoryCreateDto = {
      name: formData.name,
      categoryId: formData.categoryId,
      unit: finalUnit,
      stock: formData.stock,
      minStock: formData.minStock || null,
      description: formData.description || null,
    };
    try {
      if (editingId) {
        await updateItem.mutateAsync({ id: editingId, dto });
      } else {
        await createItem.mutateAsync(dto);
      }
      setIsModalOpen(false);
      addToast('Zapisano produkt w magazynie', 'success');
    } catch (err) {
      console.error('Failed to save inventory item:', err);
      addToast(getApiErrorMessage(err, 'Wystąpił błąd podczas zapisywania produktu'), 'error');
    }
  };

  const handleQuickStockSave = async (item: (typeof items)[0]) => {
    const newStock = parseInt(quickEditStockValue);
    if (isNaN(newStock)) return;
    const foundCategory = categories.find((c) => c.name === item.categoryName);
    const dto: InventoryCreateDto = {
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edycja Produktu' : 'Nowy Produkt'}
      >
        <form className="space-y-8" onSubmit={handleSave}>
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-green-light uppercase tracking-widest ml-4">
              Pełna Nazwa
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-6 py-5 bg-slate-50 border-none rounded-xl outline-none font-bold text-base shadow-inner focus:ring-4 focus:ring-cream-warm/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-green-light uppercase tracking-widest ml-4">Opis</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl outline-none font-bold text-sm"
              placeholder="Opcjonalny opis..."
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between ml-4 pr-1">
              <label className="text-[10px] font-semibold text-green-light uppercase tracking-widest">Kategoria</label>
            </div>
            {isAddingCategory ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nazwa nowej kategorii..."
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateCategoryInline())}
                  className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-xl outline-none font-bold text-sm shadow-inner"
                />
                <button
                  type="button"
                  onClick={handleCreateCategoryInline}
                  disabled={!newCategoryName.trim() || createCategory.isPending}
                  className="p-4 bg-green-deep text-cream-warm rounded-xl hover:bg-opacity-90 disabled:opacity-50 transition-all"
                >
                  <Check size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategoryName('');
                  }}
                  className="p-4 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div
                  className="relative flex-1"
                  tabIndex={0}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setIsFormCategoryDropdownOpen(false);
                    }
                  }}
                >
                  <div
                    onClick={() => setIsFormCategoryDropdownOpen((p) => !p)}
                    className={`w-full px-6 py-5 bg-slate-50 border-2 rounded-xl outline-none transition-all font-bold text-sm cursor-pointer flex items-center h-full hover:border-cream-warm/40 ${isFormCategoryDropdownOpen ? 'border-cream-warm/60 ring-4 ring-cream-warm/20 text-green-deep' : 'border-transparent text-slate-700'}`}
                  >
                    <span className="truncate flex-1 select-none">
                      {formData.categoryId
                        ? categories.find((c) => c.id === formData.categoryId)?.name ||
                          'Wybierz kategorię (opcjonalnie)'
                        : 'Wybierz kategorię (opcjonalnie)'}
                    </span>
                    <div
                      className={`pointer-events-none transition-colors ml-3 ${isFormCategoryDropdownOpen ? 'text-green-deep' : 'text-slate-400'}`}
                    >
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-300 ${isFormCategoryDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>

                  <div
                    className={`absolute z-10 top-[calc(100%+0.5rem)] left-0 right-0 bg-white rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden py-2 transform origin-top transition-all duration-200 ease-out ${isFormCategoryDropdownOpen ? 'opacity-100 scale-y-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'}`}
                  >
                    <div className="max-h-[250px] overflow-y-auto w-full custom-scrollbar">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, categoryId: null });
                          setIsFormCategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-6 py-3.5 text-sm font-bold transition-all border-b border-slate-50 block select-none ${!formData.categoryId ? 'bg-amber/10 text-amber' : 'text-slate-500 hover:bg-slate-50 hover:text-green-deep'}`}
                      >
                        Wybierz kategorię (opcjonalnie)
                      </button>
                      {categories.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, categoryId: c.id });
                            setIsFormCategoryDropdownOpen(false);
                          }}
                          className={`w-full text-left px-6 py-3.5 text-sm font-bold transition-all block select-none ${formData.categoryId === c.id ? 'bg-amber/10 text-amber' : 'text-slate-500 hover:bg-slate-50 hover:text-green-deep'}`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(true)}
                  className="px-5 bg-slate-50 text-green-deep font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 border border-slate-100 shadow-sm"
                >
                  <Plus size={18} /> Nowa
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4">
                Stan Aktualny
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="w-full px-6 py-5 bg-green-deep text-cream-warm border-none rounded-xl font-extrabold text-2xl font-mono shadow-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-red-400 uppercase tracking-widest ml-4">
                Stan Minimalny
              </label>
              <input
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                className="w-full px-6 py-5 bg-red-50 text-red-500 border-none rounded-xl font-extrabold text-2xl font-mono"
              />
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-semibold text-green-light uppercase tracking-widest ml-4">
              Jednostka Miar
            </label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_UNITS.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, unit: u });
                    setCustomUnit('');
                  }}
                  className={`px-5 py-3 rounded-xl text-[10px] font-semibold uppercase tracking-widest border-2 transition-all ${formData.unit === u && !customUnit ? 'bg-green-deep text-cream-warm border-green-deep' : 'bg-slate-50 text-slate-400 border-transparent'}`}
                >
                  {u}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={customUnit}
              onChange={(e) => setCustomUnit(e.target.value)}
              placeholder="Własna jednostka..."
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl outline-none font-bold text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={createItem.isPending || updateItem.isPending}
            className="w-full py-6 bg-green-deep text-cream-warm rounded-xl font-semibold text-[11px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
          >
            Zapisz
          </button>
        </form>
      </Modal>

      <CreateBookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />

      <CreateClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} />
    </div>
  );
};

export default InventoryView;
