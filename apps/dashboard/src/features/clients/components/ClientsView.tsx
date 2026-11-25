import React, { useState, useMemo } from 'react';

import { GlobalHeader } from '@/shared/ui/GlobalHeader';
import { ConfirmDialog, SearchInput, useToast } from '@detaileed/ui';

import { CreateClientModal } from '@/features/clients/components/CreateClientModal';
import { CreateBookingModal } from '@/features/bookings';
import { VehicleModal } from '@/features/clients/components/VehicleModal';
import type { Client } from '@/features/clients/model/types';
import { useClients, useDeleteVehicle } from '@/features/clients/api/clients';

import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { ClientDetailsModal } from '@/features/clients/components/ClientDetailsModal';
import { ClientsTable } from '@/features/clients/components/ClientsTable';
import { filterClients } from '@/features/clients/model/filterClients';

export const ClientsView: React.FC = () => {
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

  return (
    <div className="space-y-6 pb-20">
      <GlobalHeader
        title="Klienci"
        subtitle="CRM • Zarządzanie relacjami"
        onAddBooking={() => setIsBookingModalOpen(true)}
        onAddClient={() => setIsClientModalOpen(true)}
      />

      <SearchInput
        aria-label="Szukaj klienta"
        placeholder="Szukaj klienta, tablicy, modelu…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onClear={() => setSearchQuery('')}
        wrapperClassName="sm:max-w-sm"
      />

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

      <ConfirmDialog
        open={!!deleteConfirmation}
        onOpenChange={(open) => !open && setDeleteConfirmation(null)}
        tone="danger"
        title="Usunąć pojazd?"
        description="Tej operacji nie można cofnąć, a dane zostaną trwale utracone."
        confirmLabel="Usuń pojazd"
        loading={deleteVehicleMut.isPending}
        onConfirm={executeDeleteVehicle}
      />
    </div>
  );
};
