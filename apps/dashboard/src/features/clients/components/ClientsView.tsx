import React, { useState, useMemo } from 'react';

import { Search, Trash2 } from 'lucide-react';
import GlobalHeader from '@/shared/ui/GlobalHeader';
import Modal from '@/shared/ui/Modal';

import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import CreateClientModal from '@/features/clients/components/CreateClientModal';
import { CreateBookingModal } from '@/features/bookings';
import VehicleModal from '@/features/clients/components/VehicleModal';
import type { Client } from '@/features/clients/model/types';
import { useClients, useDeleteVehicle } from '@/features/clients/api/clients';

import { useToast } from '@/shared/ui/useToast';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import ClientDetailsModal from '@/features/clients/components/ClientDetailsModal';
import ClientsTable from '@/features/clients/components/ClientsTable';
import { filterClients } from '@/features/clients/model/filterClients';

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

  const filteredClients = useMemo(() => filterClients(clients, debouncedSearchQuery), [debouncedSearchQuery, clients]);

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

      <ClientsTable
        clients={filteredClients}
        isLoading={isLoading}
        dimmed={searchQuery !== debouncedSearchQuery}
        onOpen={setViewingClientDetail}
        onEdit={setSelectedClientForDetails}
      />

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
