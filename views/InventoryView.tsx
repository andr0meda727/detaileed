
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Package, 
  X, 
  Save, 
  Layers,
  ChevronLeft,
  ChevronRight,
  Check,
  Car as CarIcon
} from 'lucide-react';
import { INITIAL_INVENTORY, INITIAL_CLIENTS, PREDEFINED_SERVICES } from '../constants';
import { InventoryItem, Client, Vehicle } from '../types';
import GlobalHeader from '../components/GlobalHeader';

const DEFAULT_UNITS = ['ml', 'L', 'szt', 'm²', 'kg'];
const DEFAULT_CATEGORIES = [
  'Pasty Polerskie',
  'Powłoki Ceramiczne',
  'Chemia Czyszcząca',
  'Folie PPF',
  'Akcesoria',
  'BHP'
];

const Modal = ({ isOpen, onClose, title, children }: React.PropsWithChildren<{ isOpen: boolean, onClose: () => void, title: string }>) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-[#0a0c10]/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[95vh]">
        <div className="p-6 sm:p-10 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-[1000] text-[#0b2826] tracking-tighter italic leading-none">{title}</h3>
          <button onClick={onClose} className="p-2 sm:p-3 bg-slate-50 text-slate-400 rounded-xl sm:rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

const InventoryView: React.FC<{ onOpenMenu?: () => void }> = ({ onOpenMenu }) => {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
  // Quick Action States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState<{client: Client, vehicle: Vehicle} | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customServiceInput, setCustomServiceInput] = useState('');
  const [priceInput, setPriceInput] = useState('0,00');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [formData, setFormData] = useState<Omit<InventoryItem, 'id'>>({
    name: '', category: DEFAULT_CATEGORIES[0], stock: 0, minStock: 0, unit: 'ml', capacity: undefined
  });
  const [customUnit, setCustomUnit] = useState('');

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return items.filter(item => item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q));
  }, [searchQuery, items]);

  const filteredClientResults = useMemo(() => {
    if (!clientSearch.trim()) return [];
    const query = clientSearch.toLowerCase();
    const results: {client: Client, vehicle: Vehicle}[] = [];
    INITIAL_CLIENTS.forEach(client => {
      client.vehicles.forEach(vehicle => {
        if (client.name.toLowerCase().includes(query) || vehicle.make.toLowerCase().includes(query) || 
            vehicle.model.toLowerCase().includes(query) || vehicle.licensePlate.toLowerCase().includes(query)) {
          results.push({ client, vehicle });
        }
      });
    });
    return results.slice(0, 5);
  }, [clientSearch]);

  const toggleService = (s: string) => {
    setSelectedServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleAddCustomService = () => {
    if (customServiceInput.trim() && !selectedServices.includes(customServiceInput.trim())) {
      setSelectedServices(prev => [...prev, customServiceInput.trim()]);
      setCustomServiceInput('');
    }
  };

  const handleOpenModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, category: item.category, stock: item.stock, minStock: item.minStock, unit: item.unit, capacity: item.capacity });
      setCustomUnit(DEFAULT_UNITS.includes(item.unit) ? '' : item.unit);
    } else {
      setEditingItem(null);
      setFormData({ name: '', category: DEFAULT_CATEGORIES[0], stock: 0, minStock: 0, unit: 'ml', capacity: undefined });
      setCustomUnit('');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUnit = customUnit.trim() || formData.unit;
    const itemData = { ...formData, unit: finalUnit };
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...itemData } : i));
    } else {
      setItems(prev => [{ id: `i${Date.now()}`, ...itemData }, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleOpenNewBooking = () => {
    setSelectedServices([]);
    setSelectedVehicleForBooking(null);
    setClientSearch('');
    setPriceInput('0,00');
    setCustomServiceInput('');
    setIsBookingModalOpen(true);
  };

  return (
    <div className="space-y-6 sm:space-y-10">
      <GlobalHeader 
        title="Magazyn" 
        subtitle="Baza Produktów Studio OS" 
        onAddBooking={handleOpenNewBooking} 
        onAddClient={() => setIsClientModalOpen(true)}
        onOpenMenu={onOpenMenu} 
      />

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#5dcbb6] transition-colors" />
          <input type="text" placeholder="Szukaj produktu..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] outline-none shadow-sm focus:ring-8 focus:ring-[#5dcbb6]/5 focus:border-[#5dcbb6]/40 transition-all font-bold text-sm sm:text-base" />
        </div>
        <button onClick={() => handleOpenModal()} className="bg-[#0a0c10] text-[#5dcbb6] px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
          <Plus size={18} /> Dodaj Produkt
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] lg:rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-[#fcfcfc] border-b border-slate-100">
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Produkt</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Kategoria</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Stan Aktualny</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#f8f9fa] rounded-xl flex items-center justify-center text-slate-300 group-hover:text-[#5dcbb6] transition-colors">
                        {item.category === 'Folie PPF' ? <Layers size={20} /> : <Package size={20} />}
                      </div>
                      <span className="font-[900] text-[#0b2826] italic text-base lg:text-lg tracking-tighter">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="px-4 py-1.5 bg-white border border-slate-100 text-slate-500 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest">
                      {item.category}
                    </span>
                  </td>
                  <td className={`px-10 py-8 text-right font-mono text-xl lg:text-2xl font-[1000] ${item.stock < item.minStock ? 'text-red-500' : 'text-[#0b2826]'}`}>
                    {item.stock}<span className="text-[10px] ml-1 opacity-40 uppercase">{item.unit}</span>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <button onClick={() => handleOpenModal(item)} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-[#0a0c10] hover:text-[#5dcbb6] transition-all active:scale-90">
                      <Edit2 size={16}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edycja Produktu' : 'Nowy Produkt'}>
         <form className="space-y-8" onSubmit={handleSave}>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-[#237e73] uppercase tracking-widest ml-4">Pełna Nazwa</label>
               <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] outline-none font-bold text-base shadow-inner focus:ring-4 focus:ring-[#5dcbb6]/10" />
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black text-[#237e73] uppercase tracking-widest ml-4">Kategoria</label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_CATEGORIES.map(c => (
                  <button key={c} type="button" onClick={() => setFormData({...formData, category: c})} className={`px-4 py-3 rounded-[1.2rem] text-[9px] font-black uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${formData.category === c ? 'bg-[#0a0c10] text-[#5dcbb6] border-[#0a0c10]' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'}`}>
                    {formData.category === c && <Check size={12} strokeWidth={4} />} {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Stan Aktualny</label><input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)||0})} className="w-full px-6 py-5 bg-[#0a0c10] text-[#5dcbb6] border-none rounded-[1.5rem] font-[1000] text-2xl font-mono shadow-xl" /></div>
               <div className="space-y-2"><label className="text-[10px] font-black text-red-400 uppercase tracking-widest ml-4">Stan Minimalny</label><input type="number" value={formData.minStock} onChange={e => setFormData({...formData, minStock: parseInt(e.target.value)||0})} className="w-full px-6 py-5 bg-red-50 text-red-500 border-none rounded-[1.5rem] font-[1000] text-2xl font-mono" /></div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-[#237e73] uppercase tracking-widest ml-4">Jednostka Miar</label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_UNITS.map(u => (
                  <button key={u} type="button" onClick={() => {setFormData({...formData, unit: u}); setCustomUnit('');}} className={`px-5 py-3 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest border-2 transition-all ${formData.unit === u && !customUnit ? 'bg-[#0a0c10] text-[#5dcbb6] border-[#0a0c10]' : 'bg-slate-50 text-slate-400 border-transparent'}`}>{u}</button>
                ))}
              </div>
              <div className="pt-2">
                <input type="text" value={customUnit} onChange={e => setCustomUnit(e.target.value)} placeholder="Wpisz własną jednostkę (np. puszka)..." className="w-full px-6 py-4 bg-slate-50 border-none rounded-[1.2rem] outline-none font-bold text-sm focus:ring-4 focus:ring-[#5dcbb6]/10 shadow-inner" />
              </div>
            </div>

            <button type="submit" className="w-full py-6 bg-[#0a0c10] text-[#5dcbb6] rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"><Save size={18} /> Zapisz w Magazynie</button>
         </form>
      </Modal>

      {/* Booking Modal */}
      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title="Nowa Rezerwacja">
        <form className="space-y-8 pb-10" onSubmit={(e) => { e.preventDefault(); setIsBookingModalOpen(false); }}>
          <div className="space-y-4">
             <label className="text-[10px] font-black text-[#237e73] uppercase tracking-widest ml-4">Pojazd i Klient</label>
             <div className="relative">
               <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
               <input type="text" placeholder="Szukaj..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-sm outline-none focus:ring-4 focus:ring-[#5dcbb6]/10" />
             </div>
             {clientSearch.trim() && filteredClientResults.map(res => (
               <button key={res.vehicle.id} type="button" onClick={() => { setSelectedVehicleForBooking(res); setClientSearch(''); }} className="w-full p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-[#5dcbb6] transition-all">
                 <div className="text-left"><h5 className="font-black text-[#0b2826] text-sm italic">{res.vehicle.make} {res.vehicle.model}</h5><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{res.client.name}</p></div>
                 <div className="bg-[#0a0c10] text-[#5dcbb6] px-3 py-1.5 rounded-xl font-mono text-[11px] font-black tracking-widest">{res.vehicle.licensePlate}</div>
               </button>
             ))}
             {selectedVehicleForBooking && (
               <div className="p-6 bg-emerald-50 border-2 border-[#5dcbb6]/30 rounded-[1.5rem] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CarIcon size={24} className="text-[#5dcbb6]" />
                    <div><h5 className="font-black text-[#0b2826] text-sm italic">{selectedVehicleForBooking.vehicle.make} {selectedVehicleForBooking.vehicle.model}</h5><p className="text-[9px] font-black text-[#237e73] uppercase tracking-widest">{selectedVehicleForBooking.client.name}</p></div>
                  </div>
                  <div className="font-mono text-xs font-black text-[#0b2826] whitespace-nowrap">{selectedVehicleForBooking.vehicle.licensePlate}</div>
               </div>
             )}
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-[#237e73] uppercase tracking-widest ml-4">Wybierz Usługi</label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_SERVICES.slice(0, 6).map(s => (
                <button key={s} type="button" onClick={() => toggleService(s)} className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${selectedServices.includes(s) ? 'bg-[#0a0c10] text-[#5dcbb6] border-[#0a0c10]' : 'bg-slate-50 text-slate-400 border-transparent'}`}>
                  {selectedServices.includes(s) && <Check size={12} strokeWidth={4} />} {s}
                </button>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <input type="text" value={customServiceInput} onChange={e => setCustomServiceInput(e.target.value)} placeholder="Dodaj inną usługę..." className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-[#5dcbb6]/10" />
              <button type="button" onClick={handleAddCustomService} className="w-14 h-14 bg-[#0a0c10] text-[#5dcbb6] rounded-2xl flex items-center justify-center shadow-lg active:scale-95"><Plus size={24} /></button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Cena Netto</label><input type="text" value={priceInput} onChange={e => setPriceInput(e.target.value)} className="w-full px-6 py-5 bg-[#0a0c10] text-[#5dcbb6] border-none rounded-[1.5rem] font-black text-xl font-mono" /></div>
             <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Data</label><input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-sm outline-none" /></div>
          </div>
          <button type="submit" className="w-full py-6 bg-[#0a0c10] text-[#5dcbb6] rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"><Save size={18} /> Zapisz Rezerwację</button>
        </form>
      </Modal>

      {/* Client Modal */}
      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Nowy Klient">
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsClientModalOpen(false); }}>
           <div className="space-y-4">
              <input type="text" placeholder="Imię i Nazwisko" required className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" />
              <div className="grid grid-cols-2 gap-4"><input type="tel" placeholder="Telefon" required className="px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" /><input type="email" placeholder="Email" className="px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" /></div>
           </div>
           <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-4"><input type="text" placeholder="Marka Model" required className="px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" /><input type="text" placeholder="Tablice" required className="px-6 py-4 bg-[#0a0c10] text-[#5dcbb6] border-none rounded-2xl font-black text-sm uppercase font-mono tracking-widest" /></div>
           </div>
           <button type="submit" className="w-full py-5 bg-[#0a0c10] text-[#5dcbb6] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Załóż Kartę Klienta</button>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryView;
