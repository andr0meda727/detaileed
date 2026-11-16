import type {
  BayDto,
  DayBoardDto,
  DayOfWeek,
  ScheduleDto,
  ScheduleRequest,
  StaffAvailabilityDto,
} from '@detaileed/api-client';

export type Bay = BayDto;

export interface OpeningPeriod {
  day: DayOfWeek;
  /** Studio-local `HH:mm`. */
  opens: string;
  closes: string;
}

export interface SizeMultipliers {
  small: number;
  medium: number;
  large: number;
  xl: number;
}

/** The studio's planning setup, with times as `HH:mm` and numbers as numbers. */
export interface Schedule {
  /** True once the studio has opening hours and at least one active bay. */
  planningEnabled: boolean;
  openingHours: OpeningPeriod[];
  closures: { date: string; reason: string | null }[];
  bufferMinutes: number;
  slotStepMinutes: number;
  minLeadHours: number;
  durationMultipliers: SizeMultipliers;
}

export type ScheduleInput = ScheduleRequest;

export interface BoardBooking {
  id: string;
  start: string;
  end: string;
  clientName: string;
  vehicleLicensePlate: string;
  status: string;
}

/** One day of the studio: per bay its bookings and free gaps, plus unassigned bookings and pending requests. */
export interface DayBoard {
  date: string;
  planningEnabled: boolean;
  openMinutes: number;
  utilisationPercent: number;
  bays: {
    bayId: string;
    name: string;
    bookings: BoardBooking[];
    freeGaps: { start: string; end: string; minutes: number }[];
    utilisationPercent: number;
  }[];
  unassigned: BoardBooking[];
  pendingRequests: { id: string; preferredAt: string; customerName: string; vehicleLicensePlate: string }[];
}

export interface StaffAvailability {
  planningEnabled: boolean;
  durationMinutes: number;
  slots: { start: string; end: string; suggestedBayId: string; suggestedBayName: string; freeBays: number }[];
}

/** `"08:00:00"` → `"08:00"`. */
export const toHm = (time: string) => time.slice(0, 5);
/** `"08:00"` → `"08:00:00"`, as the API takes times of day. */
export const toHms = (hm: string) => (hm.length === 5 ? `${hm}:00` : hm);

const multipliers = (m: {
  small: number | string;
  medium: number | string;
  large: number | string;
  xl: number | string;
}) => ({
  small: Number(m.small),
  medium: Number(m.medium),
  large: Number(m.large),
  xl: Number(m.xl),
});

export function toSchedule(dto: ScheduleDto): Schedule {
  return {
    planningEnabled: dto.planningEnabled,
    openingHours: dto.openingHours.map((p) => ({ day: p.day, opens: toHm(p.opens), closes: toHm(p.closes) })),
    closures: dto.closures,
    bufferMinutes: Number(dto.bufferMinutes),
    slotStepMinutes: Number(dto.slotStepMinutes),
    minLeadHours: Number(dto.minLeadHours),
    durationMultipliers: multipliers(dto.durationMultipliers),
  };
}

export function toDayBoard(dto: DayBoardDto): DayBoard {
  return {
    date: dto.date,
    planningEnabled: dto.planningEnabled,
    openMinutes: Number(dto.openMinutes),
    utilisationPercent: Number(dto.utilisationPercent),
    bays: dto.bays.map((b) => ({
      bayId: b.bayId,
      name: b.name,
      bookings: b.bookings,
      freeGaps: b.freeGaps.map((g) => ({ start: g.start, end: g.end, minutes: Number(g.minutes) })),
      utilisationPercent: Number(b.utilisationPercent),
    })),
    unassigned: dto.unassigned,
    pendingRequests: dto.pendingRequests,
  };
}

export function toStaffAvailability(dto: StaffAvailabilityDto): StaffAvailability {
  return {
    planningEnabled: dto.planningEnabled,
    durationMinutes: Number(dto.durationMinutes),
    slots: dto.slots.map((s) => ({ ...s, freeBays: Number(s.freeBays) })),
  };
}
