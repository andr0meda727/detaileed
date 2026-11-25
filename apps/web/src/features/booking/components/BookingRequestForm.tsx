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
import { Alert, Button, FieldError, FormSection, Textarea } from '@detaileed/ui';
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
import { ServiceChecklist } from '@/features/booking/components/ServiceChecklist';
import { TimePicker } from '@/features/booking/components/TimePicker';
import { CarChoice } from '@/features/booking/components/CarChoice';

interface BookingRequestFormProps {
  listing: Listing;
  garage: GarageVehicleDto[];
  initialServiceIds: string[];
  initialSize: VehicleSize;
}

/** Services, car, time and notes, with a live estimate; sends the request and goes to the request history. */
export function BookingRequestForm({ listing, garage, initialServiceIds, initialSize }: BookingRequestFormProps) {
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
    <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
      <FormSection icon={Wrench} title="Usługi">
        <div className="flex flex-col gap-2 p-5">
          <ServiceChecklist
            services={listing.services}
            size={size}
            selected={serviceIds}
            onChange={(ids) => setValue('serviceIds', ids, { shouldDirty: true })}
            errorId={errors.serviceIds ? 'services-error' : undefined}
          />
          <FieldError id="services-error">{errors.serviceIds?.message}</FieldError>
        </div>
      </FormSection>

      <FormSection icon={Car} title="Auto">
        <div className="flex flex-col gap-3 p-5">
          {garage.length > 0 && (
            <CarChoice
              garage={garage}
              value={vehicleChoice}
              onChange={(v) => setValue('vehicleChoice', v, { shouldDirty: true })}
              errorId={errors.vehicleChoice ? 'car-error' : undefined}
              invalid={!!errors.vehicleChoice}
            />
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
          <FieldError id="car-error">{errors.vehicleChoice?.message}</FieldError>
        </div>
      </FormSection>

      <FormSection icon={Clock} title="Termin">
        <div className="p-5">
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

      <Textarea
        id="notes"
        label="Uwagi dla studia (opcjonalnie)"
        rows={3}
        placeholder="np. psia sierść na tylnej kanapie"
        error={errors.notes?.message}
        {...register('notes')}
      />

      {errors.root && <Alert tone="danger">{errors.root.message}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-5">
        <div aria-live="polite">
          <p className="text-sm text-muted-foreground">{estimate.data ? 'Szacunkowo' : 'Wybierz usługi'}</p>
          {estimate.data && (
            <p className="font-mono text-2xl font-medium tracking-tight tabular-nums text-foreground">
              {formatPln(Number(estimate.data.total))} zł
              {estimate.data.hasUnpricedServices && (
                <span className="font-sans text-sm font-normal text-muted-foreground"> + wycena części usług</span>
              )}
            </p>
          )}
        </div>
        <Button type="submit" size="lg" icon={Send} loading={submit.isPending}>
          Wyślij zapytanie
        </Button>
      </div>
      <p className="text-xs text-faint">
        To zapytanie, nie rezerwacja: studio odpowie e-mailem, a termin pojawi się w zakładce „Moje rezerwacje”.
      </p>
    </form>
  );
}
