import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Package } from 'lucide-react';
import { InventoryCreateDto } from '../../types';
import { useInventory, useCreateInventoryItem, useUpdateInventoryItem } from '../../hooks';
import GlobalHeader from '../../components/GlobalHeader';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

const DEFAULT_UNITS = ['ml', 'L', 'szt', 'm²', 'kg'];

// ─── Form ────────────────────────────────────────────────────────────────────
interface ItemFormData {
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  description: string;
}

const defaultForm = (): ItemFormData => ({
  name: '', unit: 'ml', stock: 0, minStock: 0, description: '',
});

// ─── View ─────────────────────────────────────────────────────────────────────
const InventoryView: React.FC<{ onOpenMenu?: () => void }> = ({ onOpenMenu }) => {
  const { data: items = [], isLoading } = useInventory();
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ItemFormData>(defaultForm());
  const [customUnit, setCustomUnit] = useState('');

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
      setFormData({ name: item.name, unit: item.unit, stock: item.stock, minStock: item.minStock ?? 0, description: item.description ?? '' });
      setCustomUnit(DEFAULT_UNITS.includes(item.unit) ? '' : item.unit);
    } else {
      setEditingId(null);
      setFormData(defaultForm());
      setCustomUnit('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalUnit = customUnit.trim() || formData.unit;
    const dto: InventoryCreateDto = {
      name: formData.name,
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
    } catch (err) {
      console.error('Failed to save inventory item:', err);
    }
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="space-y-6 sm:space-y-10">
      <GlobalHeader title="Magazyn" subtitle="Baza Produktów Studio OS" onOpenMenu={onOpenMenu} />

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#5A8A7A] transition-colors" />
          <input
            type="text"
            placeholder="Szukaj produktu..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] outline-none shadow-sm focus:ring-8 focus:ring-[#F7E7CE]/20 focus:border-[#F7E7CE]/40 transition-all font-bold text-sm sm:text-base"
          />
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#102C26] text-[#F7E7CE] px-10 py-5 rounded-[2rem] font-semibold text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
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
                      <div className="w-12 h-12 bg-[#f8f9fa] rounded-xl flex items-center justify-center text-slate-300 group-hover:text-[#5A8A7A] transition-colors">
                        <Package size={20} />
                      </div>
                      <span className="font-bold text-[#102C26] text-base lg:text-lg tracking-tighter">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="px-4 py-1.5 bg-white border border-slate-100 text-slate-500 rounded-lg text-[9px] lg:text-[10px] font-semibold uppercase tracking-widest">
                      {item.categoryName || '—'}
                    </span>
                  </td>
                  <td className={`px-10 py-8 text-right font-mono text-xl lg:text-2xl font-extrabold ${item.minStock !== null && item.stock < item.minStock ? 'text-red-500' : 'text-[#102C26]'}`}>
                    {item.stock}
                    <span className="text-[10px] ml-1 opacity-40 uppercase">{item.unit}</span>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-[#102C26] hover:text-[#F7E7CE] transition-all active:scale-90"
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
            <label className="text-[10px] font-semibold text-[#5A8A7A] uppercase tracking-widest ml-4">Pełna Nazwa</label>
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required
              className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] outline-none font-bold text-base shadow-inner focus:ring-4 focus:ring-[#F7E7CE]/20" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-[#5A8A7A] uppercase tracking-widest ml-4">Opis</label>
            <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-[1.5rem] outline-none font-bold text-sm" placeholder="Opcjonalny opis..." />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4">Stan Aktualny</label>
              <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="w-full px-6 py-5 bg-[#102C26] text-[#F7E7CE] border-none rounded-[1.5rem] font-extrabold text-2xl font-mono shadow-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-red-400 uppercase tracking-widest ml-4">Stan Minimalny</label>
              <input type="number" value={formData.minStock} onChange={e => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                className="w-full px-6 py-5 bg-red-50 text-red-500 border-none rounded-[1.5rem] font-extrabold text-2xl font-mono" />
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-semibold text-[#5A8A7A] uppercase tracking-widest ml-4">Jednostka Miar</label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_UNITS.map(u => (
                <button key={u} type="button" onClick={() => { setFormData({ ...formData, unit: u }); setCustomUnit(''); }}
                  className={`px-5 py-3 rounded-[1.2rem] text-[10px] font-semibold uppercase tracking-widest border-2 transition-all ${formData.unit === u && !customUnit ? 'bg-[#102C26] text-[#F7E7CE] border-[#102C26]' : 'bg-slate-50 text-slate-400 border-transparent'}`}>
                  {u}
                </button>
              ))}
            </div>
            <input type="text" value={customUnit} onChange={e => setCustomUnit(e.target.value)}
              placeholder="Własna jednostka..." className="w-full px-6 py-4 bg-slate-50 border-none rounded-[1.2rem] outline-none font-bold text-sm" />
          </div>
          <button type="submit" disabled={createItem.isPending || updateItem.isPending}
            className="w-full py-6 bg-[#102C26] text-[#F7E7CE] rounded-[1.5rem] font-semibold text-[11px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60">
            Zapisz
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryView;
