import React, { useState } from 'react';
import { getRouteApi } from '@tanstack/react-router';
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
import GlobalHeader from '@/shared/ui/GlobalHeader';
import { generateBookingsReport } from '@/apiClient';
import { useToast } from '@/shared/ui/ToastContext';
import Modal from '@/shared/ui/Modal';
import { CreateBookingModal } from '@/features/bookings';
import { CreateClientModal } from '@/features/clients';

const routeApi = getRouteApi('/_auth/s/$studioId/reports');

const ReportsView: React.FC = () => {
  const { from: dateFrom = '', to: dateTo = '' } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const setRange = (range: { from?: string; to?: string }) =>
    void navigate({ search: (prev) => ({ ...prev, ...range }), replace: true });
  const setDateFrom = (value: string) => setRange({ from: value || undefined });
  const setDateTo = (value: string) => setRange({ to: value || undefined });
  const [isGenerating, setIsGenerating] = useState(false);
  const { addToast } = useToast();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

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

      setRange({ from: undefined, to: undefined });
    } catch (err) {
      console.error('Failed to generate report', err);
      addToast('Wystąpił błąd podczas zlecania raportu', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenNewBooking = () => {
    setIsBookingModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-20">
      <GlobalHeader
        title="Raporty"
        subtitle="Eksport Danych i Analizy"
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
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-1">
              Wygeneruj zestawienie finansowe wizyt
            </p>
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

      <CreateBookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />

      <CreateClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} />
    </div>
  );
};

export default ReportsView;
