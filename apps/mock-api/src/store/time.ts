import { addDays, todayInZone, zonedToUtc } from '@detaileed/domain/studioTime';

/** Every sample studio works in Polish time. */
export const TZ = 'Europe/Warsaw';

/** Today in Warsaw, `yyyy-MM-dd`. */
export const today = () => todayInZone(TZ);

/** The UTC moment (ISO with `Z`) of `HH:mm` Warsaw time, `offset` days from `day`. */
export const at = (day: string, offset: number, time: string) => zonedToUtc(addDays(day, offset), time, TZ);

/** A UTC moment `minutes` after another. */
export const plusMinutes = (moment: string, minutes: number) =>
  new Date(new Date(moment).getTime() + minutes * 60_000).toISOString();
