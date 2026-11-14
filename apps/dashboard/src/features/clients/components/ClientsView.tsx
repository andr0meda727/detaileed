import React, { useState, useMemo } from 'react';

import { Phone, Search, Edit2, Trash2 } from 'lucide-react';
import GlobalHeader from '@/shared/ui/GlobalHeader';
import Modal from '@/shared/ui/Modal';
import Skeleton from '@/shared/ui/Skeleton';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import CreateClientModal from '@/features/clients/components/CreateClientModal';
import { CreateBookingModal } from '@/features/bookings';
import VehicleModal from '@/features/clients/components/VehicleModal';
import type { Client } from '@/features/clients/model/types';
import { useClients, useDeleteVehicle } from '@/features/clients/api/clients';

import { useToast } from '@/shared/ui/ToastContext';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import ClientDetailsModal from '@/features/clients/components/ClientDetailsModal';

const ClientsView: React.FC = () => {
  const { addToast } = useToast();
  const { data: clients = [], isLoading, refetch: refetchClients } = useClients();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<Client | null>(null);
  const [viewingClientDetail, setViewingClientDetail] = useState<Client | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  const debouncedSearchQuery = useDebouncedValue(searchQuery);

  const deleteVehicleMut = useDeleteVehicle();

  const activeClientDetail = useMemo(() => {
    return viewingClientDetail ? clients.find((c) => c.id === viewingClientDetail.id) || viewingClientDetail : null;
  }, [viewingClientDetail, clients]);

  const filteredClients = useMemo(() => {
    const q = debouncedSearchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        c.vehicles.some(
          (v) =>
            v.licensePlate.toLowerCase().includes(q) ||
            (v.brand || '').toLowerCase().includes(q) ||
            (v.model || '').toLowerCase().includes(q),
        ),
    );
  }, [debouncedSearchQuery, clients]);

  const executeDeleteVehicle = async () => {
    if (!deleteConfirmation) return;
    try {
      await deleteVehicleMut.mutateAsync(deleteConfirmation);
      addToast('Pojazd został usunięty.', 'success');
    } catch (e) {
      console.error(e);
      addToast('Błąd podczas usuwania pojazdu.', 'error');
    } finally {
      setDeleteConfirmation(null);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 animate-slide-up pb-20">
      <GlobalHeader
        title="Klienci"
        subtitle="CRM • Zarządzanie Relacjami"
        onAddBooking={() => setIsBookingModalOpen(true)}
        onAddClient={() => setIsClientModalOpen(true)}
      />

      {/* Search */}
      <div className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-green-deep/30 group-focus-within:text-green-light transition-colors">
          <Search size={20} strokeWidth={2.5} />
        </div>
        <input
          type="text"
          placeholder="Szukaj klienta, tablicy, modelu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-14 pr-6 py-5 rounded-[2rem] font-semibold text-base text-green-deep outline-none transition-all focus:border-[rgba(61,107,70,0.3)] focus:shadow-[0_0_0_4px_rgba(61,107,70,0.08),0_4px_16px_-4px_rgba(0,0,0,0.04)]"
          style={{
            background: 'white',
            border: '1px solid rgba(26,46,30,0.07)',
            boxShadow: '0 4px 16px -4px rgba(0,0,0,0.04)',
          }}
        />
      </div>

      <div
        className={`bg-white rounded-2xl border border-slate-100 overflow-hidden transition-opacity duration-200 ${searchQuery !== debouncedSearchQuery ? 'opacity-70' : 'opacity-100'}`}
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
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <p className="text-slate-400 font-semibold">Nie znaleziono klientów.</p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => setViewingClientDetail(client)}
                    className="group hover:bg-[#1a2e1e]/[0.02] cursor-pointer transition-colors"
                  >
                    {/* Klient */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm text-cream-warm shrink-0 shadow-sm transition-transform group-hover:scale-105"
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
                            className="flex items-center bg-slate-50 border border-slate-100 rounded-xl pr-1.5 py-1 pl-3 gap-3 transition-colors group-hover:bg-white group-hover:border-slate-200 shadow-sm break-inside-avoid"
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
                            className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-deep/5 text-green-deep hover:bg-green-deep hover:text-cream-warm transition-all group/btn shadow-sm"
                          >
                            <Phone size={14} className="group-hover/btn:scale-110 transition-transform" />
                          </a>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClientForDetails(client);
                          }}
                          className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-green-deep border border-slate-100 transition-all group/btn shadow-sm"
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

      <CreateClientModal
        isOpen={!!selectedClientForDetails}
        onClose={() => setSelectedClientForDetails(null)}
        clientToEdit={selectedClientForDetails}
      />

      <CreateClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} />

      <CreateBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          if (refetchClients) refetchClients();
        }}
      />
      <ClientDetailsModal
        client={activeClientDetail}
        onClose={() => setViewingClientDetail(null)}
        onEditClient={(client) => {
          setViewingClientDetail(null);
          setSelectedClientForDetails(client);
        }}
        onAddVehicle={() => {
          setEditingVehicleId(null);
          setIsVehicleModalOpen(true);
        }}
        onEditVehicle={(vehicleId) => {
          setEditingVehicleId(vehicleId);
          setIsVehicleModalOpen(true);
        }}
        onDeleteVehicle={setDeleteConfirmation}
      />

      {activeClientDetail && (
        <VehicleModal
          isOpen={isVehicleModalOpen}
          onClose={() => setIsVehicleModalOpen(false)}
          clientId={activeClientDetail.id}
          vehicleToEdit={activeClientDetail.vehicles.find((v) => v.id === editingVehicleId)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirmation} onClose={() => setDeleteConfirmation(null)} title="Usuń pojazd">
        <div className="text-center space-y-6 pb-4">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={32} />
          </div>
          <p className="text-slate-600 font-medium">
            Czy na pewno chcesz usunąć ten pojazd? Tej operacji nie można cofnąć, a dane zostaną trwale utracone.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <button
              onClick={() => setDeleteConfirmation(null)}
              className="py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all"
            >
              Anuluj
            </button>
            <button
              onClick={executeDeleteVehicle}
              className="py-4 bg-red-500 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all"
            >
              Usuń pojazd
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default ClientsView;
