import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import type { DayOfWeek } from '@detaileed/api-client';
import type { ScheduleFormValues } from '@/features/planning/model/scheduleForm';

interface DayHoursProps {
  day: DayOfWeek;
  label: string;
  control: Control<ScheduleFormValues>;
  register: UseFormRegister<ScheduleFormValues>;
  errors?: FieldErrors<ScheduleFormValues>['days'];
}

const timeClass =
  'px-3 py-2 bg-slate-50 rounded-lg font-semibold text-sm outline-hidden border-2 border-transparent focus:border-cream-warm/50';

/** One weekday's opening periods; several periods make a break, none means closed. */
export default function DayHours({ day, label, control, register, errors }: DayHoursProps) {
  const { fields, append, remove } = useFieldArray({ control, name: `days.${day}` });
  const dayErrors = errors?.[day];

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 py-3 border-b border-slate-100 last:border-0">
      <p className="sm:w-32 shrink-0 pt-2 font-semibold text-green-deep">{label}</p>
      <div className="flex-1 space-y-2">
        {fields.length === 0 && <p className="pt-2 text-sm text-slate-400">Zamknięte</p>}
        {fields.map((field, i) => {
          const err = Array.isArray(dayErrors) ? dayErrors[i] : undefined;
          return (
            <div key={field.id} className="flex items-center gap-2 flex-wrap">
              <input
                type="time"
                aria-label={`${label}: otwarcie`}
                className={timeClass}
                {...register(`days.${day}.${i}.opens`)}
              />
              <span className="text-slate-400">–</span>
              <input
                type="time"
                aria-label={`${label}: zamknięcie`}
                className={timeClass}
                {...register(`days.${day}.${i}.closes`)}
              />
              <button
                type="button"
                aria-label={`${label}: usuń przedział`}
                onClick={() => remove(i)}
                className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600"
              >
                <X size={15} />
              </button>
              {(err?.opens?.message || err?.closes?.message) && (
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                  {err?.opens?.message ?? err?.closes?.message}
                </span>
              )}
            </div>
          );
        })}
        <button
          type="button"
          onClick={() =>
            append(fields.length ? { opens: '13:00', closes: '17:00' } : { opens: '08:00', closes: '16:00' })
          }
          className="flex items-center gap-1.5 text-xs font-bold text-green-light hover:text-green-deep"
        >
          <Plus size={13} /> {fields.length ? 'Dodaj przedział (przerwa)' : 'Otwarte w ten dzień'}
        </button>
      </div>
    </div>
  );
}
