import React, { useState } from 'react';
import { Edit2, Package, Check, X } from 'lucide-react';
import Skeleton from '@/shared/ui/Skeleton';
import EmptyState from '@/shared/ui/EmptyState';
import { useToast } from '@/shared/ui/useToast';
import { getApiErrorMessage } from '@/shared/lib/errorHandler';
import { useUpdateInventoryItem } from '@/features/inventory/api/inventory';
import { useCategories } from '@/features/inventory/api/categories';
import { type InventoryItem, type InventoryItemInput } from '@/features/inventory/model/types';

interface InventoryTableProps {
  items: InventoryItem[];
  isLoading: boolean;
  /** Fades the list while a new search is pending. */
  dimmed: boolean;
  onEdit: (item: InventoryItem) => void;
}

/** Stock items with low-stock highlighting and an inline stock editor. */
const InventoryTable: React.FC<InventoryTableProps> = ({ items, isLoading, dimmed, onEdit }) => {
  const { addToast } = useToast();
  const { data: categories = [] } = useCategories();
  const updateItem = useUpdateInventoryItem();
  const [quickEditStockId, setQuickEditStockId] = useState<string | null>(null);
  const [quickEditStockValue, setQuickEditStockValue] = useState('');

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

  return (
    <div
      className={`bg-white rounded-2xl lg:rounded-2xl shadow-xs border border-slate-100 overflow-hidden transition-opacity duration-200 ${dimmed ? 'opacity-70' : 'opacity-100'}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="bg-[#fcfcfc] border-b border-slate-100">
              <th className="px-10 py-8 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Produkt</th>
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
            {isLoading ? (
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
                {items.map((item) => (
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
                            className="w-24 px-3 py-2 text-right bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-4 focus:ring-cream-warm/50 font-bold text-lg text-green-deep"
                          />
                          <button
                            onClick={() => handleQuickStockSave(item)}
                            disabled={updateItem.isPending}
                            className="p-2 bg-green-deep text-cream-warm rounded-lg hover:bg-green-deep/90 disabled:opacity-50 transition-all"
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
                        onClick={() => onEdit(item)}
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
        {items.length === 0 && <EmptyState message="Brak produktów w magazynie" icon={Package} />}
      </div>
    </div>
  );
};

export default InventoryTable;
