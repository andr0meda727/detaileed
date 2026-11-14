import React, { useState } from 'react';
import { Plus, Check, X, ChevronDown } from 'lucide-react';
import Modal from '@/shared/ui/Modal';
import { useToast } from '@/shared/ui/ToastContext';
import { getApiErrorMessage } from '@/shared/lib/errorHandler';
import { useCreateInventoryItem, useUpdateInventoryItem } from '@/features/inventory/api/inventory';
import { useCategories, useCreateCategory } from '@/features/inventory/api/categories';
import type { InventoryCategory, InventoryItem, InventoryItemInput } from '@/features/inventory/model/types';

const DEFAULT_UNITS = ['ml', 'L', 'szt', 'm²', 'kg'];

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

function formFor(item: InventoryItem | null, categories: InventoryCategory[]): ItemFormData {
  if (!item) return defaultForm();
  return {
    name: item.name,
    categoryId: categories.find((c) => c.name === item.categoryName)?.id ?? null,
    unit: item.unit,
    stock: item.stock,
    minStock: item.minStock ?? 0,
    description: item.description ?? '',
  };
}

interface InventoryItemModalProps {
  isOpen: boolean;
  /** The item to edit, or null to add a new one. Remount (change `key`) to reset the form. */
  item: InventoryItem | null;
  onClose: () => void;
}

/** Add/edit form for a stock item, with an inline "new category". */
const InventoryItemModal: React.FC<InventoryItemModalProps> = ({ isOpen, item, onClose }) => {
  const { addToast } = useToast();
  const { data: categories = [] } = useCategories();
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();
  const createCategory = useCreateCategory();
  const editingId = item?.id ?? null;

  const [formData, setFormData] = useState<ItemFormData>(() => formFor(item, categories));
  const [customUnit, setCustomUnit] = useState(item && !DEFAULT_UNITS.includes(item.unit) ? item.unit : '');
  const [isFormCategoryDropdownOpen, setIsFormCategoryDropdownOpen] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

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
    const dto: InventoryItemInput = {
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
      onClose();
      addToast('Zapisano produkt w magazynie', 'success');
    } catch (err) {
      console.error('Failed to save inventory item:', err);
      addToast(getApiErrorMessage(err, 'Wystąpił błąd podczas zapisywania produktu'), 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Edycja Produktu' : 'Nowy Produkt'}>
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
                      ? categories.find((c) => c.id === formData.categoryId)?.name || 'Wybierz kategorię (opcjonalnie)'
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
  );
};

export default InventoryItemModal;
