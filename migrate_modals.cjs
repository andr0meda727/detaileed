const fs = require('fs');

const ds = fs.readFileSync('views/dashboard/Dashboard.tsx', 'utf8');
let ts = fs.readFileSync('views/tasks/TasksView.tsx', 'utf8');

// 1. Add Imports
ts = ts.replace(
  /import \{ useBookings \} from '\.\.\/\.\.\/hooks\/useBookings';/,
  "import { useBookings } from '../../hooks/useBookings';\nimport { useClients } from '../../hooks/useClients';\nimport { useServices } from '../../hooks/useServices';\nimport { createBooking } from '../../services/bookingService';\nimport { createClient } from '../../services/clientService';\nimport { createService } from '../../services/serviceService';\nimport { ClientResponseDto, VehicleInfoDto } from '../../types';"
);

// Add missing lucide icons
ts = ts.replace(
  /CheckCircle2, X, Clock, Car as CarIcon, User, Calendar as CalendarIcon, ChevronLeft, ChevronRight, LayoutList, Search, CalendarDays, Hash, Phone, MessageSquare, AlertCircle, Check/,
  "CheckCircle2, X, Clock, Car as CarIcon, User, Calendar as CalendarIcon, ChevronLeft, ChevronRight, LayoutList, Search, CalendarDays, Hash, Phone, MessageSquare, AlertCircle, Check, Plus, Wrench, UserPlus"
);

// 2. Add Hooks and State
const stateToAdd = `
  const { data: clients = [], refetch: refetchClients } = useClients();
  const { data: availableServices = [], refetch: refetchServices } = useServices();

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isEditingBooking, setIsEditingBooking] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<{ client: ClientResponseDto, vehicle: VehicleInfoDto } | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customServiceInput, setCustomServiceInput] = useState('');
  const [priceInput, setPriceInput] = useState('0,00');
  const [selectedTime, setSelectedTime] = useState('08:00');

  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newBookingClientNip, setNewBookingClientNip] = useState('');

  const [newVehicleBrand, setNewVehicleBrand] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehiclePlate, setNewVehiclePlate] = useState('');

  const [bookingClientMode, setBookingClientMode] = useState<'existing' | 'new'>('existing');
`;

ts = ts.replace(
  /const { data: bookings = \[\], isLoading: loading, refetch: fetchData } = useBookings\(\);/,
  "const { data: bookings = [], isLoading: loading, refetch: refetchBookings } = useBookings();\n" + stateToAdd + "\n  const fetchData = useCallback(() => { refetchBookings(); refetchClients(); refetchServices(); }, [refetchBookings, refetchClients, refetchServices]);"
);

