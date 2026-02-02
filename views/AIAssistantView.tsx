
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Sparkles, BrainCircuit, RotateCcw, Bot, X, Search, Car as CarIcon, Check, Plus, Save } from 'lucide-react';
import { DetailingAIService } from '../geminiService';
import GlobalHeader from '../components/GlobalHeader';
import { INITIAL_CLIENTS, PREDEFINED_SERVICES } from '../constants';
import { Client, Vehicle } from '../types';

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

const AIAssistantView: React.FC<{ onOpenMenu?: () => void }> = ({ onOpenMenu }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const aiService = useRef(new DetailingAIService());

  // Quick Action States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState<{client: Client, vehicle: Vehicle} | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customServiceInput, setCustomServiceInput] = useState('');
  const [priceInput, setPriceInput] = useState('0,00');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const response = await aiService.current.getAdvice(userMsg);
    
    setMessages(prev => [...prev, { role: 'ai', content: response || "Błąd eksperta AI." }]);
    setIsLoading(false);
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
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-6 animate-in fade-in duration-500">
      <GlobalHeader 
        title="Ekspert AI" 
        subtitle="Wsparcie Techniczne • DetailFlow" 
        onAddBooking={handleOpenNewBooking}
        onAddClient={() => setIsClientModalOpen(true)}
        onOpenMenu={onOpenMenu} 
      />

      <div className="flex-1 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
              <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-[#5dcbb6] shadow-inner">
                <BrainCircuit size={40} />
              </div>
              <div className="max-w-md">
                <h3 className="text-xl font-[900] text-[#0b2826] mb-2 italic">W czym pomóc?</h3>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest leading-relaxed">
                  Zapytaj o techniki polerowania, chemię lub trudne zabrudzenia.
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-6 rounded-[2rem] ${
                msg.role === 'user' 
                  ? 'bg-[#0a0c10] text-[#5dcbb6] rounded-tr-none' 
                  : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'
              }`}>
                {msg.role === 'ai' && (
                  <div className="flex items-center gap-2 mb-3 text-[#5dcbb6] font-black text-[9px] uppercase tracking-widest">
                    <Bot size={14} /> Ekspert AI
                  </div>
                )}
                <p className="text-sm font-medium leading-relaxed italic">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-in fade-in">
              <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#5dcbb6] rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-[#5dcbb6] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-[#5dcbb6] rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Zadaj pytanie..."
              className="w-full pl-6 pr-16 py-5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#5dcbb6]/10 outline-none transition-all font-bold text-sm text-[#0b2826]"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-4 bg-[#0a0c10] text-[#5dcbb6] rounded-xl active:scale-90 transition-all disabled:opacity-50"
            >
              <Send size={18} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

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

export default AIAssistantView;
