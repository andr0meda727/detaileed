import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import { Button, FieldError, FormInput, Switch } from '@detaileed/ui';
import type { DayOfWeek } from '@detaileed/api-client';
import type { ScheduleFormValues } from '@/features/planning/model/scheduleForm';

interface DayHoursProps {
  day: DayOfWeek;
  label: string;
  control: Control<ScheduleFormValues>;
  register: UseFormRegister<ScheduleFormValues>;
  errors?: FieldErrors<ScheduleFormValues>['days'];
}

/** One weekday's opening periods; several periods make a break, none means closed. */
export function DayHours({ day, label, control, register, errors }: DayHoursProps) {
  const { fields, append, remove } = useFieldArray({ control, name: `days.${day}` });
  const dayErrors = errors?.[day];
  const isOpen = fields.length > 0;

  return (
    <div className="flex flex-col gap-2 border-b border-border py-3 last:border-0 sm:flex-row sm:items-start">
      <div className="flex h-9 shrink-0 items-center gap-3 sm:w-40">
        <Switch
          aria-label={`${label}: otwarte`}
          checked={isOpen}
          onCheckedChange={(checked) => (checked ? append({ opens: '08:00', closes: '16:00' }) : remove())}
        />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <div className="flex flex-1 flex-col gap-1">
        {!isOpen && <p className="flex h-9 items-center text-sm text-faint">Zamknięte</p>}
        {fields.map((field, i) => {
          const err = Array.isArray(dayErrors) ? dayErrors[i] : undefined;
          const message = err?.opens?.message ?? err?.closes?.message;
          const errorId = `hours-${day}-${i}-error`;
          return (
            <div key={field.id} className="flex flex-col gap-1">
              <div className="flex flex-wrap items-start gap-2">
                <div className="w-32">
                  <FormInput
                    type="time"
                    aria-label={`${label}: otwarcie`}
                    aria-invalid={message ? true : undefined}
                    aria-describedby={message ? errorId : undefined}
                    className="font-mono tabular-nums"
                    {...register(`days.${day}.${i}.opens`)}
                  />
                </div>
                <span className="flex h-9 items-center text-faint" aria-hidden>
                  –
                </span>
                <div className="w-32">
                  <FormInput
                    type="time"
                    aria-label={`${label}: zamknięcie`}
                    aria-invalid={message ? true : undefined}
                    aria-describedby={message ? errorId : undefined}
                    className="font-mono tabular-nums"
                    {...register(`days.${day}.${i}.closes`)}
                  />
                </div>
                <div className="flex h-9 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={X}
                    aria-label={`${label}: usuń przedział`}
                    onClick={() => remove(i)}
                  />
                  {/* Another period after the last one makes a break. */}
                  {i === fields.length - 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Plus}
                      onClick={() => append({ opens: '13:00', closes: '17:00' })}
                    >
                      Dodaj przedział (przerwa)
                    </Button>
                  )}
                </div>
              </div>
              <FieldError id={errorId} className="-mt-4">
                {message}
              </FieldError>
            </div>
          );
        })}
      </div>
    </div>
  );
}
