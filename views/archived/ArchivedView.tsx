
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, History, Car as CarIcon, User, Clock, CheckCircle2, XCircle, X, Download } from 'lucide-react';
import { BookingResponseDto } from '../../types';
import { getBookings } from '../../services/bookingService';
import GlobalHeader from '../../components/GlobalHeader';

const Modal = ({ isOpen, onClose, title, children }: React.PropsWithChildren<{ isOpen: boolean, onClose: () => void, title: string }>) => {
 if (!isOpen) return null;
 return createPortal(
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#102C26]/70 backdrop-blur-md animate-fade-in">
 <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-zoom-in flex flex-col max-h-[95vh]">
 <div className="p-8 sm:p-10 border-b border-slate-100 flex items-center justify-between shrink-0">
 <h3 className="text-2xl sm:text-3xl font-semibold text-[#102C26] leading-none">{title}</h3>
 <button onClick={onClose} className="p-3 bg-[#FDF8F0] text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"><X size={20} /></button>
 </div>
 <div className="p-8 sm:p-10 overflow-y-auto flex-1 custom-scrollbar">{children}</div>
 </div>
 </div>,
 document.body
 );
};

const ArchivedView: React.FC<{ onOpenMenu?: () => void }> = ({ onOpenMenu }) => {
 const [bookings, setBookings] = useState<BookingResponseDto[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedBooking, setSelectedBooking] = useState<BookingResponseDto | null>(null);

 const fetchData = useCallback(async () => {
 try { setLoading(true); setBookings(await getBookings({ isCompleted: true })); } catch (e) { console.error(e); } finally { setLoading(false); }
 }, []);
 useEffect(() => { fetchData(); }, [fetchData]);

 const filteredBookings = useMemo(() => {
 const q = searchQuery.toLowerCase();
 return bookings.filter(b =>
 b.services.join(' ').toLowerCase().includes(q) || b.client.name.toLowerCase().includes(q) || b.vehicle.licensePlate.toLowerCase().includes(q)
 );
 }, [searchQuery, bookings]);

 const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
 const formatDateShort = (iso: string) => { const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`; };

 if (loading) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-[#102C26] border-t-transparent rounded-full animate-spin"></div></div>;

 return (
 <div className="space-y-8 animate-fade-in pb-20">
 <GlobalHeader title="Archiwum" subtitle="Pełna Historia Operacyjna • DetailFlow" onOpenMenu={onOpenMenu} />

 <div className="flex flex-col sm:flex-row gap-4">
 <div className="flex-1 relative group">
 <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#5A8A7A] transition-colors"><Search size={20} /></div>
 <input type="text" placeholder="Szukaj w historii..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-14 pr-8 py-5 bg-white border border-slate-200 rounded-xl font-medium text-sm outline-none shadow-sm focus:ring-8 focus:ring-[#F7E7CE]/20 focus:border-[#F7E7CE]/40 transition-all" />
 </div>
 <button className="bg-[#102C26] text-white px-8 py-5 rounded-xl font-medium text-xs tracking-wide shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"><Download size={16} /> Eksportuj</button>
 </div>

 <div className="space-y-4">
 {filteredBookings.map(booking => (
 <div key={booking.id} onClick={() => setSelectedBooking(booking)} className="bg-white rounded-xl border border-slate-100 p-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-6 hover:shadow-lg transition-all cursor-pointer group">
 <div className="w-24 sm:border-r border-slate-100 flex flex-col items-center justify-center shrink-0">
 <span className="text-xl font-semibold text-[#102C26] font-mono">{formatDateShort(booking.scheduledAt)}</span>
 <span className="text-xs font-semibold text-slate-400 tracking-wide mt-1">{formatTime(booking.scheduledAt)}</span>
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-3 mb-1">
 <span className="bg-[#102C26] text-white px-3 py-1 rounded-lg font-mono text-xs font-semibold">{booking.vehicle.licensePlate}</span>
 <h4 className="text-lg font-bold text-[#102C26] truncate">{booking.vehicle.brand} {booking.vehicle.model}</h4>
 </div>
 <p className="text-xs font-bold text-[#5A8A7A] truncate">{booking.services.join(', ') || 'Brak usług'}</p>
 </div>
 <div className="flex flex-col items-end justify-center shrink-0">
 <p className="text-xl font-semibold text-[#102C26] font-mono leading-none">{((booking.totalPrice || 0) / 100).toFixed(2).replace('.', ',')}</p>
 <span className="text-xs font-semibold mt-1" style={{ color: booking.statusColor || '#22c55e' }}>{booking.status}</span>
 </div>
 </div>
 ))}
 {filteredBookings.length === 0 && <div className="text-center py-16"><p className="text-lg font-bold text-slate-300">Brak archiwalnych zleceń</p></div>}
 </div>

 <Modal isOpen={!!selectedBooking} onClose={() => setSelectedBooking(null)} title="Szczegóły Archiwalne">
 {selectedBooking && (
 <div className="space-y-6">
 <div className="p-6 bg-[#102C26] rounded-xl text-white flex items-center justify-between">
 <div><p className="text-xs font-semibold text-white/40 tracking-wide mb-1">Klient</p><h4 className="text-xl font-semibold">{selectedBooking.client.name}</h4></div>
 <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center"><User size={24} /></div>
 </div>
 <div className="p-6 bg-[#FDF8F0] rounded-xl space-y-4">
 <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-400 ">Pojazd</span><span className="text-sm font-semibold text-[#102C26]">{selectedBooking.vehicle.brand} {selectedBooking.vehicle.model} • {selectedBooking.vehicle.licensePlate}</span></div>
 <div className="flex justify-between items-center border-t border-slate-200 pt-4"><span className="text-xs font-bold text-slate-400 ">Usługi</span><span className="text-sm font-semibold text-[#102C26]">{selectedBooking.services.join(', ') || '—'}</span></div>
 <div className="flex justify-between items-center border-t border-slate-200 pt-4"><span className="text-xs font-bold text-slate-400 ">Cena Netto</span><span className="text-xl font-semibold text-[#102C26] font-mono">{((selectedBooking.totalPrice || 0) / 100).toFixed(2)} PLN</span></div>
 {selectedBooking.notes && <div className="border-t border-slate-200 pt-4"><span className="text-xs font-bold text-slate-400 ">Notatki</span><p className="text-sm text-slate-600 mt-1">{selectedBooking.notes}</p></div>}
 </div>
 <button onClick={() => setSelectedBooking(null)} className="w-full py-5 bg-[#102C26] text-white rounded-xl font-medium text-xs tracking-wide">Zamknij</button>
 </div>
 )}
 </Modal>
 </div>
 );
};

export default ArchivedView;
