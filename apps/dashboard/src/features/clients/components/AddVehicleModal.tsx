import { useState } from 'react';
import { User } from 'lucide-react';
import { Modal, FormSection, useToast } from '@detaileed/ui';
import { useClients } from '@/features/clients/api/clients';
import { useClientSearch } from '@/features/clients/hooks/useClientVehicleSearch';
import type { Client } from '@/features/clients/model/types';
import { describeClient } from '@/features/clients/model/describe';
import { ModeToggle, type PickerMode } from '@/features/clients/components/picker/ModeToggle';
import { SearchDropdown } from '@/features/clients/components/picker/SearchDropdown';
import { PickedItem } from '@/features/clients/components/picker/ItemSummary';
import { NewVehicleForm } from '@/features/clients/components/picker/NewVehicleForm';
import { NewClientWithVehicleForm } from '@/features/clients/components/picker/NewClientWithVehicleForm';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Adds a vehicle to an existing client (searched by name, phone or email), or creates a new client
 * together with the vehicle. Remount it (change `key`) to start with an empty form.
 */
export function AddVehicleModal({ isOpen, onClose }: AddVehicleModalProps) {
  const { addToast } = useToast();
  const { data: clients = [] } = useClients();
  const [mode, setMode] = useState<PickerMode>('existing');
  const [query, setQuery] = useState('');
  const [owner, setOwner] = useState<Client | null>(null);
  const results = useClientSearch(clients, query);

  const done = (message: string) => {
    addToast(message, 'success');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dodaj Nowy Pojazd">
      <div className="pb-6">
        <FormSection
          icon={User}
          title="Właściciel"
          actions={
            <ModeToggle
              value={mode}
              onChange={setMode}
              labels={{ existing: 'Znajdź Właściciela', new: 'Nowy Klient' }}
            />
          }
        >
          <div className="p-4 space-y-3">
            {mode === 'existing' ? (
              <>
                <SearchDropdown
                  query={query}
                  onQueryChange={setQuery}
                  placeholder="Szukaj klienta po nazwie lub kontakcie..."
                  results={results}
                  describe={describeClient}
                  onPick={setOwner}
                />
                {owner && <PickedItem item={describeClient(owner)} icon={User} />}
                <div className="pt-3 border-t border-slate-100">
                  <NewVehicleForm
                    clientId={owner?.id ?? null}
                    onCreated={() => done('Nowy pojazd został pomyślnie dodany do klienta.')}
                  />
                </div>
              </>
            ) : (
              <NewClientWithVehicleForm
                submitLabel="Utwórz Klienta i Pojazd"
                onCreated={() => done('Dodano nowego klienta wraz z pojazdem.')}
              />
            )}
          </div>
        </FormSection>
      </div>
    </Modal>
  );
}
