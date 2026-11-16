import { dayInZone, formatDay, timeInZone } from '@detaileed/domain/studioTime';

export interface SlotDay {
  /** The studio day, `yyyy-MM-dd`. */
  day: string;
  /** "pon., 16 lis" */
  label: string;
  slots: { start: string; time: string }[];
}

/** Free slots (UTC moments) grouped by the studio's day, in order, with the local start time. */
export function groupSlotsByDay(slots: { start: string }[], timeZone: string): SlotDay[] {
  const days = new Map<string, SlotDay>();
  for (const slot of [...slots].sort((a, b) => a.start.localeCompare(b.start))) {
    const day = dayInZone(slot.start, timeZone);
    if (!days.has(day)) {
      days.set(day, { day, label: formatDay(day, { weekday: 'short', day: 'numeric', month: 'short' }), slots: [] });
    }
    days.get(day)!.slots.push({ start: slot.start, time: timeInZone(slot.start, timeZone) });
  }
  return [...days.values()];
}
