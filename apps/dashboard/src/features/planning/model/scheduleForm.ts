import { z } from 'zod';
import { DayOfWeek } from '@detaileed/api-client';
import { toHms, type Schedule, type ScheduleInput } from '@/features/planning/model/types';

/** Weekdays Monday first, with Polish names. */
export const WEEKDAYS: { day: DayOfWeek; label: string }[] = [
  { day: DayOfWeek.Monday, label: 'Poniedziałek' },
  { day: DayOfWeek.Tuesday, label: 'Wtorek' },
  { day: DayOfWeek.Wednesday, label: 'Środa' },
  { day: DayOfWeek.Thursday, label: 'Czwartek' },
  { day: DayOfWeek.Friday, label: 'Piątek' },
  { day: DayOfWeek.Saturday, label: 'Sobota' },
  { day: DayOfWeek.Sunday, label: 'Niedziela' },
];

export const SLOT_STEPS = ['15', '30', '60'] as const;

const time = z.string().regex(/^\d{2}:\d{2}$/, 'Podaj godzinę');
const period = z
  .object({ opens: time, closes: time })
  .refine((p) => p.closes > p.opens, { path: ['closes'], message: 'Zamknięcie po otwarciu' });

/** Periods of one day must not overlap (several periods = a break between them). */
const dayPeriods = z.array(period).superRefine((periods, ctx) => {
  const sorted = [...periods].map((p, i) => ({ ...p, i })).sort((a, b) => a.opens.localeCompare(b.opens));
  for (let k = 1; k < sorted.length; k++) {
    if (sorted[k].opens < sorted[k - 1].closes) {
      ctx.addIssue({ code: 'custom', path: [sorted[k].i, 'opens'], message: 'Nachodzi na inny przedział' });
    }
  }
});

const int = (min: number, max: number, message: string) =>
  z
    .string()
    .trim()
    .regex(/^\d+$/, message)
    .refine((v) => Number(v) >= min && Number(v) <= max, message);
const factor = z
  .string()
  .trim()
  .regex(/^\d+([.,]\d{1,2})?$/, 'Np. 1,25')
  .refine((v) => {
    const n = Number(v.replace(',', '.'));
    return n >= 0.1 && n <= 5;
  }, 'Od 0,1 do 5');

export const scheduleFormSchema = z.object({
  days: z.object(Object.fromEntries(WEEKDAYS.map((w) => [w.day, dayPeriods])) as Record<DayOfWeek, typeof dayPeriods>),
  bufferMinutes: int(0, 240, 'Od 0 do 240 minut'),
  slotStepMinutes: z.enum(SLOT_STEPS),
  minLeadHours: int(0, 720, 'Od 0 do 720 godzin'),
  multipliers: z.object({ small: factor, medium: factor, large: factor, xl: factor }),
});

export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

const decimalText = (n: number) => String(n).replace('.', ',');

export function scheduleFormDefaults(schedule: Schedule): ScheduleFormValues {
  const days = Object.fromEntries(
    WEEKDAYS.map((w) => [
      w.day,
      schedule.openingHours.filter((p) => p.day === w.day).map((p) => ({ opens: p.opens, closes: p.closes })),
    ]),
  ) as ScheduleFormValues['days'];
  const step = String(schedule.slotStepMinutes);
  return {
    days,
    bufferMinutes: String(schedule.bufferMinutes),
    slotStepMinutes: (SLOT_STEPS as readonly string[]).includes(step)
      ? (step as ScheduleFormValues['slotStepMinutes'])
      : '15',
    minLeadHours: String(schedule.minLeadHours),
    multipliers: {
      small: decimalText(schedule.durationMultipliers.small),
      medium: decimalText(schedule.durationMultipliers.medium),
      large: decimalText(schedule.durationMultipliers.large),
      xl: decimalText(schedule.durationMultipliers.xl),
    },
  };
}

const num = (v: string) => Number(v.trim().replace(',', '.'));

/** Body of `PUT /api/schedule`; no opening hours switches planning off. */
export function toScheduleRequest(values: ScheduleFormValues): ScheduleInput {
  return {
    openingHours: WEEKDAYS.flatMap((w) =>
      values.days[w.day].map((p) => ({ day: w.day, opens: toHms(p.opens), closes: toHms(p.closes) })),
    ),
    bufferMinutes: num(values.bufferMinutes),
    slotStepMinutes: num(values.slotStepMinutes),
    minLeadHours: num(values.minLeadHours),
    durationMultipliers: {
      small: num(values.multipliers.small),
      medium: num(values.multipliers.medium),
      large: num(values.multipliers.large),
      xl: num(values.multipliers.xl),
    },
  };
}
