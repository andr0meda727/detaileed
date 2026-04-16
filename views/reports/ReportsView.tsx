import React, { useState } from 'react';
import {
  FileBarChart2,
  Download,
  Calendar as CalendarIcon,
  Loader2,
  Search,
  Plus,
  UserPlus,
  Car as CarIcon,
  Wrench,
  Save,
  Check,
} from 'lucide-react';
import GlobalHeader from '../../components/GlobalHeader';
import { generateBookingsReport } from '../../apiClient';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../../components/ui/Modal';
import { useClients } from '../../hooks/useClients';
import { useServices } from '../../hooks/useServices';
import { createBooking } from '../../services/bookingService';
import { createClient } from '../../services/clientService';
import { createService } from '../../services/serviceService';
import { useClientVehicleSearch } from '../../hooks/useClientVehicleSearch';
import { buildBookingCreateDto } from '../../features/bookings/utils/buildBookingCreateDto';
import { toggleIdSelection } from '../../utils/selection';
import { ClientResponseDto, VehicleInfoDto } from '../../types';

interface ReportsViewProps {
  onOpenMenu?: () => void;
}

const ReportsView: React.FC<ReportsViewProps> = ({ onOpenMenu }) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { addToast } = useToast();
  const { data: clients = [], refetch: refetchClients } = useClients();
  const { data: availableServices = [], refetch: refetchServices } = useServices();

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<{ client: ClientResponseDto; vehicle: VehicleInfoDto } | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customServiceInput, setCustomServiceInput] = useState('');
  const [priceInput, setPriceInput] = useState('0,00');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [bookingClientMode, setBookingClientMode] = useState<'existing' | 'new'>('existing');
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newBookingClientNip, setNewBookingClientNip] = useState('');
  const [newVehicleBrand, setNewVehicleBrand] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehiclePlate, setNewVehiclePlate] = useState('');

  const filteredClientResults = useClientVehicleSearch(clients, clientSearch);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateFrom || !dateTo) {
      addToast('Wybierz zakres dat', 'error');
      return;
    }

    if (new Date(dateFrom) > new Date(dateTo)) {
      addToast('Data od nie może być późniejsza niż data do', 'error');
      return;
    }

    try {
      setIsGenerating(true);
      const fromTimestamp = `${dateFrom}T00:00:00Z`;
      const toTimestamp = `${dateTo}T23:59:59Z`;

      await generateBookingsReport(fromTimestamp, toTimestamp);

      addToast('Rozpoczęto generowanie raportu. Zostanie on wysłany na Twój adres e-mail.', 'success');

      setDateFrom('');
      setDateTo('');
    } catch (err) {
      console.error('Failed to generate report', err);
      addToast('Wystąpił błąd podczas zlecania raportu', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchBookingData = () => {
    void refetchClients();
    void refetchServices();
  };

  const handleOpenNewBooking = () => {
    setBookingClientMode('existing');
    setNewClientName('');
    setNewClientPhone('');
    setNewClientEmail('');
    setNewBookingClientNip('');
    setNewVehicleBrand('');
    setNewVehicleModel('');
    setNewVehiclePlate('');
    setSelectedServices([]);
    setSelectedVehicle(null);
    setClientSearch('');
    setPriceInput('0,00');
    setSelectedTime('08:00');
    setIsBookingModalOpen(true);
  };

  const toggleService = (id: string) => setSelectedServices(prev => toggleIdSelection(prev, id));

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createClient({
        name: newClientName,
        phone: newClientPhone || null,
        email: newClientEmail || null,
        nip: null,
      });
      setIsClientModalOpen(false);
      setNewClientName('');
      setNewClientPhone('');
      setNewClientEmail('');
      fetchBookingData();
      addToast('Karta klienta została utworzona.', 'success');
    } catch (err) {
      console.error('Failed to create client:', err);
      addToast('Wystąpił błąd podczas tworzenia klienta.', 'error');
    }
  };

  const handleAddCustomService = async () => {
    const name = customServiceInput.trim();
    if (!name) return;
    try {
      const created = await createService({ name });
      setSelectedServices(prev => [...prev, created.id]);
      setCustomServiceInput('');
      fetchBookingData();
    } catch (err) {
      console.error('Failed to create service:', err);
      addToast('Wystąpił błąd podczas dodawania usługi.', 'error');
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
      if (vehicle) {
        setSelectedVehicle({ client: createdClient, vehicle });
      }
      setBookingClientMode('existing');
      setNewClientName('');
      setNewClientPhone('');
      setNewClientEmail('');
      setNewBookingClientNip('');
      setNewVehicleBrand('');
      setNewVehicleModel('');
      setNewVehiclePlate('');
      fetchBookingData();
      addToast('Dodano i wybrano nowego klienta.', 'success');
    } catch (err) {
      console.error('Failed to create client for booking:', err);
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
      const dto = buildBookingCreateDto({
        vehicleId: selectedVehicle.vehicle.id,
        clientId: selectedVehicle.client.id,
        date: selectedDate,
        time: selectedTime,
        serviceIds: selectedServices,
        priceInput,
      });
      await createBooking(dto);
      setIsBookingModalOpen(false);
      fetchBookingData();
      addToast('Rezerwacja została pomyślnie utworzona.', 'success');
    } catch (err) {
      console.error('Failed to create booking:', err);
      addToast('Wystąpił błąd podczas tworzenia rezerwacji.', 'error');
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <GlobalHeader
        title="Raporty"
        subtitle="Eksport Danych i Analizy"
        onOpenMenu={onOpenMenu}
        onAddBooking={handleOpenNewBooking}
        onAddClient={() => setIsClientModalOpen(true)}
      />

      <div className="bg-white rounded-2xl lg:rounded-2xl p-6 sm:p-8 lg:p-10 border border-slate-100 shadow-sm max-w-3xl">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 bg-green-deep rounded-2xl flex items-center justify-center text-cream-warm shadow-lg shrink-0">
            <FileBarChart2 size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-green-deep tracking-tight">Raport Rezerwacji</h3>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Wygeneruj zestawienie finansowe wizyt</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                <CalendarIcon size={12} /> Data Od
              </label>
              <input
                type="date"
                required
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-cream-warm/30 transition-all text-green-deep"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                <CalendarIcon size={12} /> Data Do
              </label>
              <input
                type="date"
                required
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-cream-warm/30 transition-all text-green-deep"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full sm:w-auto px-8 py-5 bg-green-deep text-cream-warm rounded-xl font-semibold text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:active:scale-100 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Trwa Generowanie...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Pobierz Raport
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title="Nowa Rezerwacja">
        <form onSubmit={handleCreateBooking} className="space-y-6">
          <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-deep rounded-xl flex items-center justify-center shrink-0">
                  <CarIcon size={14} className="text-cream-warm" />
                </div>
                <p className="text-[11px] font-bold text-green-deep uppercase tracking-widest">Pojazd i Klient</p>
              </div>
              <div className="flex bg-slate-50 p-1 rounded-xl">
                <button type="button" onClick={() => setBookingClientMode('existing')} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${bookingClientMode === 'existing' ? 'bg-green-deep text-cream-warm shadow-sm' : 'text-slate-400 hover:text-green-deep'}`}>Wyszukaj</button>
                <button type="button" onClick={() => setBookingClientMode('new')} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${bookingClientMode === 'new' ? 'bg-green-deep text-cream-warm shadow-sm' : 'text-slate-400 hover:text-green-deep'}`}>Dodaj Nowy</button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {bookingClientMode === 'existing' ? (
                <>
                  <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Szukaj klienta lub pojazdu..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl font-semibold text-sm outline-none focus:border-cream-warm/50 transition-all" />
                  </div>
                  <div style={{ height: clientSearch.trim() ? '130px' : '0px', opacity: clientSearch.trim() ? 1 : 0, transition: 'height 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden' }}>
                    <div className="overflow-y-auto rounded-xl h-full">
                      {filteredClientResults.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Brak wyników</p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {filteredClientResults.map(res => (
                            <button key={res.vehicle.id} type="button" onClick={() => { setSelectedVehicle(res); setClientSearch(''); }} className="w-full p-3.5 bg-white border-2 border-slate-100 rounded-xl flex items-center justify-between hover:border-cream-warm/60 hover:shadow-sm transition-all">
                              <div className="text-left">
                                <h5 className="font-bold text-green-deep text-sm">{res.vehicle.brand} {res.vehicle.model}</h5>
                                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">{res.client.name}</p>
                              </div>
                              <div className="bg-green-deep text-cream-warm px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold tracking-widest">{res.vehicle.licensePlate}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedVehicle && (
                    <div className="p-4 rounded-xl flex items-center justify-between bg-amber/10 border-2 border-amber/30">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-amber/15 rounded-xl flex items-center justify-center shrink-0">
                          <CarIcon size={16} className="text-amber" />
                        </div>
                        <div>
                          <h5 className="font-bold text-green-deep text-sm">{selectedVehicle.vehicle.brand} {selectedVehicle.vehicle.model}</h5>
                          <p className="text-[9px] font-semibold text-green-light uppercase tracking-widest mt-0.5">{selectedVehicle.client.name}</p>
                        </div>
                      </div>
                      <div className="bg-green-deep text-cream-warm px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold tracking-widest">{selectedVehicle.vehicle.licensePlate}</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dane Klienta</p>
                    <input type="text" placeholder="Imię i Nazwisko *" value={newClientName} onChange={e => setNewClientName(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-semibold text-sm focus:border-cream-warm/50 transition-all" />
                    <div className="grid grid-cols-2 gap-2.5">
                      <input type="tel" placeholder="Telefon *" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} className="px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-semibold text-sm focus:border-cream-warm/50 transition-all" />
                      <input type="email" placeholder="Email (opcjonalnie)" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} className="px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-semibold text-sm focus:border-cream-warm/50 transition-all" />
                    </div>
                    <input type="text" placeholder="NIP (opcjonalnie)" value={newBookingClientNip} onChange={e => setNewBookingClientNip(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-semibold text-sm focus:border-cream-warm/50 transition-all" />
                  </div>
                  <div className="space-y-2.5 pt-3 border-t border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dane Pojazdu</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      <input type="text" placeholder="Marka" value={newVehicleBrand} onChange={e => setNewVehicleBrand(e.target.value)} className="px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-semibold text-sm focus:border-cream-warm/50 transition-all" />
                      <input type="text" placeholder="Model" value={newVehicleModel} onChange={e => setNewVehicleModel(e.target.value)} className="px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-semibold text-sm focus:border-cream-warm/50 transition-all" />
                    </div>
                    <input type="text" placeholder="Nr Rejestracyjny *" value={newVehiclePlate} onChange={e => setNewVehiclePlate(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-semibold text-sm focus:border-cream-warm/50 transition-all uppercase" />
                  </div>
                  <button type="button" onClick={handleAddNewClientForBooking} className="w-full py-3.5 bg-green-deep text-cream-warm rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <UserPlus size={15} strokeWidth={2.5} /> Dodaj Klienta i Wybierz
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-deep rounded-xl flex items-center justify-center shrink-0">
                  <Wrench size={14} className="text-cream-warm" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-green-deep uppercase tracking-widest leading-none">Wybierz Usługi</p>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{selectedServices.length === 0 ? 'Nic nie wybrano' : `${selectedServices.length} wybranych`}</p>
                </div>
              </div>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableServices.map(svc => {
                const isSelected = selectedServices.includes(svc.id);
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => toggleService(svc.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-left transition-all ${isSelected ? 'bg-green-deep text-cream-warm shadow-md' : 'bg-slate-50 text-green-deep'}`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/15 border border-white/30' : 'bg-white border border-black/10'}`}>
                      {isSelected && <Check size={10} strokeWidth={3.5} className="text-cream-warm" />}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wide leading-tight line-clamp-2">{svc.name}</span>
                  </button>
                );
              })}
            </div>
            <div className="px-4 pb-4 flex gap-2">
              <input type="text" value={customServiceInput} onChange={e => setCustomServiceInput(e.target.value)} placeholder="Dodaj inną usługę..." className="flex-1 px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-semibold text-sm focus:border-cream-warm/50 transition-all" />
              <button type="button" onClick={handleAddCustomService} className="w-12 h-12 bg-green-deep text-cream-warm rounded-xl flex items-center justify-center shadow-md active:scale-95 transition-all hover:shadow-lg shrink-0">
                <Plus size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-amber/10">
                <CalendarIcon size={14} className="text-amber" />
              </div>
              <p className="text-[11px] font-bold text-green-deep uppercase tracking-widest">Termin i Cena</p>
            </div>
            <div className="p-4 grid grid-cols-3 gap-3">
              <div className="col-span-1 flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Cena netto</label>
                <input type="text" value={priceInput} onChange={e => setPriceInput(e.target.value)} className="w-full px-4 py-4 rounded-xl font-bold text-lg font-mono text-cream-warm outline-none border-none bg-green-deep" />
              </div>
              <div className="col-span-1 flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Data</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent rounded-xl font-bold text-sm outline-none focus:border-cream-warm/50 transition-all text-green-deep" />
              </div>
              <div className="col-span-1 flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Godzina</label>
                <input type="time" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent rounded-xl font-bold text-sm outline-none focus:border-cream-warm/50 transition-all text-green-deep" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-5 bg-green-deep text-cream-warm rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 hover:shadow-2xl">
            <Save size={16} strokeWidth={2.5} /> Zapisz Rezerwację
          </button>
        </form>
      </Modal>

      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Nowy Klient">
        <form className="space-y-6" onSubmit={handleCreateClient}>
          <div className="space-y-4">
            <input type="text" placeholder="Imię i Nazwisko" required value={newClientName} onChange={e => setNewClientName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" />
            <div className="grid grid-cols-2 gap-4">
              <input type="tel" placeholder="Telefon" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} className="px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" />
              <input type="email" placeholder="Email" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} className="px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" />
            </div>
          </div>
          <button type="submit" className="w-full py-5 bg-green-deep text-cream-warm rounded-2xl font-semibold text-[10px] uppercase tracking-widest shadow-xl">Załóż Kartę Klienta</button>
        </form>
      </Modal>
    </div>
  );
};

export default ReportsView;