// 3. Add Methods
const methodsToAdd = `
  const filteredClientResults = useMemo(() => {
    if (!clientSearch.trim()) return [];
    const query = clientSearch.toLowerCase();
    const results: { client: ClientResponseDto, vehicle: VehicleInfoDto }[] = [];
    clients.forEach(client => {
      client.vehicles.forEach(vehicle => {
        if (client.name.toLowerCase().includes(query) || (vehicle.brand || '').toLowerCase().includes(query) ||
          (vehicle.model || '').toLowerCase().includes(query) || vehicle.licensePlate.toLowerCase().includes(query)) {
          results.push({ client, vehicle });
        }
      });
    });
    return results.slice(0, 5);
  }, [clientSearch, clients]);

  const toggleService = (id: string) => setSelectedServices(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const handleAddCustomService = async () => {
    const name = customServiceInput.trim();
    if (!name) return;
    try {
      const created = await createService({ name });
      setSelectedServices(prev => [...prev, created.id]);
      setCustomServiceInput('');
      refetchServices();
    } catch (err) {
      addToast('Wystąpił błąd podczas dodawania usługi.', 'error');
    }
  };

  const handleOpenNewBooking = () => {
    setSelectedBooking(null); setSelectedVehicle(null); setClientSearch(''); setSelectedServices([]); setPriceInput('0,00');
    // Ensure selectedDate tracks correctly - typically reset to today, but TasksView tracks it already via selectedDate so we just let it be or reset
    setIsEditingBooking(true);
    setBookingClientMode('existing');
    setNewClientName(''); setNewClientPhone(''); setNewClientEmail(''); setNewBookingClientNip('');
    setNewVehicleBrand(''); setNewVehicleModel(''); setNewVehiclePlate(''); setIsBookingModalOpen(true);
  };
  
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createClient({ name: newClientName, phone: newClientPhone || null, email: newClientEmail || null, nip: null });
      setIsClientModalOpen(false);
      setNewClientName(''); setNewClientPhone(''); setNewClientEmail('');
      addToast('Karta klienta została utworzona.', 'success');
      fetchData();
    } catch (err) {
      addToast('Wystąpił błąd podczas tworzenia klienta.', 'error');
    }
  };

  const handleAddNewClientForBooking = async () => {
    if (!newClientName || !newClientPhone || !newVehiclePlate) {
      addToast('Wypełnij wymagane pola: Imię i Nazwisko, Telefon oraz Numer Rejestracyjny.', 'error');
      return;
    }
    try {
      const createdClient = await createClient({
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
      const vehicle = createdClient.vehicles?.[0];
      if (vehicle) setSelectedVehicle({ client: createdClient, vehicle });
      setBookingClientMode('existing');
      setNewClientName(''); setNewClientPhone(''); setNewClientEmail(''); setNewBookingClientNip('');
      setNewVehicleBrand(''); setNewVehicleModel(''); setNewVehiclePlate('');
      fetchData();
      addToast('Dodano i wybrano nowego klienta.', 'success');
    } catch (err) {
      addToast('Wystąpił błąd podczas dodawania klienta.', 'error');
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
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
      fetchData();
    } catch (err) {
      addToast('Wystąpił błąd podczas tworzenia rezerwacji.', 'error');
    }
  };
`;

ts = ts.replace(
  /const handleViewBooking = \(booking: BookingResponseDto\) => \{/,
  methodsToAdd + "\n  const handleViewBooking = (booking: BookingResponseDto) => {\n    setIsEditingBooking(false);\n    setSelectedServices(booking.services);\n    setPriceInput(booking.totalPrice ? (booking.totalPrice / 100).toFixed(2).replace('.', ',') : '0,00');\n    const dt = new Date(booking.scheduledAt);\n    setSelectedDate(dt.toISOString().split('T')[0]);\n    setSelectedTime(dt.toTimeString().slice(0, 5));"
);

// 4. Update GlobalHeader
ts = ts.replace(
  /onAddBooking=\{[^\}]+alert[^}]+\}/,
  "onAddBooking={handleOpenNewBooking}"
);
ts = ts.replace(
  /onAddClient=\{[^\}]+alert[^}]+\}/,
  "onAddClient={() => setIsClientModalOpen(true)}"
);

// 5. Update Booking Modal and Add Client Modal
const modalsRegex = /(<Modal isOpen=\{isBookingModalOpen\}.*?)(\{\/\* Confirmation Modal \*\/})/s;

const match = ds.match(/(<Modal isOpen=\{isBookingModalOpen\}.*?<\/Modal>)/s);
const bookingModalStr = match ? match[1] : '';

const clientMatch = ds.match(/(<Modal isOpen=\{isClientModalOpen\}.*?<\/Modal>)/s);
const clientModalStr = clientMatch ? clientMatch[1] : '';

if (bookingModalStr && clientModalStr) {
  ts = ts.replace(modalsRegex, bookingModalStr + "\n\n" + clientModalStr + "\n\n$2");
  fs.writeFileSync('views/tasks/TasksView.tsx', ts);
  console.log('Successfully updated TasksView.tsx');
} else {
  console.log('Failed to extract modals');
}
