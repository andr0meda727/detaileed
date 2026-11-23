import React, { useState } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { Download } from 'lucide-react';
import { GlobalHeader } from '@/shared/ui/GlobalHeader';
import { useGenerateBookingsReport } from '@/features/reports/api/reports';
import { reportRangeError } from '@/features/reports/model/reportRange';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';
import { Button, Card, CardContent, CardFooter, CardHeader, FormInput, useToast } from '@detaileed/ui';

import { CreateBookingModal } from '@/features/bookings';
import { CreateClientModal } from '@/features/clients';

const routeApi = getRouteApi('/_signed-in/s/$studioId/reports');

export const ReportsView: React.FC = () => {
  const { from: dateFrom = '', to: dateTo = '' } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const setRange = (range: { from?: string; to?: string }) =>
    void navigate({ search: (prev) => ({ ...prev, ...range }), replace: true });
  const setDateFrom = (value: string) => setRange({ from: value || undefined });
  const setDateTo = (value: string) => setRange({ to: value || undefined });
  const generateReport = useGenerateBookingsReport();
  const isGenerating = generateReport.isPending;
  const { addToast } = useToast();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const rangeError = reportRangeError(dateFrom, dateTo);
    if (rangeError) {
      addToast(rangeError, 'error');
      return;
    }

    try {
      // The API takes plain studio days (DateOnly), not timestamps.
      await generateReport.mutateAsync({ dateFrom, dateTo });

      addToast('Rozpoczęto generowanie raportu. Zostanie on wysłany na Twój adres e-mail.', 'success');

      setRange({ from: undefined, to: undefined });
    } catch (err) {
      addToast(getApiErrorMessage(err, 'Wystąpił błąd podczas zlecania raportu'), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <GlobalHeader
        title="Raporty"
        subtitle="Eksport danych i analizy"
        onAddBooking={() => setIsBookingModalOpen(true)}
        onAddClient={() => setIsClientModalOpen(true)}
      />

      <Card className="max-w-3xl">
        <CardHeader title="Raport rezerwacji" description="Wygeneruj zestawienie finansowe wizyt." />
        <form onSubmit={handleGenerate}>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput
              label="Data od"
              type="date"
              required
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <FormInput
              label="Data do"
              type="date"
              required
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" loading={isGenerating} icon={Download}>
              {isGenerating ? 'Trwa generowanie…' : 'Pobierz raport'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <CreateBookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />

      <CreateClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} />
    </div>
  );
};
