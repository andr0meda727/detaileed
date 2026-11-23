import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Copy, Save } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, FormInput, Select, useToast } from '@detaileed/ui';
import { VEHICLE_SIZES } from '@detaileed/domain/vehicleSize';
import { useSaveSchedule } from '@/features/planning/api/planning';
import {
  SLOT_STEPS,
  WEEKDAYS,
  scheduleFormDefaults,
  scheduleFormSchema,
  toScheduleRequest,
  type ScheduleFormValues,
} from '@/features/planning/model/scheduleForm';
import { planningErrorMessage } from '@/features/planning/model/errors';
import type { Schedule } from '@/features/planning/model/types';
import { DayHours } from '@/features/planning/components/settings/DayHours';

const MULTIPLIER_KEYS = { Small: 'small', Medium: 'medium', Large: 'large', XL: 'xl' } as const;
const WORKDAYS = WEEKDAYS.slice(1, 5).map((w) => w.day);

/** Opening hours per weekday and the planning rules (buffer, start grid, lead time, size multipliers). */
export function ScheduleSettings({ schedule, canEdit }: { schedule: Schedule; canEdit: boolean }) {
  const { addToast } = useToast();
  const save = useSaveSchedule();
  const {
    control,
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: scheduleFormDefaults(schedule),
  });

  const copyMonday = () => {
    const monday = getValues('days.Monday');
    for (const day of WORKDAYS)
      setValue(
        `days.${day}`,
        monday.map((p) => ({ ...p })),
        { shouldDirty: true },
      );
  };

  const onSubmit = (values: ScheduleFormValues) =>
    save.mutate(toScheduleRequest(values), {
      onSuccess: () => addToast('Zapisano godziny i zasady planowania.', 'success'),
      onError: (err) => addToast(planningErrorMessage(err, 'Nie udało się zapisać godzin.'), 'error'),
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <fieldset disabled={!canEdit} className="flex flex-col gap-6">
        <Card>
          <CardHeader
            title="Godziny otwarcia"
            actions={
              canEdit && (
                <Button variant="ghost" size="sm" icon={Copy} onClick={copyMonday}>
                  Pon. na wt.–pt.
                </Button>
              )
            }
          />
          <div className="px-5 py-2">
            {WEEKDAYS.map((w) => (
              <DayHours
                key={w.day}
                day={w.day}
                label={w.label}
                control={control}
                register={register}
                errors={errors.days}
              />
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Zasady planowania" />
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-x-4 sm:grid-cols-3">
              <FormInput
                label="Bufor między wizytami (min)"
                inputMode="numeric"
                error={errors.bufferMinutes?.message}
                {...register('bufferMinutes')}
              />
              <Select
                label="Starty wizyt co"
                options={SLOT_STEPS.map((s) => ({ value: s, label: `${s} min` }))}
                {...register('slotStepMinutes')}
              />
              <FormInput
                label="Wyprzedzenie dla klientów (h)"
                inputMode="numeric"
                error={errors.minLeadHours?.message}
                {...register('minLeadHours')}
              />
            </div>
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-3 text-sm font-medium text-foreground">
                Czas wizyty wg wielkości auta (× czas dla średniego)
              </legend>
              <div className="grid grid-cols-2 gap-x-4 sm:grid-cols-4">
                {VEHICLE_SIZES.map((size) => {
                  const key = MULTIPLIER_KEYS[size.value];
                  return (
                    <FormInput
                      key={size.value}
                      label={size.short}
                      inputMode="decimal"
                      className="font-mono tabular-nums"
                      error={errors.multipliers?.[key]?.message}
                      {...register(`multipliers.${key}`)}
                    />
                  );
                })}
              </div>
            </fieldset>
          </CardContent>
        </Card>
      </fieldset>

      {canEdit && (
        <div className="flex justify-end">
          <Button type="submit" icon={Save} loading={save.isPending}>
            Zapisz godziny i zasady
          </Button>
        </div>
      )}
    </form>
  );
}
