import React from 'react';
import { Phone, Search, Car as CarIcon, Plus, Edit2, Trash2 } from 'lucide-react';
import { Modal } from '@detaileed/ui';
import type { Client } from '@/features/clients/model/types';

interface ClientDetailsModalProps {
  /** The client to show; null closes the modal. */
  client: Client | null;
  onClose: () => void;
  onEditClient: (client: Client) => void;
  onAddVehicle: () => void;
  onEditVehicle: (vehicleId: string) => void;
  onDeleteVehicle: (vehicleId: string) => void;
}

/** Client card: contact details and vehicles, with edit/add/delete actions. */
const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({
  client,
  onClose,
  onEditClient,
  onAddVehicle,
  onEditVehicle,
  onDeleteVehicle,
}) => (
  <Modal isOpen={client !== null} onClose={onClose} title="Karta Klienta">
    {client && (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6">
        <div className="p-8 bg-green-deep rounded-[2.5rem] border border-white/5 relative overflow-hidden">
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/10 text-cream-warm rounded-4xl flex items-center justify-center font-extrabold text-4xl shadow-xl shrink-0">
                {client.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-cream-warm uppercase tracking-widest mb-1">Klient</p>
                <h3 className="font-extrabold text-white text-3xl tracking-tight truncate">{client.name}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-cream-warm shrink-0">
                  <Phone size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold text-cream-warm uppercase tracking-wider">Telefon</p>
                  <p className="font-semibold text-white truncate">{client.phone || 'Brak'}</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-cream-warm shrink-0">
                  <Search size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold text-cream-warm uppercase tracking-wider">Email</p>
                  <p className="font-semibold text-white truncate">{client.email || 'Brak'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h4 className="text-sm font-bold text-green-deep uppercase tracking-widest">Pojazdy we flocie</h4>
              <div className="px-3 py-1 bg-cream-warm/30 text-green-deep rounded-lg font-bold text-xs">
                {client.vehicles.length}
              </div>
            </div>
            <button
              onClick={onAddVehicle}
              className="px-4 py-2 bg-white border border-slate-200 text-green-deep rounded-xl font-bold text-[10px] uppercase tracking-widest hover:border-green-deep/20 transition-all flex items-center gap-2 self-start sm:self-auto shadow-xs"
            >
              <Plus size={14} /> Dodaj Pojazd
            </button>
          </div>

          <div className="space-y-4">
            {client.vehicles.length > 0 ? (
              client.vehicles.map((v) => (
                <div
                  key={v.id}
                  className="bg-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between shadow-xs border border-slate-100 gap-4 group hover:border-cream-warm transition-all"
                >
                  <div className="flex items-center gap-5 min-w-0">
                    <div className="w-12 h-12 bg-slate-50 group-hover:bg-cream-warm/20 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-green-light transition-colors shrink-0">
                      <CarIcon size={24} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-green-deep text-lg block truncate">
                        {v.brand} {v.model}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="bg-green-deep text-cream-warm px-4 py-2.5 rounded-xl font-mono text-sm font-bold text-center shadow-md">
                      {v.licensePlate}
                    </div>
                    <button
                      onClick={() => onEditVehicle(v.id)}
                      className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 rounded-xl hover:text-green-deep hover:bg-cream-warm/20 hover:border-cream-warm/40 transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteVehicle(v.id)}
                      className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 rounded-xl hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-semibold text-sm">Klient nie posiada jeszcze dodanych pojazdów.</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onEditClient(client)}
            className="w-full py-5 bg-white border-2 border-slate-100 text-green-deep rounded-2xl font-bold text-xs uppercase tracking-widest hover:border-green-deep transition-all flex items-center justify-center gap-2"
          >
            <Edit2 size={16} /> Edytuj Klienta
          </button>
          {client.phone ? (
            <a
              href={`tel:${client.phone}`}
              className="w-full py-5 bg-green-deep text-cream-warm rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-[#0a1c18] transition-all"
            >
              <Phone size={16} /> Zadzwoń
            </a>
          ) : (
            <div className="w-full py-5 bg-slate-50 text-slate-300 border border-slate-100 border-dashed rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed">
              <Phone size={16} /> Brak numeru
            </div>
          )}
        </div>
      </div>
    )}
  </Modal>
);

export default ClientDetailsModal;
