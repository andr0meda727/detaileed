const fs = require('fs');
let code = fs.readFileSync('views/clients/ClientsView.tsx', 'utf8');

// Add missing Skeleton import
if (!code.includes("import Skeleton")) {
    code = code.replace(/import Modal from '\.\.\/\.\.\/components\/ui\/Modal';/, "import Modal from '../../components/ui/Modal';\nimport Skeleton from '../../components/ui/Skeleton';");
}

// Add BOOKING_STATUSES if missing (wait, it failed early)
if (!code.includes("import { PREDEFINED_SERVICES, BOOKING_STATUSES")) {
    code = code.replace(/import \{ PREDEFINED_SERVICES \} from '\.\.\/\.\.\/constants';/, "import { PREDEFINED_SERVICES, BOOKING_STATUSES } from '../../constants';");
}

// Fix variables
code = code.replace(/setNewClientName\(/g, "setNewName(");
code = code.replace(/setNewClientPhone\(/g, "setNewPhone(");
code = code.replace(/setNewClientEmail\(/g, "setNewEmail(");

// We need to inject the missing states that TasksView's modal uses:
const missingVars = `
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isEditingBooking, setIsEditingBooking] = useState(true);
  const [customServiceInput, setCustomServiceInput] = useState('');
  const [selectedTime, setSelectedTime] = useState('08:00');
  const formatTime = (iso: string) => { const d = new Date(iso); return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0'); };
  const confirmStatusUpdate = (e: any, booking: any, targetStatus: any) => {};
`;

if (!code.includes("const [selectedBooking")) {
  code = code.replace(/const \[selectedDate, setSelectedDate\] = useState.*?;/g, missingVars + "\n  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);");
}

// Fix filteredClientResults 
code = code.replace(/filteredClientResults\.map/g, "searchResults.map");
code = code.replace(/filteredClientResults\.length/g, "searchResults.length");
code = code.replace(/<X size/g, "<XIcon size"); 

code = code.replace(/import \{ Phone, Search/g, "import { X as XIcon, Phone, Search");

fs.writeFileSync('views/clients/ClientsView.tsx', code);
console.log('Fixed ClientsView');
