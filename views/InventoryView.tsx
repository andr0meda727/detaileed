
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Search, Edit2, Package, X, Save, Layers, Check } from 'lucide-react';
import { InventoryResponseDto, InventoryCreateDto } from '../types';
import { getInventory, createInventoryItem, updateInventoryItem } from '../services/inventoryService';
import GlobalHeader from '../components/GlobalHeader';

const DEFAULT_UNITS = ['ml', 'L', 'szt', 'm²', 'kg'];

const Modal = ({ isOpen, onClose, title, children }: React.PropsWithChildren<{ isOpen: boolean, onClose: () => void, title: string }>) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-[#102C26]/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[95vh]">
        <div className="p-6 sm:p-10 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-[1000] text-[#102C26] tracking-tighter italic leading-none">{title}</h3>
          <button onClick={onClose} className="p-2 sm:p-3 bg-slate-50 text-slate-400 rounded-xl sm:rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"><X size={18} /></button>
        </div>
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 custom-scrollbar">{children}</div>
      </div>
    </div>,
    document.body
  );
};

const InventoryView: React.FC<{ onOpenMenu?: () => void }> = ({ onOpenMenu }) => {
  const [items, setItems] = useState<InventoryResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryResponseDto | null>(null);
  const [formData, setFormData] = useState<{ name: string; unit: string; stock: number; minStock: number; description: string }>({ name: '', unit: 'ml', stock: 0, minStock: 0, description: '' });
  const [customUnit, setCustomUnit] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const iPromise = getInventory(undefined, (c) => { setItems(c); setLoading(false); });
      setItems(await iPromise);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return items.filter(i => i.name.toLowerCase().includes(q) || (i.categoryName || '').toLowerCase().includes(q));
  }, [searchQuery, items]);

  const handleOpenModal = (item?: InventoryResponseDto) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, unit: item.unit, stock: item.stock, minStock: item.minStock || 0, description: item.description || '' });
      setCustomUnit(DEFAULT_UNITS.includes(item.unit) ? '' : item.unit);
    } else {
      setEditingItem(null);
      setFormData({ name: '', unit: 'ml', stock: 0, minStock: 0, description: '' });
      setCustomUnit('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalUnit = customUnit.trim() || formData.unit;
    const dto: InventoryCreateDto = { name: formData.name, unit: finalUnit, stock: formData.stock, minStock: formData.minStock || null, description: formData.description || null };
    try {
      if (editingItem) { await updateInventoryItem(editingItem.id, dto); }
      else { await createInventoryItem(dto); }
      setIsModalOpen(false);
      fetchData();
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-[#102C26] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6 sm:space-y-10">
      <GlobalHeader title="Magazyn" subtitle="Baza Produktów Studio OS" onOpenMenu={onOpenMenu} />

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#5A8A7A] transition-colors" />
          <input type="text" placeholder="Szukaj produktu..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] outline-none shadow-sm focus:ring-8 focus:ring-[#F7E7CE]/20 focus:border-[#F7E7CE]/40 transition-all font-bold text-sm sm:text-base" />
        </div>
        <button onClick={() => handleOpenModal()} className="bg-[#102C26] text-[#F7E7CE] px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"><Plus size={18} /> Dodaj Produkt</button>
      </div>

      <div className="bg-white rounded-[2.5rem] lg:rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-[#fcfcfc] border-b border-slate-100">
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Produkt</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Kategoria</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Stan Aktualny</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#f8f9fa] rounded-xl flex items-center justify-center text-slate-300 group-hover:text-[#5A8A7A] transition-colors"><Package size={20} /></div>
                      <span className="font-[900] text-[#102C26] italic text-base lg:text-lg tracking-tighter">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8"><span className="px-4 py-1.5 bg-white border border-slate-100 text-slate-500 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest">{item.categoryName || '—'}</span></td>
                  <td className={`px-10 py-8 text-right font-mono text-xl lg:text-2xl font-[1000] ${item.minStock !== null && item.stock < item.minStock ? 'text-red-500' : 'text-[#102C26]'}`}>{item.stock}<span className="text-[10px] ml-1 opacity-40 uppercase">{item.unit}</span></td>
                  <td className="px-10 py-8 text-center"><button onClick={() => handleOpenModal(item)} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-[#102C26] hover:text-[#F7E7CE] transition-all active:scale-90"><Edit2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredItems.length === 0 && <div className="p-16 text-center"><p className="text-sm text-slate-400">Brak produktów w magazynie</p></div>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edycja Produktu' : 'Nowy Produkt'}>
        <form className="space-y-8" onSubmit={handleSave}>
          <div className="space-y-2"><label className="text-[10px] font-black text-[#5A8A7A] uppercase tracking-widest ml-4">Pełna Nazwa</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] outline-none font-bold text-base shadow-inner focus:ring-4 focus:ring-[#F7E7CE]/20" /></div>
          <div className="space-y-2"><label className="text-[10px] font-black text-[#5A8A7A] uppercase tracking-widest ml-4">Opis</label><input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-none rounded-[1.5rem] outline-none font-bold text-sm" placeholder="Opcjonalny opis..." /></div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Stan Aktualny</label><input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} className="w-full px-6 py-5 bg-[#102C26] text-[#F7E7CE] border-none rounded-[1.5rem] font-[1000] text-2xl font-mono shadow-xl" /></div>
            <div className="space-y-2"><label className="text-[10px] font-black text-red-400 uppercase tracking-widest ml-4">Stan Minimalny</label><input type="number" value={formData.minStock} onChange={e => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })} className="w-full px-6 py-5 bg-red-50 text-red-500 border-none rounded-[1.5rem] font-[1000] text-2xl font-mono" /></div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-[#5A8A7A] uppercase tracking-widest ml-4">Jednostka Miar</label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_UNITS.map(u => (<button key={u} type="button" onClick={() => { setFormData({ ...formData, unit: u }); setCustomUnit(''); }} className={`px-5 py-3 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest border-2 transition-all ${formData.unit === u && !customUnit ? 'bg-[#102C26] text-[#F7E7CE] border-[#102C26]' : 'bg-slate-50 text-slate-400 border-transparent'}`}>{u}</button>))}
            </div>
            <input type="text" value={customUnit} onChange={e => setCustomUnit(e.target.value)} placeholder="Własna jednostka..." className="w-full px-6 py-4 bg-slate-50 border-none rounded-[1.2rem] outline-none font-bold text-sm" />
          </div>
          <button type="submit" className="w-full py-6 bg-[#102C26] text-[#F7E7CE] rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"><Save size={18} /> Zapisz</button>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryView;
