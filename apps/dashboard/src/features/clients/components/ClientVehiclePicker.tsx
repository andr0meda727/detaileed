import { useState } from 'react';
import { Car as CarIcon } from 'lucide-react';
import FormSection from '@/shared/ui/FormSection';
import { useToast } from '@/shared/ui/useToast';
import { useClients } from '@/features/clients/api/clients';
import { useClientVehicleSearch, type ClientVehicleMatch } from '@/features/clients/hooks/useClientVehicleSearch';
import type { Client } from '@/features/clients/model/types';
import { describeVehicleMatch } from '@/features/clients/model/describe';
import ModeToggle, { type PickerMode } from '@/features/clients/components/picker/ModeToggle';
import SearchDropdown from '@/features/clients/components/picker/SearchDropdown';
import { PickedItem } from '@/features/clients/components/picker/ItemSummary';
import NewClientWithVehicleForm from '@/features/clients/components/picker/NewClientWithVehicleForm';

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
export default function ClientVehiclePicker({ value, onChange, error }: ClientVehiclePickerProps) {
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
      title="Pojazd i Klient"
      actions={<ModeToggle value={mode} onChange={setMode} labels={{ existing: 'Wyszukaj', new: 'Dodaj Nowy' }} />}
    >
      <div className="p-4 space-y-3">
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
          <NewClientWithVehicleForm submitLabel="Dodaj Klienta i Wybierz" onCreated={handleCreated} />
        )}
        {error && <p className="text-red-500 font-bold tracking-widest uppercase text-[10px]">{error}</p>}
      </div>
    </FormSection>
  );
}
