import { useState } from 'react';
import { Car as CarIcon } from 'lucide-react';
import { FieldError, FormSection, useToast } from '@detaileed/ui';
import { useClients } from '@/features/clients/api/clients';
import { useClientVehicleSearch, type ClientVehicleMatch } from '@/features/clients/hooks/useClientVehicleSearch';
import type { Client } from '@/features/clients/model/types';
import { describeVehicleMatch } from '@/features/clients/model/describe';
import { ModeToggle, type PickerMode } from '@/features/clients/components/picker/ModeToggle';
import { SearchDropdown } from '@/features/clients/components/picker/SearchDropdown';
import { PickedItem } from '@/features/clients/components/picker/ItemSummary';
import { NewClientWithVehicleForm } from '@/features/clients/components/picker/NewClientWithVehicleForm';

interface ClientVehiclePickerProps {
  value: ClientVehicleMatch | null;
  onChange: (match: ClientVehicleMatch) => void;
  /** Validation message of the surrounding form (e.g. "pick a vehicle"). */
  error?: string;
}

/**
 * Picks a vehicle (and so its owner) by searching existing clients' vehicles, or creates a new client with a
 * vehicle and picks that one.
 */
export function ClientVehiclePicker({ value, onChange, error }: ClientVehiclePickerProps) {
  const { addToast } = useToast();
  const { data: clients = [] } = useClients();
  const [mode, setMode] = useState<PickerMode>('existing');
  const [query, setQuery] = useState('');
  const results = useClientVehicleSearch(clients, query);

  const handleCreated = (client: Client) => {
    const vehicle = client.vehicles?.[0];
    if (vehicle) onChange({ client, vehicle });
    setMode('existing');
    addToast('Dodano i wybrano nowego klienta.', 'success');
  };

  return (
    <FormSection
      icon={CarIcon}
      title="Pojazd i klient"
      actions={
        <ModeToggle
          label="Klient i pojazd"
          value={mode}
          onChange={setMode}
          labels={{ existing: 'Wyszukaj', new: 'Dodaj nowy' }}
        />
      }
    >
      <div className="space-y-3 p-5">
        {mode === 'existing' ? (
          <>
            <SearchDropdown
              query={query}
              onQueryChange={setQuery}
              placeholder="Szukaj klienta lub pojazdu..."
              results={results}
              describe={describeVehicleMatch}
              onPick={onChange}
            />
            {value && <PickedItem item={describeVehicleMatch(value)} icon={CarIcon} />}
          </>
        ) : (
          <NewClientWithVehicleForm submitLabel="Dodaj klienta i wybierz" onCreated={handleCreated} />
        )}
        <FieldError>{error}</FieldError>
      </div>
    </FormSection>
  );
}
