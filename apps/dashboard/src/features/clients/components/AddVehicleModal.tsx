import React, { useState } from 'react';
import { Search, User, Save } from 'lucide-react';
import Modal from '@/shared/ui/Modal';
import { useToast } from '@/shared/ui/ToastContext';
import { getApiErrorMessage } from '@/shared/lib/errorHandler';
import { useClients, useCreateClient, useCreateVehicle } from '@/features/clients/api/clients';
import { useClientSearch } from '@/features/clients/hooks/useClientVehicleSearch';
import type { Client } from '@/features/clients/model/types';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Adds a vehicle to an existing client (searched by name, phone or email), or creates a new client
 * together with the vehicle. Remount it (change `key`) to start with an empty form.
 */
const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useToast();
  const { data: clients = [] } = useClients();
  const createClient = useCreateClient();
  const createVehicle = useCreateVehicle();
  const [vehicleClientSearch, setVehicleClientSearch] = useState('');
  const [selectedClientForVehicle, setSelectedClientForVehicle] = useState<Client | null>(null);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newBookingClientNip, setNewBookingClientNip] = useState('');
  const [newVehicleBrand, setNewVehicleBrand] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  const [vehicleClientMode, setVehicleClientMode] = useState<'existing' | 'new'>('existing');
  const filteredClientsOnlyResults = useClientSearch(clients, vehicleClientSearch);

  const handleAddNewVehicleToExisting = async () => {
    if (!newVehiclePlate) {
      addToast('Numer Rejestracyjny jest wymagany.', 'error');
      return;
    }
    if (!selectedClientForVehicle) {
      addToast('Wybierz istniejącego klienta lub dodaj nowego.', 'error');
      return;
    }
    try {
      await createVehicle.mutateAsync({
        clientId: selectedClientForVehicle.id,
        licensePlate: newVehiclePlate,
        brand: newVehicleBrand || null,
        model: newVehicleModel || null,
      });
      addToast('Nowy pojazd został pomyślnie dodany do klienta.', 'success');

      onClose();
    } catch (err) {
      console.error('Failed to create vehicle:', err);
      addToast(getApiErrorMessage(err, 'Wystąpił błąd podczas dodawania pojazdu.'), 'error');
    }
  };

  const handleCreateClientWithVehicle = async () => {
    if (!newClientName || !newClientPhone || !newVehiclePlate) {
      addToast('Wypełnij wymagane pola: Imię i Nazwisko, Telefon oraz Numer Rejestracyjny.', 'error');
      return;
    }
    try {
      await createClient.mutateAsync({
        name: newClientName,
        phone: newClientPhone,
        email: newClientEmail || null,
        nip: newBookingClientNip || null,
        vehicle: {
          licensePlate: newVehiclePlate,
          brand: newVehicleBrand || null,
          model: newVehicleModel || null,
        },
      });
      addToast('Dodano nowego klienta wraz z pojazdem.', 'success');

      // Close modal and reset state as the goal (adding a vehicle) is achieved by creating the new client & vehicle
      onClose();
    } catch (err) {
      console.error('Failed to create client with vehicle:', err);
      addToast(getApiErrorMessage(err, 'Wystąpił błąd podczas tworzenia klienta.'), 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dodaj Nowy Pojazd">
      <div className="space-y-8 pb-10">
        <div className="space-y-4">
          <div className="flex items-center justify-between ml-4 mb-2">
            <label className="text-[10px] font-semibold text-green-light uppercase tracking-widest">Właściciel</label>
            <div className="flex bg-slate-50 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setVehicleClientMode('existing')}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-semibold uppercase tracking-widest transition-all ${vehicleClientMode === 'existing' ? 'bg-green-deep text-cream-warm' : 'text-slate-400 hover:text-green-deep'}`}
              >
                Znajdź Właściciela
              </button>
              <button
                type="button"
                onClick={() => setVehicleClientMode('new')}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-semibold uppercase tracking-widest transition-all ${vehicleClientMode === 'new' ? 'bg-green-deep text-cream-warm' : 'text-slate-400 hover:text-green-deep'}`}
              >
                Nowy Klient
              </button>
            </div>
          </div>

          {vehicleClientMode === 'existing' ? (
            <>
              <div className="relative">
                <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Szukaj klienta po nazwie lub kontakcie..."
                  value={vehicleClientSearch}
                  onChange={(e) => setVehicleClientSearch(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-cream-warm/30"
                />
              </div>
              <div
                style={{
                  height: vehicleClientSearch.trim() ? '160px' : '0px',
                  opacity: vehicleClientSearch.trim() ? 1 : 0,
                  transition: 'height 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  overflow: 'hidden',
                }}
              >
                <div className="overflow-y-auto custom-scrollbar rounded-xl h-full space-y-2 pr-1">
                  {filteredClientsOnlyResults.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Brak wyników</p>
                    </div>
                  ) : (
                    filteredClientsOnlyResults.map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => {
                          setSelectedClientForVehicle(client);
                          setVehicleClientSearch('');
                        }}
                        className="w-full p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-cream-warm transition-all"
                      >
                        <div className="text-left">
                          <h5 className="font-semibold text-green-deep text-sm">{client.name}</h5>
                          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
                            {client.phone || client.email || 'Brak danych kontaktowych'}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
              {selectedClientForVehicle && (
                <div className="p-6 bg-cream-warm/20 border-2 border-cream-warm/50 rounded-xl flex items-center gap-4">
                  <User size={24} className="text-green-light" />
                  <div>
                    <h5 className="font-semibold text-green-deep text-sm">{selectedClientForVehicle.name}</h5>
                    <p className="text-[9px] font-semibold text-green-light uppercase tracking-widest">
                      {selectedClientForVehicle.phone || selectedClientForVehicle.email}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4">
                <label className="text-[10px] font-semibold text-green-light uppercase tracking-widest ml-4">
                  Nowy Pojazd
                </label>
                <div className="space-y-3 bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Marka (opcjonalnie)"
                      value={newVehicleBrand}
                      onChange={(e) => setNewVehicleBrand(e.target.value)}
                      className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50"
                    />
                    <input
                      type="text"
                      placeholder="Model (opcjonalnie)"
                      value={newVehicleModel}
                      onChange={(e) => setNewVehicleModel(e.target.value)}
                      className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Nr Rejestracyjny *"
                    value={newVehiclePlate}
                    onChange={(e) => setNewVehiclePlate(e.target.value)}
                    className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50 uppercase"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddNewVehicleToExisting}
                className="w-full mt-8 py-6 bg-green-deep text-cream-warm rounded-xl font-semibold text-[11px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Save size={18} /> Zapisz Pojazd
              </button>
            </>
          ) : (
            <div className="space-y-4 bg-slate-50 p-6 rounded-xl mt-2 border border-slate-100">
              <div className="space-y-3">
                <h5 className="font-semibold text-green-deep text-xs uppercase tracking-widest mb-3">Dane Klienta</h5>
                <input
                  type="text"
                  placeholder="Imię i Nazwisko *"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  required
                  className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="tel"
                    placeholder="Telefon *"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    required
                    className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50"
                  />
                  <input
                    type="email"
                    placeholder="Email (opcjonalnie)"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50"
                  />
                </div>
                <input
                  type="text"
                  placeholder="NIP (opcjonalnie)"
                  value={newBookingClientNip}
                  onChange={(e) => setNewBookingClientNip(e.target.value)}
                  className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50"
                />
              </div>
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h5 className="font-semibold text-green-deep text-xs uppercase tracking-widest mb-3">Pojazd Klienta</h5>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Marka (opcjonalnie)"
                    value={newVehicleBrand}
                    onChange={(e) => setNewVehicleBrand(e.target.value)}
                    className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50"
                  />
                  <input
                    type="text"
                    placeholder="Model (opcjonalnie)"
                    value={newVehicleModel}
                    onChange={(e) => setNewVehicleModel(e.target.value)}
                    className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Nr Rejestracyjny *"
                  value={newVehiclePlate}
                  onChange={(e) => setNewVehiclePlate(e.target.value)}
                  required
                  className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-cream-warm/50 uppercase"
                />
              </div>
              <button
                type="button"
                onClick={handleCreateClientWithVehicle}
                className="w-full py-4 bg-green-deep text-cream-warm rounded-xl font-semibold text-[10px] uppercase tracking-wider"
              >
                Utwórz Klienta i Pojazd
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AddVehicleModal;
