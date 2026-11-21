'use client';

import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Car, Clock, Send, Wrench } from 'lucide-react';
import {
  getApiPublicStudiosStudioIdAvailability,
  postApiPublicStudiosStudioIdEstimate,
  type GarageVehicleDto,
  type VehicleSize,
} from '@detaileed/api-client';
import { Button, FormSection } from '@detaileed/ui';
import type { Listing } from '@detaileed/domain/listing';
import { formatPln } from '@detaileed/domain/money';
import { addDays, todayInZone } from '@detaileed/domain/studioTime';
import { useSubmitRequest, CarFields } from '@/features/account';
import {
  NEW_CAR,
  requestFormDefaults,
  requestFormSchema,
  toSubmitRequest,
  type RequestFormValues,
} from '@/features/booking/model/requestForm';
import { bookingErrorMessage } from '@/features/booking/model/errors';
import ServiceChecklist from '@/features/booking/components/ServiceChecklist';
import TimePicker from '@/features/booking/components/TimePicker';

interface BookingRequestFormProps {
  listing: Listing;
  garage: GarageVehicleDto[];
  initialServiceIds: string[];
  initialSize: VehicleSize;
}

/** Services, car, time and notes, with a live estimate; sends the request and goes to the request history. */
export default function BookingRequestForm({
  listing,
  garage,
  initialServiceIds,
  initialSize,
}: BookingRequestFormProps) {
  const router = useRouter();
  const submit = useSubmitRequest();
  const { timeZone, studioId } = listing;

  const availabilityParams = (serviceIds: string[], size: VehicleSize) => {
    const today = todayInZone(timeZone);
    return { From: today, To: addDays(today, 13), ServiceIds: serviceIds, VehicleSize: size };
  };

  const form = useForm<RequestFormValues>({
    defaultValues: requestFormDefaults(initialServiceIds, initialSize, garage.length > 0),
  });
  const { control, register, setValue, getValues, formState, setError, clearErrors } = form;
  const [serviceIds, vehicleChoice, carSize, slotStart] = useWatch({
    control,
    name: ['serviceIds', 'vehicleChoice', 'car.size', 'slotStart'],
  });
  const size = (garage.find((v) => v.id === vehicleChoice)?.size ?? carSize) as VehicleSize;

  const availability = useQuery({
    queryKey: ['availability', studioId, serviceIds, size],
    queryFn: () => getApiPublicStudiosStudioIdAvailability(studioId, availabilityParams(serviceIds, size)),
    enabled: serviceIds.length > 0,
  });
  const estimate = useQuery({
    queryKey: ['estimate', studioId, serviceIds, size],
    queryFn: () => postApiPublicStudiosStudioIdEstimate(studioId, { serviceIds, vehicleSize: size }),
    enabled: serviceIds.length > 0,
  });
  const planning = availability.data?.planningEnabled;

  // The rules depend on whether the studio plans, known only once availability has loaded (after the form
  // exists), so the form is validated here rather than through a resolver. (handleSubmit isn't used: it refuses
  // to submit while errors set by setError remain, so a corrected form could never be sent again.)
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    const values = getValues();
    const result = requestFormSchema(!!planning, timeZone).safeParse(values);
    if (!result.success) {
      for (const issue of result.error.issues) {
        setError(issue.path.join('.') as keyof RequestFormValues, { message: issue.message });
      }
      return;
    }
    submit.mutate(toSubmitRequest(values, studioId, timeZone, !!planning), {
      onSuccess: () => router.push('/account/bookings?sent=1'),
      onError: (err) => setError('root', { message: bookingErrorMessage(err) }),
    });
  };

  const errors = formState.errors;
  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      <FormSection icon={Wrench} title="Usługi">
        <div className="p-4">
          <ServiceChecklist
            services={listing.services}
            size={size}
            selected={serviceIds}
            onChange={(ids) => setValue('serviceIds', ids, { shouldDirty: true })}
          />
          {errors.serviceIds && <p className="mt-2 text-xs font-bold text-red-500">{errors.serviceIds.message}</p>}
        </div>
      </FormSection>

      <FormSection icon={Car} title="Auto">
        <div className="p-4 space-y-3" role="radiogroup" aria-label="Auto">
          {garage.map((v) => (
            <label
              key={v.id}
              className="flex items-center gap-3 p-3 rounded-xl border-2 border-green-deep/10 cursor-pointer has-[:checked]:border-green-deep"
            >
              <input type="radio" value={v.id} {...register('vehicleChoice')} />
              <span className="font-semibold">{[v.brand, v.model].filter(Boolean).join(' ') || 'Auto'}</span>
              <span className="font-mono text-sm text-green-light">{v.licensePlate}</span>
            </label>
          ))}
          {garage.length > 0 && (
            <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-green-deep/10 cursor-pointer has-[:checked]:border-green-deep">
              <input type="radio" value={NEW_CAR} {...register('vehicleChoice')} />
              <span className="font-semibold">Inne auto</span>
            </label>
          )}
          {vehicleChoice === NEW_CAR && (
            <CarFields
              fields={{
                licensePlate: register('car.licensePlate'),
                brand: register('car.brand'),
                model: register('car.model'),
                size: register('car.size'),
              }}
              errors={errors.car}
            />
          )}
          {errors.vehicleChoice && <p className="text-xs font-bold text-red-500">{errors.vehicleChoice.message}</p>}
        </div>
      </FormSection>

      <FormSection icon={Clock} title="Termin">
        <div className="p-4">
          <TimePicker
            planning={serviceIds.length === 0 ? false : planning}
            slots={availability.data?.slots ?? []}
            loading={availability.isLoading && serviceIds.length > 0}
            timeZone={timeZone}
            slotStart={slotStart}
            onPickSlot={(start) => setValue('slotStart', start)}
            dateField={register('date')}
            timeField={register('time')}
            error={errors.slotStart?.message ?? errors.date?.message ?? errors.time?.message}
          />
        </div>
      </FormSection>

      <div className="space-y-1.5">
        <label htmlFor="notes" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
          Uwagi dla studia (opcjonalnie)
        </label>
        <textarea
          id="notes"
          rows={3}
          placeholder="np. psia sierść na tylnej kanapie"
          className="w-full px-4 py-3.5 bg-white border-2 border-green-deep/10 rounded-xl outline-hidden text-sm focus:border-cream-warm"
          {...register('notes')}
        />
      </div>

      {errors.root && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-xl p-3">
          {errors.root.message}
        </p>
      )}

      <div className="bg-green-deep text-cream-warm rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg font-bold" aria-live="polite">
          {estimate.data
            ? `Szacunkowo ${formatPln(Number(estimate.data.total))} zł${estimate.data.hasUnpricedServices ? ' + wycena części usług' : ''}`
            : 'Wybierz usługi'}
        </p>
        <Button type="submit" size="lg" variant="secondary" icon={Send} loading={submit.isPending}>
          Wyślij zapytanie
        </Button>
      </div>
      <p className="text-xs text-green-light">
        To zapytanie, nie rezerwacja: studio odpowie e-mailem, a termin pojawi się w zakładce „Moje rezerwacje”.
      </p>
    </form>
  );
}
