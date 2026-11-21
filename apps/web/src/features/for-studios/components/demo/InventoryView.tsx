import { useMemo, useState } from 'react';
import { Edit2, Package, Plus, Search } from 'lucide-react';
import { MOCK_INVENTORY } from '../../model/demoData';
import { DemoHeader } from './DemoHeader';

const TH = 'px-10 py-8 text-[10px] font-semibold uppercase tracking-widest text-slate-400';

/** The demo's stock list with a search; items under their minimum are red. */
export function InventoryView() {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return MOCK_INVENTORY.filter((i) => i.name.toLowerCase().includes(q) || i.categoryName.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="space-y-6 sm:space-y-10">
      <DemoHeader title="Magazyn" subtitle="Baza Produktów Studio OS" />

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            aria-label="Szukaj produktu"
            placeholder="Szukaj produktu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-xl outline-none shadow-sm focus:ring-8 focus:ring-cream-warm/20 transition-all font-bold text-sm sm:text-base"
          />
        </div>
        <button
          type="button"
          className="bg-green-deep text-cream px-10 py-5 rounded-xl font-semibold text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all"
        >
          <Plus size={18} /> Dodaj Produkt
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className={TH}>Produkt</th>
                <th className={TH}>Kategoria</th>
                <th className={`${TH} text-right`}>Stan</th>
                <th className={`${TH} text-center`}>Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-green-light transition-colors">
                        <Package size={20} />
                      </div>
                      <span className="font-bold text-green-deep text-base lg:text-lg tracking-tighter">
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="px-4 py-1.5 bg-white border border-slate-100 text-slate-500 rounded-lg text-[10px] font-semibold uppercase tracking-widest">
                      {item.categoryName}
                    </span>
                  </td>
                  <td
                    className={`px-10 py-8 text-right font-mono text-xl lg:text-2xl font-extrabold ${item.stock < item.minStock ? 'text-red-500' : 'text-green-deep'}`}
                  >
                    {item.stock}
                    <span className="text-[10px] ml-1 opacity-40 uppercase">{item.unit}</span>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <button
                      type="button"
                      aria-label="Edytuj"
                      className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-green-deep hover:text-cream transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
