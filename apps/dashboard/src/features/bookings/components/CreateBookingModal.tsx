import React, { useState } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Search, Car as CarIcon, Wrench, Check, Plus, Calendar, UserPlus } from 'lucide-react';
import Modal from '@/shared/ui/Modal';

import { bookingFormSchema, BookingFormValues, clientFormSchema, vehicleFormSchema } from '@/shared/lib/validations';
import { useClients, useClientVehicleSearch, useCreateClient, type Client, type Vehicle } from '@/features/clients';
import { useCreateService, useServices } from '@/features/services';
import { useCreateBooking } from '@/features/bookings/api/bookings';
import { buildBookingCreateDto } from '@/features/bookings/model/buildBookingCreateDto';
import { useToast } from '@/shared/ui/useToast';
import { toggleIdSelection } from '@/shared/lib/selection';
import { getApiErrorMessage } from '@/shared/lib/errorHandler';

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/** New booking form. It remounts whenever it opens or closes, so every opening starts with an empty form. */
export default function CreateBookingModal(props: CreateBookingModalProps) {
  return <CreateBookingForm key={props.isOpen ? 'open' : 'closed'} {...props} />;
}

function CreateBookingForm({ isOpen, onClose, onSuccess }: CreateBookingModalProps) {
  const { addToast } = useToast();
  const createClient = useCreateClient();
  const createService = useCreateService();
  const createBooking = useCreateBooking();
  const { data: clients = [], refetch: refetchClients } = useClients();
  const { data: availableServices = [], refetch: refetchServices } = useServices();

  const [bookingClientMode, setBookingClientMode] = useState<'existing' | 'new'>('existing');
  const [clientSearch, setClientSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<{ client: Client; vehicle: Vehicle } | null>(null);

  // Custom service addition
  const [customServiceInput, setCustomServiceInput] = useState('');

  // New Client inline form UI state
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newBookingClientNip, setNewBookingClientNip] = useState('');
  const [newVehicleBrand, setNewVehicleBrand] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehiclePlate, setNewVehiclePlate] = useState('');

  const searchResults = useClientVehicleSearch(clients, clientSearch);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      clientId: '',
      vehicleId: '',
      scheduledAt: `${new Date().toISOString().split('T')[0]}T08:00`,
      serviceIds: [],
      priceInput: '0,00',
      notes: '',
    },
  });

  const watchServiceIds = useWatch({ control, name: 'serviceIds' });

  const handleAddNewClientForBooking = async () => {
    // 1. Zod local validation
    const clientParse = clientFormSchema.safeParse({
      name: newClientName,
      phone: newClientPhone,
      email: newClientEmail,
      nip: newBookingClientNip,
    });
    if (!clientParse.success) {
      addToast(clientParse.error.issues[0].message, 'error');
      return;
    }

    // Zod vehicle validation (import vehicleFormSchema from validations)
    // Wait, vehicleFormSchema is not imported yet. I'll import it first below.
    const vehicleParse = vehicleFormSchema.safeParse({
      licensePlate: newVehiclePlate,
      brand: newVehicleBrand,
      model: newVehicleModel,
    });
    if (!vehicleParse.success) {
      addToast(vehicleParse.error.issues[0].message, 'error');
      return;
    }

    try {
      const createdClient = await createClient.mutateAsync({
        name: newClientName,
        phone: newClientPhone,
        email: newClientEmail || null,
        nip: newBookingClientNip || null,
        vehicle: {
          licensePlate: newVehiclePlate.toUpperCase(),
          brand: newVehicleBrand || null,
          model: newVehicleModel || null,
        },
      });
      const vehicle = createdClient.vehicles?.[0];
      if (vehicle) {
        setSelectedVehicle({ client: createdClient, vehicle });
        setValue('clientId', createdClient.id, { shouldValidate: true });
        setValue('vehicleId', vehicle.id, { shouldValidate: true });
      }
      setBookingClientMode('existing');
      setNewClientName('');
      setNewClientPhone('');
      setNewClientEmail('');
      setNewBookingClientNip('');
      setNewVehicleBrand('');
      setNewVehicleModel('');
      setNewVehiclePlate('');
      if (refetchClients) refetchClients();
      addToast('Dodano i wybrano nowego klienta.', 'success');
    } catch (err) {
      addToast(getApiErrorMessage(err, 'Wystąpił błąd podczas szybkiego tworzenia klienta'), 'error');
    }
  };

  const handleAddCustomService = async () => {
    const name = customServiceInput.trim();
    if (!name) return;
    try {
      const created = await createService.mutateAsync({ name });
      setValue('serviceIds', [...watchServiceIds, created.id], { shouldValidate: true });
      setCustomServiceInput('');
      if (refetchServices) refetchServices();
    } catch (err) {
      addToast(getApiErrorMessage(err, 'Nie udało się dodać usługi.'), 'error');
    }
  };

  const onSubmit = async (data: BookingFormValues) => {
    try {
      const [datePart, timePart] = data.scheduledAt.split('T');
      const dto = buildBookingCreateDto({
        vehicleId: data.vehicleId,
        clientId: data.clientId,
        date: datePart,
        time: timePart,
        serviceIds: data.serviceIds,
        priceInput: data.priceInput,
      });

      if (data.notes) dto.notes = data.notes;

      await createBooking.mutateAsync(dto);
      addToast('Rezerwacja została pomyślnie utworzona.', 'success');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      addToast(getApiErrorMessage(err, 'Wystąpił błąd podczas tworzenia rezerwacji.'), 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nowa Rezerwacja">
      <form className="space-y-5 pb-6" onSubmit={handleSubmit(onSubmit)}>
        {/* === Krok 1: Klient i Pojazd === */}
        <div
          className="rounded-2xl border border-slate-100 overflow-hidden bg-white"
          style={{ boxShadow: '0 8px 20px rgba(26,46,30,0.12)' }}
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-deep rounded-xl flex items-center justify-center shrink-0">
                <CarIcon size={14} className="text-cream-warm" />
              </div>
              <p className="text-[11px] font-bold text-green-deep uppercase tracking-widest">Pojazd i Klient</p>
            </div>
            <div className="flex bg-slate-50 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setBookingClientMode('existing')}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${bookingClientMode === 'existing' ? 'bg-green-deep text-cream-warm shadow-sm' : 'text-slate-400 hover:text-green-deep'}`}
              >
                Wyszukaj
              </button>
              <button
                type="button"
                onClick={() => setBookingClientMode('new')}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${bookingClientMode === 'new' ? 'bg-green-deep text-cream-warm shadow-sm' : 'text-slate-400 hover:text-green-deep'}`}
              >
                Dodaj Nowy
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {bookingClientMode === 'existing' ? (
              <>
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Szukaj klienta lub pojazdu..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl font-semibold text-sm outline-none focus:border-cream-warm/50 transition-all"
                  />
                </div>
                <div
                  style={{
                    height: clientSearch.trim() ? '130px' : '0px',
                    opacity: clientSearch.trim() ? 1 : 0,
                    transition: 'all 0.25s',
                    overflow: 'hidden',
                  }}
                >
                  <div className="overflow-y-auto custom-scrollbar rounded-xl h-full">
                    {searchResults.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                          Brak wyników
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {searchResults.map((res) => (
                          <button
                            key={res.vehicle.id}
                            type="button"
                            onClick={() => {
                              setSelectedVehicle(res);
                              setValue('clientId', res.client.id, { shouldValidate: true });
                              setValue('vehicleId', res.vehicle.id, { shouldValidate: true });
                              setClientSearch('');
                            }}
                            className="w-full p-3.5 bg-white border-2 border-slate-100 rounded-xl flex items-center justify-between hover:border-cream-warm/60 hover:shadow-sm transition-all"
                          >
                            <div className="text-left">
                              <h5 className="font-bold text-green-deep text-sm">
                                {res.vehicle.brand} {res.vehicle.model}
                              </h5>
                              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                                {res.client.name}
                              </p>
                            </div>
                            <div className="bg-green-deep text-cream-warm px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold tracking-widest">
                              {res.vehicle.licensePlate}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {selectedVehicle && (
                  <div
                    className="p-4 rounded-xl flex items-center justify-between"
                    style={{ background: 'rgba(232,168,48,0.08)', border: '2px solid rgba(232,168,48,0.3)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-amber/15 rounded-xl flex items-center justify-center shrink-0">
                        <CarIcon size={16} className="text-amber" />
                      </div>
                      <div>
                        <h5 className="font-bold text-green-deep text-sm">
                          {selectedVehicle.vehicle.brand} {selectedVehicle.vehicle.model}
                        </h5>
                        <p className="text-[9px] font-semibold text-green-light uppercase tracking-widest mt-0.5">
                          {selectedVehicle.client.name}
                        </p>
                      </div>
                    </div>
                    <div className="bg-green-deep text-cream-warm px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold tracking-widest">
                      {selectedVehicle.vehicle.licensePlate}
                    </div>
                  </div>
                )}
                {errors.vehicleId && (
                  <p className="text-red-500 font-bold tracking-widest uppercase text-[10px]">
                    {errors.vehicleId.message}
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2.5">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dane Klienta</p>
                  <input
                    type="text"
                    placeholder="Imię i Nazwisko *"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-semibold text-sm focus:border-cream-warm/50 transition-all"
                  />
                  <div className="grid grid-cols-2 gap-2.5">
                    <input
                      type="tel"
                      placeholder="Telefon *"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      className="px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-semibold text-sm focus:border-cream-warm/50 transition-all"
                    />
                    <input
                      type="email"
                      placeholder="Email (opcjonalnie)"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      className="px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-semibold text-sm focus:border-cream-warm/50 transition-all"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="NIP (opcjonalnie)"
                    value={newBookingClientNip}
                    onChange={(e) => setNewBookingClientNip(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-semibold text-sm focus:border-cream-warm/50 transition-all"
                  />
                </div>
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dane Pojazdu</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      placeholder="Marka"
                      value={newVehicleBrand}
                      onChange={(e) => setNewVehicleBrand(e.target.value)}
                      className="px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-semibold text-sm focus:border-cream-warm/50 transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Model"
                      value={newVehicleModel}
                      onChange={(e) => setNewVehicleModel(e.target.value)}
                      className="px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-semibold text-sm focus:border-cream-warm/50 transition-all"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Nr Rejestracyjny *"
                    value={newVehiclePlate}
                    onChange={(e) => setNewVehiclePlate(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-semibold text-sm focus:border-cream-warm/50 transition-all uppercase"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddNewClientForBooking}
                  className="w-full py-3.5 bg-green-deep text-cream-warm rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus size={15} strokeWidth={2.5} /> Dodaj Klienta i Wybierz
                </button>
                {errors.vehicleId && (
                  <p className="text-red-500 font-bold tracking-widest uppercase text-[10px]">
                    Wybierz z listy lub poprawnie dodaj i zatwierdź Nowego Klienta.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* === Krok 2: Usługi === */}
        <div
          className="rounded-2xl border border-slate-100 overflow-hidden bg-white"
          style={{ boxShadow: '0 8px 20px rgba(26,46,30,0.12)' }}
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-deep rounded-xl flex items-center justify-center shrink-0">
                <Wrench size={14} className="text-cream-warm" />
              </div>
              <p className="text-[11px] font-bold text-green-deep uppercase tracking-widest leading-none">
                Wybierz Usługi
              </p>
            </div>
            {watchServiceIds.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: '#1a2e1e' }}>
                <Check size={10} strokeWidth={3} className="text-cream-warm" />
                <span className="text-[9px] font-bold text-cream-warm tracking-widest">{watchServiceIds.length}</span>
              </div>
            )}
          </div>

          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableServices.map((svc) => {
              const isSelected = watchServiceIds.includes(svc.id);
              return (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() =>
                    setValue('serviceIds', toggleIdSelection(watchServiceIds, svc.id), { shouldValidate: true })
                  }
                  className="group relative flex items-center gap-2.5 p-3 rounded-xl text-left transition-all duration-200"
                  style={
                    isSelected
                      ? { background: '#1a2e1e', boxShadow: '0 4px 12px rgba(26,46,30,0.2)' }
                      : { background: '#f8f9fa' }
                  }
                >
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                    style={
                      isSelected
                        ? { background: 'rgba(245,240,232,0.15)', border: '1.5px solid rgba(245,240,232,0.4)' }
                        : { background: 'white', border: '1.5px solid rgba(0,0,0,0.12)' }
                    }
                  >
                    {isSelected && <Check size={10} strokeWidth={3.5} className="text-cream-warm" />}
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide leading-tight line-clamp-2"
                    style={{ color: isSelected ? '#f5f0e8' : '#2d4f33' }}
                  >
                    {svc.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="px-4 pb-4 flex gap-2">
            <input
              type="text"
              value={customServiceInput}
              onChange={(e) => setCustomServiceInput(e.target.value)}
              placeholder="Dodaj inną usługę..."
              className="flex-1 px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-semibold text-sm focus:border-cream-warm/50"
            />
            <button
              type="button"
              onClick={handleAddCustomService}
              className="w-12 h-12 bg-green-deep text-cream-warm rounded-xl flex items-center justify-center shadow-md active:scale-95"
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>
          {errors.serviceIds && (
            <p className="px-4 pb-4 text-red-500 font-bold tracking-widest uppercase text-[10px]">
              {errors.serviceIds.message}
            </p>
          )}
        </div>

        {/* === Krok 3: Termin i Cena === */}
        <div
          className="rounded-2xl border border-slate-100 overflow-hidden bg-white"
          style={{ boxShadow: '0 8px 20px rgba(26,46,30,0.12)' }}
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(232,168,48,0.12)' }}
            >
              <Calendar size={14} className="text-amber" />
            </div>
            <p className="text-[11px] font-bold text-green-deep uppercase tracking-widest">Termin i Cena</p>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <Controller
              name="priceInput"
              control={control}
              render={({ field }) => (
                <div className="col-span-1 flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">
                    Cena netto
                  </label>
                  <div className="relative">
                    <input
                      {...field}
                      className="w-full px-4 py-4 rounded-xl font-bold text-lg font-mono text-cream-warm outline-none bg-[#1a2e1e]"
                    />
                    <span className="absolute right-3 bottom-4 text-[9px] font-bold text-cream-warm/40 uppercase tracking-widest">
                      ZŁ
                    </span>
                  </div>
                  {errors.priceInput && (
                    <p className="text-red-500 font-bold tracking-widest uppercase text-[10px]">
                      {errors.priceInput.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              name="scheduledAt"
              control={control}
              render={({ field }) => {
                const [date, time] = field.value.split('T');
                return (
                  <div className="col-span-1 grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Data</label>
                      <input
                        type="date"
                        value={date || ''}
                        onChange={(e) => field.onChange(`${e.target.value}T${time}`)}
                        className="w-full px-3 py-4 bg-slate-50 border-2 border-transparent rounded-xl font-bold text-xs outline-none focus:border-cream-warm/50 text-green-deep"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">
                        Godzina
                      </label>
                      <input
                        type="time"
                        value={time || ''}
                        onChange={(e) => field.onChange(`${date}T${e.target.value}`)}
                        className="w-full px-3 py-4 bg-slate-50 border-2 border-transparent rounded-xl font-bold text-xs outline-none focus:border-cream-warm/50 text-green-deep"
                      />
                    </div>
                    {errors.scheduledAt && (
                      <p className="col-span-2 text-red-500 font-bold tracking-widest uppercase text-[10px]">
                        {errors.scheduledAt.message}
                      </p>
                    )}
                  </div>
                );
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-5 bg-green-deep text-cream-warm rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all disabled:opacity-60 flex justify-center items-center gap-2"
        >
          <Save size={16} /> Zapisz Rezerwację
        </button>
      </form>
    </Modal>
  );
}
