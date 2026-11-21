import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { Calendar } from 'lucide-react';
import { FormSection } from '@detaileed/ui';
import type { BookingFormValues } from '@/features/bookings/model/schemas';

interface BookingScheduleSectionProps {
  control: Control<BookingFormValues>;
  errors: FieldErrors<BookingFormValues>;
}

const errorClass = 'text-red-500 font-bold tracking-widest uppercase text-[10px]';
const labelClass = 'text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1';
const dateTimeClass =
  'w-full px-3 py-4 bg-slate-50 border-2 border-transparent rounded-xl font-bold text-xs outline-hidden focus:border-cream-warm/50 text-green-deep';

/** Price and date/time of the booking. `scheduledAt` is one `YYYY-MM-DDTHH:mm` value split into two inputs. */
export default function BookingScheduleSection({ control, errors }: BookingScheduleSectionProps) {
  return (
    <FormSection icon={Calendar} title="Termin i Cena" tone="amber">
      <div className="p-4 grid grid-cols-2 gap-3">
        <Controller
          name="priceInput"
          control={control}
          render={({ field }) => (
            <div className="col-span-1 flex flex-col gap-1.5">
              <label className={labelClass}>Cena netto</label>
              <div className="relative">
                <input
                  {...field}
                  className="w-full px-4 py-4 rounded-xl font-bold text-lg font-mono text-cream-warm outline-hidden bg-green-deep"
                />
                <span className="absolute right-3 bottom-4 text-[9px] font-bold text-cream-warm/40 uppercase tracking-widest">
                  ZŁ
                </span>
              </div>
              {errors.priceInput && <p className={errorClass}>{errors.priceInput.message}</p>}
            </div>
          )}
        />
        <Controller
          name="scheduledAt"
          control={control}
          render={({ field }) => {
            const [date, time] = field.value.split('T');
            return (
              <div className="col-span-1 grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Data</label>
                  <input
                    type="date"
                    value={date || ''}
                    onChange={(e) => field.onChange(`${e.target.value}T${time}`)}
                    className={dateTimeClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Godzina</label>
                  <input
                    type="time"
                    value={time || ''}
                    onChange={(e) => field.onChange(`${date}T${e.target.value}`)}
                    className={dateTimeClass}
                  />
                </div>
                {errors.scheduledAt && <p className={`col-span-2 ${errorClass}`}>{errors.scheduledAt.message}</p>}
              </div>
            );
          }}
        />
      </div>
    </FormSection>
  );
}
