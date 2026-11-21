import { useMemo, useState } from 'react';
import { Edit2, Phone, Search } from 'lucide-react';
import { MOCK_CLIENTS } from '../../model/demoData';
import { DemoHeader } from './DemoHeader';

const TH = 'px-6 py-5 text-[10px] font-bold text-green-deep/60 uppercase tracking-[0.2em]';

const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

/** The demo's client list (CRM) with a search. */
export function ClientsView() {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return MOCK_CLIENTS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email ?? '').toLowerCase().includes(q) ||
        c.vehicles.some((v) => v.licensePlate.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <div className="space-y-8 pb-20">
      <DemoHeader title="Klienci" subtitle="CRM • Zarządzanie Relacjami" />

      <div className="relative group">
        <Search
          size={20}
          strokeWidth={2.5}
          className="absolute left-6 top-1/2 -translate-y-1/2 text-green-deep/30 group-focus-within:text-green-light transition-colors"
        />
        <input
          type="text"
          aria-label="Szukaj klienta"
          placeholder="Szukaj klienta, tablicy, modelu..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-14 pr-6 py-5 rounded-[2rem] font-semibold text-base text-green-deep outline-none transition-all bg-white border border-green-deep/7 shadow-sm focus:border-green-light/30"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-cream/30">
                <th className={`${TH} w-[25%]`}>Klient</th>
                <th className={`${TH} w-[20%]`}>Kontakt</th>
                <th className={`${TH} w-[40%]`}>Pojazdy we flocie</th>
                <th className={`${TH} text-right w-[15%]`}>Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 text-sm">
              {filtered.map((client) => (
                <tr key={client.id} className="group hover:bg-green-deep/[0.02] cursor-pointer transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm text-cream shrink-0 shadow-sm"
                        style={{ background: 'linear-gradient(135deg, #1a2e1e 0%, #2a4a30 100%)' }}
                      >
                        {initialsOf(client.name)}
                      </div>
                      <div>
                        <p className="font-bold text-green-deep text-base truncate max-w-[200px]">{client.name}</p>
                        {client.nip && (
                          <p className="text-[10px] font-semibold text-green-deep/40 mt-1 uppercase tracking-wider">
                            NIP: {client.nip}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1.5">
                      <p className="font-bold text-green-deep/80 text-[13px]">{client.phone}</p>
                      {client.email && (
                        <p className="font-semibold text-green-deep/50 text-[11px] max-w-[180px] truncate">
                          {client.email}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {client.vehicles.slice(0, 2).map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center bg-slate-50 border border-slate-100 rounded-xl pr-1.5 py-1 pl-3 gap-3 shadow-sm"
                        >
                          <span className="font-bold text-green-deep text-[11px] max-w-[100px] truncate">
                            {v.brand} {v.model}
                          </span>
                          <span className="bg-green-deep text-cream px-2 py-1 rounded-md font-mono text-[10px] font-bold tracking-widest">
                            {v.licensePlate}
                          </span>
                        </div>
                      ))}
                      {client.vehicles.length > 2 && (
                        <div className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-green-deep/60 text-[10px] tracking-widest uppercase">
                          + {client.vehicles.length - 2}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-deep/5 text-green-deep hover:bg-green-deep hover:text-cream transition-all shadow-sm cursor-pointer">
                        <Phone size={14} />
                      </div>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-green-deep border border-slate-100 transition-all shadow-sm cursor-pointer">
                        <Edit2 size={14} />
                      </div>
                    </div>
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
