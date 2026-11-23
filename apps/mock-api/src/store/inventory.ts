import type { VehicleSize } from '@detaileed/api-client';
import { newId } from './ids.ts';
import { db } from './store.ts';
import type { Booking, Consumption, InventoryItem, SizeMultipliers, StockMovement } from './types.ts';

/** How much more (or less) material a car of each size uses than a medium one. */
export function sizeFactorsOf(studioId: string): SizeMultipliers {
  let factors = db().sizeFactors.find((f) => f.studioId === studioId);
  if (!factors) {
    factors = { studioId, small: 0.8, medium: 1, large: 1.25, xl: 1.5 };
    db().sizeFactors.push(factors);
  }
  return factors;
}

export function sizeFactor(studioId: string, size: VehicleSize): number {
  const f = sizeFactorsOf(studioId);
  return { Small: f.small, Medium: f.medium, Large: f.large, XL: f.xl }[size];
}

/** Rounds stock quantities to three decimals, as the API stores them. */
export const qty = (n: number) => Math.round(n * 1000) / 1000;

export function addMovement(item: InventoryItem, movement: Omit<StockMovement, 'id' | 'itemId'>) {
  item.stock = qty(item.stock + movement.quantity);
  db().movements.push({ id: newId(), itemId: item.id, ...movement, quantity: qty(movement.quantity) });
}

/** What the booking's services use by their recipes, for this car size. */
export function estimateLines(booking: Booking, size: VehicleSize): Consumption['lines'] {
  const factor = sizeFactor(booking.studioId, size);
  return booking.serviceIds.flatMap((serviceId) => {
    const recipe = db().recipes.find((r) => r.serviceId === serviceId && r.studioId === booking.studioId);
    return (recipe?.lines ?? []).map((line) => ({
      serviceId,
      itemId: line.itemId,
      baseQuantity: line.quantityForMedium,
      estimatedQuantity: qty(line.quantityForMedium * factor),
      actualQuantity: null,
    }));
  });
}

/**
 * Records what a completed visit used: one consumption movement per material, by the recipes. Visits whose
 * services have no recipes record nothing (the API then answers `CONSUMPTION_NOT_FOUND`).
 */
export function recordConsumption(booking: Booking): Consumption | null {
  const state = db();
  if (state.consumptions.some((c) => c.bookingId === booking.id)) return null;
  const size = state.vehicles.find((v) => v.id === booking.vehicleId)?.size ?? 'Medium';
  const lines = estimateLines(booking, size);
  if (lines.length === 0) return null;
  const completedAt = booking.completedAt ?? new Date().toISOString();
  const consumption: Consumption = {
    bookingId: booking.id,
    studioId: booking.studioId,
    vehicleSize: size,
    completedAt,
    lines,
  };
  state.consumptions.push(consumption);
  for (const line of lines) {
    const item = state.inventory.find((i) => i.id === line.itemId);
    if (!item) continue;
    addMovement(item, {
      type: 'Consumption',
      quantity: -line.estimatedQuantity,
      bookingId: booking.id,
      note: null,
      createdBy: null,
      createdAt: completedAt,
    });
  }
  return consumption;
}

/** Sets what a visit really used; the difference to what was booked becomes a correction movement. */
export function correctConsumption(
  consumption: Consumption,
  actuals: { serviceId: string; itemId: string; actualQuantity: number }[],
  by: string | null,
  at = new Date().toISOString(),
) {
  for (const actual of actuals) {
    const line = consumption.lines.find((l) => l.serviceId === actual.serviceId && l.itemId === actual.itemId);
    if (!line) continue;
    const before = line.actualQuantity ?? line.estimatedQuantity;
    line.actualQuantity = qty(actual.actualQuantity);
    const item = db().inventory.find((i) => i.id === line.itemId);
    if (item && before !== line.actualQuantity) {
      addMovement(item, {
        type: 'Correction',
        quantity: before - line.actualQuantity,
        bookingId: consumption.bookingId,
        note: 'Korekta zużycia po wizycie',
        createdBy: by,
        createdAt: at,
      });
    }
  }
}
