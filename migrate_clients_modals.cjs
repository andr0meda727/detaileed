const fs = require('fs');

let tasksCode = fs.readFileSync('views/tasks/TasksView.tsx', 'utf8');
let clientsCode = fs.readFileSync('views/clients/ClientsView.tsx', 'utf8');

const clientModalMatch = tasksCode.match(/(<Modal isOpen=\{isClientModalOpen\}.*?<\/Modal>)/s);
const bookingModalMatch = tasksCode.match(/(<Modal isOpen=\{isBookingModalOpen\}.*?<\/Modal>)/s);

if (!clientModalMatch || !bookingModalMatch) {
  console.log("Could not find modals in TasksView.tsx");
  process.exit(1);
}

// 1. Add useServices hook import if missing
if (!clientsCode.includes('import { useServices }')) {
  clientsCode = clientsCode.replace(
    /import \{ useClients.*?\} from '\.\.\/\.\.\/hooks\/useClients';/,
    "import { useClients, useCreateClient, useUpdateClient, useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from '../../hooks/useClients';\nimport { useServices } from '../../hooks/useServices';\nimport { createService } from '../../services/serviceService';"
  );
}

// 2. Add missing Lucide imports
clientsCode = clientsCode.replace(/import \{ Phone, Search, Car as CarIcon, Save, Plus, Check, Edit2, Trash2 \} from 'lucide-react';/, "import { Phone, Search, Car as CarIcon, Save, Plus, Check, Edit2, Trash2, Clock, User, MessageSquare, AlertCircle, Calendar, Hash, Wrench, UserPlus } from 'lucide-react';");

// 3. Extract useServices state and methods
const hooksMatch = clientsCode.match(/const \{ data: clients = \[\], isLoading \} = useClients\(\);/);
if (hooksMatch) {
  clientsCode = clientsCode.replace(
    /const \{ data: clients = \[\], isLoading \} = useClients\(\);/,
    "const { data: clients = [], isLoading, refetch: refetchClients } = useClients();\n  const { data: availableServices = [], refetch: refetchServices } = useServices();"
  );
}

if (!clientsCode.includes('selectedTime')) {
  clientsCode = clientsCode.replace(
    /const \[selectedDate, setSelectedDate\] = useState.*?;\n/,
    "const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);\n  const [selectedTime, setSelectedTime] = useState('08:00');\n  const [customServiceInput, setCustomServiceInput] = useState('');\n"
  );
}

// 4. Update Modal implementations by replacing them
clientsCode = clientsCode.replace(/\{\/\* New Client Modal \*\/\}.*?<\/Modal>\s*\{\/\* Booking Modal \*\/\}.*?<\/Modal>/s, 
  "<!-- NEW_MODALS -->"
);

// We must adjust TasksView modals slightly because ClientsView names the state variables newName instead of newClientName
let newModals = clientModalMatch[1] + "\n\n" + bookingModalMatch[1];
newModals = newModals.replace(/newClientName/g, 'newName');
newModals = newModals.replace(/newClientPhone/g, 'newPhone');
newModals = newModals.replace(/newClientEmail/g, 'newEmail');

clientsCode = clientsCode.replace("<!-- NEW_MODALS -->", newModals);

// 5. Add needed constants for Booking
if (!clientsCode.includes('BOOKING_STATUSES')) {
  clientsCode = clientsCode.replace(/import \{ PREDEFINED_SERVICES \} from '\.\.\/\.\.\/constants';/, "import { PREDEFINED_SERVICES, BOOKING_STATUSES } from '../../constants';\nimport { createClient as createClientService } from '../../services/clientService';");
}

// 6. Rewrite handleCreateBooking to use standard layout 
const methods = `
  const handleAddCustomService = async () => {
    const name = customServiceInput.trim();
    if (!name) return;
    try {
      const created = await createService({ name });
      setSelectedServices(prev => [...prev, created.id]);
      setCustomServiceInput('');
      if (refetchServices) refetchServices();
    } catch (err) {}
  };

  const handleAddNewClientForBooking = async () => {
    if (!newClientNameForBooking || !newClientPhoneForBooking || !newVehiclePlate) {
      addToast('Wypełnij wymagane pola: Imię i Nazwisko, Telefon oraz Numer Rejestracyjny.', 'error');
      return;
    }
    try {
      const { createClient } = await import('../../services/clientService');
      const createdClient = await createClient({
        name: newClientNameForBooking,
        phone: newClientPhoneForBooking,
        email: newClientEmailForBooking || null,
        nip: newBookingClientNip || null,
        vehicle: { licensePlate: newVehiclePlate, brand: newVehicleBrand || null, model: newVehicleModel || null },
      });
      const vehicle = createdClient.vehicles?.[0];
      if (vehicle) setSelectedVehicle({ client: createdClient, vehicle });
      setBookingClientMode('existing');
      setNewClientNameForBooking(''); setNewClientPhoneForBooking(''); setNewClientEmailForBooking(''); setNewBookingClientNip('');
      setNewVehicleBrand(''); setNewVehicleModel(''); setNewVehiclePlate('');
      if (refetchClients) refetchClients();
      addToast('Dodano i wybrano nowego klienta.', 'success');
    } catch (err) {
      addToast('Wystąpił błąd', 'error');
    }
  };
`;
clientsCode = clientsCode.replace(/const handleCreateBooking = async \(e: React\.FormEvent\) => \{/, methods + "\n  const handleCreateBooking = async (e: React.FormEvent) => {");

clientsCode = clientsCode.replace(/const handleCreateBooking = async \(e: React\.FormEvent\) => \{[\s\S]*?addToast\('Wystąpił błąd podczas tworzenia rezerwacji\.', 'error'\);\s*\}\s*\};/, 
`const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) {
      addToast('Wybierz istniejącego klienta lub dodaj nowego.', 'error');
      return;
    }
    try {
      const dto = {
        vehicleId: selectedVehicle.vehicle.id,
        clientId: selectedVehicle.client.id,
        scheduledAt: new Date(\`\${selectedDate}T\${selectedTime}\`).toISOString(),
        statusId: BOOKING_STATUSES.UTWORZONA.id,
        serviceIds: selectedServices,
        price: parseFloat(priceInput.replace(',', '.')),
        notes: null,
      };
      await createBooking(dto);
      setIsBookingModalOpen(false);
      addToast('Rezerwacja została pomyślnie utworzona.', 'success');
    } catch (err) {
      addToast('Wystąpił błąd podczas tworzenia rezerwacji.', 'error');
    }
  };`
);

// GlobalHeader inside ClientsView has "onAddBooking" that already sets states. Let's make sure it resets time too.
clientsCode = clientsCode.replace(/setIsBookingModalOpen\(true\)/, "setSelectedTime('08:00'); setIsBookingModalOpen(true)");

fs.writeFileSync('views/clients/ClientsView.tsx', clientsCode);
console.log("Successfully migrated to ClientsView.tsx");
