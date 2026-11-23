import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { Calendar } from 'lucide-react';
import { FieldError, FormInput, FormSection } from '@detaileed/ui';
import type { BookingFormValues } from '@/features/bookings/model/schemas';

interface BookingScheduleSectionProps {
  control: Control<BookingFormValues>;
  errors: FieldErrors<BookingFormValues>;
}

/** Price and date/time of the booking. `scheduledAt` is one `YYYY-MM-DDTHH:mm` value split into two inputs. */
export function BookingScheduleSection({ control, errors }: BookingScheduleSectionProps) {
  return (
    <FormSection icon={Calendar} title="Termin i cena">
      <div className="grid gap-4 p-5 sm:grid-cols-3">
        <Controller
          name="priceInput"
          control={control}
          render={({ field }) => (
            <FormInput
              {...field}
              label="Cena netto"
              inputMode="decimal"
              error={errors.priceInput?.message}
              rightIcon={<span className="text-xs">zł</span>}
              className="font-mono tabular-nums"
            />
          )}
        />
        <Controller
          name="scheduledAt"
          control={control}
          render={({ field }) => {
            const [date, time] = field.value.split('T');
            const errorId = 'booking-scheduled-at-error';
            const describedBy = errors.scheduledAt ? errorId : undefined;
            return (
              <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                <FormInput
                  type="date"
                  label="Data"
                  value={date || ''}
                  onChange={(e) => field.onChange(`${e.target.value}T${time}`)}
                  aria-describedby={describedBy}
                  aria-invalid={errors.scheduledAt ? true : undefined}
                  className="font-mono tabular-nums"
                />
                <FormInput
                  type="time"
                  label="Godzina"
                  value={time || ''}
                  onChange={(e) => field.onChange(`${date}T${e.target.value}`)}
                  aria-describedby={describedBy}
                  aria-invalid={errors.scheduledAt ? true : undefined}
                  className="font-mono tabular-nums"
                />
                <FieldError id={errorId} className="col-span-2">
                  {errors.scheduledAt?.message}
                </FieldError>
              </div>
            );
          }}
        />
      </div>
    </FormSection>
  );
}
