import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import { Button, FormInput, useToast } from '@detaileed/ui';
import { dayInZone, timeInZone } from '@detaileed/domain/studioTime';
import { useAcceptRequest } from '@/features/booking-requests/api/requests';
import {
  acceptFormDefaults,
  acceptFormSchema,
  toAcceptBody,
  type AcceptFormValues,
} from '@/features/booking-requests/model/acceptForm';
import { requestErrorMessage } from '@/features/booking-requests/model/errors';
import type { BookingRequest } from '@/features/booking-requests/model/types';
import { RequestPlanSection, type PickedSlot } from '@/features/booking-requests/components/RequestPlanSection';

interface AcceptRequestFormProps {
  request: BookingRequest;
  timeZone: string;
  onDone: () => void;
}

/** Accepts a request: the time (preferred, a free slot from the plan, or typed), the final price and the bay. */
export function AcceptRequestForm({ request, timeZone, onDone }: AcceptRequestFormProps) {
  const { addToast } = useToast();
  const accept = useAcceptRequest();
  const [picked, setPicked] = useState<PickedSlot | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AcceptFormValues>({
    resolver: zodResolver(acceptFormSchema),
    defaultValues: acceptFormDefaults(request, timeZone),
  });

  const pickSlot = (slot: PickedSlot) => {
    setPicked(slot);
    setValue('date', dayInZone(slot.start, timeZone));
    setValue('time', timeInZone(slot.start, timeZone));
    setValue('bayId', slot.bayId);
  };
  // Typing a time by hand drops the bay picked with a slot; the planner then chooses one.
  const clearBay = () => {
    setPicked(null);
    setValue('bayId', null);
  };

  const onSubmit = (values: AcceptFormValues) =>
    accept.mutate(
      { id: request.id, body: toAcceptBody(values, timeZone) },
      {
        onSuccess: () => {
          addToast('Zapytanie przyjęte, rezerwacja jest w kalendarzu.', 'success');
          onDone();
        },
        onError: (err) => addToast(requestErrorMessage(err, 'Nie udało się przyjąć zapytania.'), 'error'),
      },
    );

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <RequestPlanSection requestId={request.id} timeZone={timeZone} picked={picked} onPick={pickSlot} />
      <div className="grid grid-cols-3 gap-3">
        <FormInput
          label="Data"
          type="date"
          error={errors.date?.message}
          {...register('date', { onChange: clearBay })}
        />
        <FormInput
          label="Godzina"
          type="time"
          error={errors.time?.message}
          {...register('time', { onChange: clearBay })}
        />
        <FormInput label="Cena (zł)" inputMode="decimal" error={errors.price?.message} {...register('price')} />
      </div>
      <Button size="lg" fullWidth type="submit" variant="success" icon={Check} loading={accept.isPending}>
        Przyjmij i dodaj do kalendarza
      </Button>
    </form>
  );
}
