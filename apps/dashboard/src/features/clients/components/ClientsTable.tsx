import React from 'react';
import { Phone, Edit2 } from 'lucide-react';
import Skeleton from '@/shared/ui/Skeleton';
import type { Client } from '@/features/clients/model/types';

interface ClientsTableProps {
  clients: Client[];
  isLoading: boolean;
  /** Fades the list while a new search is pending. */
  dimmed: boolean;
  onOpen: (client: Client) => void;
  onEdit: (client: Client) => void;
}

/** Client list with contact details, vehicles and call/edit actions. */
const ClientsTable: React.FC<ClientsTableProps> = ({ clients, isLoading, dimmed, onOpen, onEdit }) => (
  <div
    className={`bg-white rounded-2xl border border-slate-100 overflow-hidden transition-opacity duration-200 ${dimmed ? 'opacity-70' : 'opacity-100'}`}
    style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}
  >
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-100" style={{ backgroundColor: 'rgba(245,240,232,0.3)' }}>
            <th className="px-6 py-5 text-[10px] font-bold text-green-deep/60 uppercase tracking-[0.2em] w-[25%] rounded-tl-2xl">
              Klient
            </th>
            <th className="px-6 py-5 text-[10px] font-bold text-green-deep/60 uppercase tracking-[0.2em] w-[20%]">
              Kontakt
            </th>
            <th className="px-6 py-5 text-[10px] font-bold text-green-deep/60 uppercase tracking-[0.2em] w-[40%]">
              Pojazdy we flocie
            </th>
            <th className="px-6 py-5 text-[10px] font-bold text-green-deep/60 uppercase tracking-[0.2em] text-right w-[15%] rounded-tr-2xl">
              Akcje
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/80 text-sm">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`skel-${i}`}>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <Skeleton width="44px" height="44px" className="rounded-xl shrink-0" />
                    <Skeleton width="120px" height="20px" className="rounded-md" />
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="space-y-2">
                    <Skeleton width="100px" height="14px" className="rounded-md" />
                    <Skeleton width="140px" height="12px" className="rounded-md" />
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex gap-2">
                    <Skeleton width="110px" height="36px" className="rounded-xl" />
                    <Skeleton width="110px" height="36px" className="rounded-xl" />
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <Skeleton width="80px" height="36px" className="rounded-xl ml-auto" />
                </td>
              </tr>
            ))
          ) : clients.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-16 text-center">
                <p className="text-slate-400 font-semibold">Nie znaleziono klientów.</p>
              </td>
            </tr>
          ) : (
            clients.map((client) => (
              <tr
                key={client.id}
                onClick={() => onOpen(client)}
                className="group hover:bg-[#1a2e1e]/2 cursor-pointer transition-colors"
              >
                {/* Klient */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm text-cream-warm shrink-0 shadow-xs transition-transform group-hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #1a2e1e 0%, #2a4a30 100%)' }}
                    >
                      {client.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-green-deep text-base truncate max-w-[200px]">{client.name}</h3>
                      {client.nip && (
                        <p className="text-[10px] font-semibold text-green-deep/40 mt-1 uppercase tracking-wider">
                          NIP: {client.nip}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Kontakt */}
                <td className="px-6 py-4">
                  <div className="space-y-1.5 flex flex-col justify-center">
                    <p className="font-bold text-green-deep/80 text-[13px]">
                      {client.phone || <span className="text-slate-400 font-normal">Brak telefonu</span>}
                    </p>
                    {client.email && (
                      <p className="font-semibold text-green-deep/50 text-[11px] max-w-[180px] truncate">
                        {client.email}
                      </p>
                    )}
                  </div>
                </td>

                {/* Pojazdy */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {client.vehicles.slice(0, 2).map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center bg-slate-50 border border-slate-100 rounded-xl pr-1.5 py-1 pl-3 gap-3 transition-colors group-hover:bg-white group-hover:border-slate-200 shadow-xs break-inside-avoid"
                      >
                        <span className="font-bold text-green-deep text-[11px] max-w-[100px] truncate">
                          {v.brand} {v.model}
                        </span>
                        <span className="bg-[#1a2e1e] text-cream-warm px-2 py-1 rounded-md font-mono text-[10px] font-bold tracking-widest">
                          {v.licensePlate}
                        </span>
                      </div>
                    ))}
                    {client.vehicles.length > 2 && (
                      <div className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-green-deep/60 text-[10px] tracking-widest uppercase items-center flex">
                        + {client.vehicles.length - 2}
                      </div>
                    )}
                    {client.vehicles.length === 0 && (
                      <span className="text-[11px] font-semibold text-slate-400">Brak pojazdów</span>
                    )}
                  </div>
                </td>

                {/* Akcje */}
                <td className="px-6 py-4 text-right">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {client.phone && (
                      <a
                        href={`tel:${client.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-deep/5 text-green-deep hover:bg-green-deep hover:text-cream-warm transition-all group/btn shadow-xs"
                      >
                        <Phone size={14} className="group-hover/btn:scale-110 transition-transform" />
                      </a>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(client);
                      }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-green-deep border border-slate-100 transition-all group/btn shadow-xs"
                    >
                      <Edit2 size={14} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default ClientsTable;
