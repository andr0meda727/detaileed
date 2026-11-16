import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Button, Modal, useToast } from '@detaileed/ui';
import { ClientVehiclePicker, type ClientVehicleMatch } from '@/features/clients';
import { bookingFormSchema, type BookingFormValues } from '@/features/bookings/model/schemas';
import { useCreateBooking } from '@/features/bookings/api/bookings';
import { buildBookingCreateDto } from '@/features/bookings/model/buildBookingCreateDto';
import BookingServicesSection from '@/features/bookings/components/BookingServicesSection';
import BookingScheduleSection from '@/features/bookings/components/BookingScheduleSection';
import FreeSlotsSection from '@/features/bookings/components/FreeSlotsSection';
import { bookingSaveErrorMessage } from '@/features/bookings/model/errors';
import { dayInZone, timeInZone, todayInZone, zonedToUtc } from '@detaileed/domain/studioTime';
import { useStudioTimeZone } from '@/features/studios';

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
  const createBooking = useCreateBooking();
  const timeZone = useStudioTimeZone();
  const [selectedVehicle, setSelectedVehicle] = useState<ClientVehicleMatch | null>(null);

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
      scheduledAt: `${todayInZone(timeZone)}T08:00`,
      serviceIds: [],
      priceInput: '0,00',
      notes: '',
      bayId: null,
    },
  });

  const [serviceIds, scheduledAt, bayId] = useWatch({ control, name: ['serviceIds', 'scheduledAt', 'bayId'] });
  const [date, time] = scheduledAt.split('T');
  const pickedStart = date && time ? zonedToUtc(date, time, timeZone) : null;

  const pickSlot = (slot: { start: string; bayId: string }) => {
    setValue('scheduledAt', `${dayInZone(slot.start, timeZone)}T${timeInZone(slot.start, timeZone)}`, {
      shouldValidate: true,
    });
    setValue('bayId', slot.bayId);
  };

  const handlePickVehicle = (match: ClientVehicleMatch) => {
    setSelectedVehicle(match);
    setValue('clientId', match.client.id, { shouldValidate: true });
    setValue('vehicleId', match.vehicle.id, { shouldValidate: true });
  };

  const onSubmit = async (data: BookingFormValues) => {
    try {
      const [date, time] = data.scheduledAt.split('T');
      const dto = buildBookingCreateDto({
        vehicleId: data.vehicleId,
        clientId: data.clientId,
        date,
        time,
        timeZone,
        serviceIds: data.serviceIds,
        priceInput: data.priceInput,
        bayId: data.bayId ?? null,
      });
      if (data.notes) dto.notes = data.notes;

      await createBooking.mutateAsync(dto);
      addToast('Rezerwacja została pomyślnie utworzona.', 'success');
      onClose();
      onSuccess?.();
    } catch (err) {
      addToast(bookingSaveErrorMessage(err, 'Wystąpił błąd podczas tworzenia rezerwacji.'), 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nowa Rezerwacja">
      <form className="space-y-5 pb-6" onSubmit={handleSubmit(onSubmit)}>
        <ClientVehiclePicker value={selectedVehicle} onChange={handlePickVehicle} error={errors.vehicleId?.message} />

        <BookingServicesSection
          value={serviceIds}
          onChange={(ids) => setValue('serviceIds', ids, { shouldValidate: true })}
          error={errors.serviceIds?.message}
        />

        <BookingScheduleSection control={control} errors={errors} />

        <FreeSlotsSection
          date={date}
          serviceIds={serviceIds}
          size={selectedVehicle?.vehicle.size ?? 'Medium'}
          timeZone={timeZone}
          pickedStart={pickedStart}
          bayId={bayId ?? null}
          onPickSlot={pickSlot}
          onBayChange={(id) => setValue('bayId', id)}
        />

        <Button size="lg" fullWidth type="submit" disabled={isSubmitting} icon={Save}>
          Zapisz Rezerwację
        </Button>
      </form>
    </Modal>
  );
}
