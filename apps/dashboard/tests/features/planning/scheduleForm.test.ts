import { describe, expect, it } from 'vitest';
import { scheduleFormDefaults, scheduleFormSchema, toScheduleRequest } from '@/features/planning/model/scheduleForm';
import type { Schedule } from '@/features/planning/model/types';

const schedule: Schedule = {
  planningEnabled: true,
  openingHours: [
    { day: 'Monday', opens: '08:00', closes: '12:00' },
    { day: 'Monday', opens: '13:00', closes: '17:00' },
    { day: 'Saturday', opens: '09:00', closes: '13:00' },
  ],
  closures: [],
  bufferMinutes: 15,
  slotStepMinutes: 30,
  minLeadHours: 12,
  durationMultipliers: { small: 0.85, medium: 1, large: 1.25, xl: 1.5 },
};

describe('schedule form', () => {
  it('fills the days from the opening hours', () => {
    const values = scheduleFormDefaults(schedule);
    expect(values.days.Monday).toEqual([
      { opens: '08:00', closes: '12:00' },
      { opens: '13:00', closes: '17:00' },
    ]);
    expect(values.days.Sunday).toEqual([]);
    expect(values.multipliers.large).toBe('1,25');
    expect(values.slotStepMinutes).toBe('30');
  });

  it('round-trips to the request with times as HH:mm:ss, Monday first', () => {
    const body = toScheduleRequest(scheduleFormDefaults(schedule));
    expect(body.openingHours).toEqual([
      { day: 'Monday', opens: '08:00:00', closes: '12:00:00' },
      { day: 'Monday', opens: '13:00:00', closes: '17:00:00' },
      { day: 'Saturday', opens: '09:00:00', closes: '13:00:00' },
    ]);
    expect(body).toMatchObject({ bufferMinutes: 15, slotStepMinutes: 30, minLeadHours: 12 });
    expect(body.durationMultipliers).toEqual({ small: 0.85, medium: 1, large: 1.25, xl: 1.5 });
  });

  it('rejects overlapping and reversed periods and bad rules', () => {
    const values = scheduleFormDefaults(schedule);
    expect(scheduleFormSchema.safeParse(values).success).toBe(true);

    const overlap = {
      ...values,
      days: {
        ...values.days,
        Monday: [
          { opens: '08:00', closes: '12:00' },
          { opens: '11:00', closes: '15:00' },
        ],
      },
    };
    expect(scheduleFormSchema.safeParse(overlap).error?.issues[0].message).toBe('Nachodzi na inny przedział');

    const reversed = { ...values, days: { ...values.days, Friday: [{ opens: '16:00', closes: '08:00' }] } };
    expect(scheduleFormSchema.safeParse(reversed).error?.issues[0].message).toBe('Zamknięcie po otwarciu');

    expect(scheduleFormSchema.safeParse({ ...values, bufferMinutes: '-5' }).success).toBe(false);
    expect(scheduleFormSchema.safeParse({ ...values, multipliers: { ...values.multipliers, xl: '9' } }).success).toBe(
      false,
    );
  });
});
