import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Package, Check, X } from 'lucide-react';
import { InventoryCreateDto } from '../../types';
import { useInventory, useCreateInventoryItem, useUpdateInventoryItem, useCategories, useCreateCategory } from '../../hooks';
import { useToast } from '../../contexts/ToastContext';
import GlobalHeader from '../../components/GlobalHeader';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

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
  name: '', categoryId: null, unit: 'ml', stock: 0, minStock: 0, description: '',
});

// ─── View ─────────────────────────────────────────────────────────────────────
const InventoryView: React.FC<{ onOpenMenu?: () => void }> = ({ onOpenMenu }) => {
  const { addToast } = useToast();
  const { data: items = [], isLoading: isInventoryLoading } = useInventory();
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();
  const createCategory = useCreateCategory();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ItemFormData>(defaultForm());
  const [customUnit, setCustomUnit] = useState('');

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [quickEditStockId, setQuickEditStockId] = useState<string | null>(null);
  const [quickEditStockValue, setQuickEditStockValue] = useState('');

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (i.categoryName || '').toLowerCase().includes(q),
    );
  }, [searchQuery, items]);

  const handleOpenModal = (item?: typeof items[0]) => {
    if (item) {
      setEditingId(item.id);
      const foundCategory = categories.find(c => c.name === item.categoryName);
      setFormData({
        name: item.name,
        categoryId: foundCategory ? foundCategory.id : null,
        unit: item.unit,
        stock: item.stock,
        minStock: item.minStock ?? 0,
        description: item.description ?? ''
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

  const handleCreateCategoryInline = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const created = await createCategory.mutateAsync({ name: newCategoryName.trim() });
      setFormData(prev => ({ ...prev, categoryId: created.id }));
      setIsAddingCategory(false);
      setNewCategoryName('');
      addToast('Kategoria dodana', 'success');
    } catch (e) {
      console.error(e);
      addToast('Błąd podczas dodawania kategorii', 'error');
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
      addToast('Wystąpił błąd podczas zapisywania produktu', 'error');
    }
  };

  const handleQuickStockSave = async (item: typeof items[0]) => {
    const newStock = parseInt(quickEditStockValue);
    if (isNaN(newStock)) return;
    const foundCategory = categories.find(c => c.name === item.categoryName);
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
      addToast('Błąd podczas aktualizacji stanu', 'error');
    }
  };

  if (isInventoryLoading || isCategoriesLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="space-y-6 sm:space-y-10">
      <GlobalHeader 
        title="Magazyn" 
        subtitle="Baza Produktów Studio OS" 
        onOpenMenu={onOpenMenu}
        onAddBooking={() => alert('Moduł tworzenia rezerwacji zostanie dodany globalnie w kolejnym kroku.')}
        onAddClient={() => alert('Moduł szybkiego dodawania klienta zostanie dodany globalnie w kolejnym kroku.')}
      />

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-light transition-colors" />
          <input
            type="text"
            placeholder="Szukaj produktu..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] outline-none shadow-sm focus:ring-8 focus:ring-cream-warm/20 focus:border-cream-warm/40 transition-all font-bold text-sm sm:text-base"
          />
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-green-deep text-cream-warm px-10 py-5 rounded-[2rem] font-semibold text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
        >
          <Plus size={18} /> Dodaj Produkt
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] lg:rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-[#fcfcfc] border-b border-slate-100">
                <th className="px-10 py-8 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Produkt</th>
                <th className="px-10 py-8 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Kategoria</th>
                <th className="px-10 py-8 text-[10px] font-semibold uppercase tracking-widest text-slate-400 text-right">Stan</th>
                <th className="px-10 py-8 text-[10px] font-semibold uppercase tracking-widest text-slate-400 text-center">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#f8f9fa] rounded-xl flex items-center justify-center text-slate-300 group-hover:text-green-light transition-colors">
                        <Package size={20} />
                      </div>
                      <span className="font-bold text-green-deep text-base lg:text-lg tracking-tighter">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="px-4 py-1.5 bg-white border border-slate-100 text-slate-500 rounded-lg text-[9px] lg:text-[10px] font-semibold uppercase tracking-widest">
                      {item.categoryName || '—'}
                    </span>
                  </td>
                  <td className={`px-10 py-8 text-right font-mono text-xl lg:text-2xl font-extrabold ${item.minStock !== null && item.stock < item.minStock ? 'text-red-500' : 'text-green-deep'}`}>
                    {quickEditStockId === item.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          autoFocus
                          value={quickEditStockValue}
                          onChange={e => setQuickEditStockValue(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleQuickStockSave(item)}
                          className="w-24 px-3 py-2 text-right bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-cream-warm/50 font-bold text-lg text-green-deep"
                        />
                        <button onClick={() => handleQuickStockSave(item)} disabled={updateItem.isPending} className="p-2 bg-green-deep text-cream-warm rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-all"><Check size={16} /></button>
                        <button onClick={() => setQuickEditStockId(null)} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-all"><X size={16} /></button>
                      </div>
                    ) : (
                      <div
                        className="group/stock inline-flex items-center justify-end cursor-pointer hover:opacity-80 transition-all relative"
                        onClick={() => { setQuickEditStockId(item.id); setQuickEditStockValue(item.stock.toString()); }}
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
            <label className="text-[10px] font-semibold text-green-light uppercase tracking-widest ml-4">Pełna Nazwa</label>
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required
              className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] outline-none font-bold text-base shadow-inner focus:ring-4 focus:ring-cream-warm/20" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-green-light uppercase tracking-widest ml-4">Opis</label>
            <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-[1.5rem] outline-none font-bold text-sm" placeholder="Opcjonalny opis..." />
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
                  onChange={e => setNewCategoryName(e.target.value)}
                  placeholder="Nazwa nowej kategorii..."
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleCreateCategoryInline())}
                  className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-[1.5rem] outline-none font-bold text-sm shadow-inner"
                />
                <button type="button" onClick={handleCreateCategoryInline} disabled={!newCategoryName.trim() || createCategory.isPending} className="p-4 bg-green-deep text-cream-warm rounded-[1.2rem] hover:bg-opacity-90 disabled:opacity-50 transition-all"><Check size={18} /></button>
                <button type="button" onClick={() => { setIsAddingCategory(false); setNewCategoryName(''); }} className="p-4 bg-slate-100 text-slate-500 rounded-[1.2rem] hover:bg-slate-200 transition-all"><X size={18} /></button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    value={formData.categoryId || ''}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value || null })}
                    className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] outline-none font-bold text-sm appearance-none cursor-pointer pr-10"
                  >
                    <option value="">Wybierz kategorię (opcjonalnie)</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <button type="button" onClick={() => setIsAddingCategory(true)} className="px-5 bg-slate-50 text-green-deep font-bold rounded-[1.5rem] hover:bg-slate-100 transition-all flex items-center justify-center gap-2 border border-slate-100 shadow-sm">
                  <Plus size={18} /> Nowa
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4">Stan Aktualny</label>
              <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="w-full px-6 py-5 bg-green-deep text-cream-warm border-none rounded-[1.5rem] font-extrabold text-2xl font-mono shadow-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-red-400 uppercase tracking-widest ml-4">Stan Minimalny</label>
              <input type="number" value={formData.minStock} onChange={e => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                className="w-full px-6 py-5 bg-red-50 text-red-500 border-none rounded-[1.5rem] font-extrabold text-2xl font-mono" />
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-semibold text-green-light uppercase tracking-widest ml-4">Jednostka Miar</label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_UNITS.map(u => (
                <button key={u} type="button" onClick={() => { setFormData({ ...formData, unit: u }); setCustomUnit(''); }}
                  className={`px-5 py-3 rounded-[1.2rem] text-[10px] font-semibold uppercase tracking-widest border-2 transition-all ${formData.unit === u && !customUnit ? 'bg-green-deep text-cream-warm border-green-deep' : 'bg-slate-50 text-slate-400 border-transparent'}`}>
                  {u}
                </button>
              ))}
            </div>
            <input type="text" value={customUnit} onChange={e => setCustomUnit(e.target.value)}
              placeholder="Własna jednostka..." className="w-full px-6 py-4 bg-slate-50 border-none rounded-[1.2rem] outline-none font-bold text-sm" />
          </div>
          <button type="submit" disabled={createItem.isPending || updateItem.isPending}
            className="w-full py-6 bg-green-deep text-cream-warm rounded-[1.5rem] font-semibold text-[11px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60">
            Zapisz
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryView;
