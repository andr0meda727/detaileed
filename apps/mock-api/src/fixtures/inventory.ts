import { stableId } from '../store/ids.ts';
import { addMovement, correctConsumption, qty, recordConsumption } from '../store/inventory.ts';
import { db } from '../store/store.ts';
import { at } from '../store/time.ts';
import type { InventoryCategory, InventoryItem, Recipe } from '../store/types.ts';
import { random } from './bookings.ts';
import { serviceId } from './services.ts';
import { STUDIO } from './studios.ts';

const CATEGORIES: [key: string, name: string][] = [
  ['wash', 'Chemia myjąca'],
  ['polish', 'Polerowanie'],
  ['protection', 'Powłoki i ochrona'],
  ['accessories', 'Akcesoria'],
];

type ItemRow = [
  key: string,
  category: string,
  name: string,
  unit: string,
  stock: number,
  min: number | null,
  note?: string,
];

/** Final stock levels; four of them below the minimum, so "low stock" screens have something to show. */
const ITEMS: ItemRow[] = [
  ['foam', 'wash', 'Aktywna piana', 'L', 4.2, 10, 'Koncentrat 1:10, kanister 20 L'],
  ['shampoo', 'wash', 'Szampon pH neutralny', 'L', 18.5, 5],
  ['rims', 'wash', 'Środek do czyszczenia felg', 'L', 6, 3],
  ['dressing', 'wash', 'Dressing do opon', 'L', 2.5, 1],
  ['upholstery', 'wash', 'Środek do prania tapicerki', 'L', 7, 3],
  ['leather', 'wash', 'Preparat do skór 2w1', 'ml', 900, 300],
  ['clay', 'polish', 'Glinka lakiernicza', 'szt', 3, 4],
  ['cut', 'polish', 'Pasta polerska Heavy Cut', 'ml', 850, 500],
  ['finish', 'polish', 'Pasta polerska Finish', 'ml', 320, 500],
  ['pads', 'polish', 'Pad polerski średni 150 mm', 'szt', 12, 6],
  ['ceramic', 'protection', 'Powłoka ceramiczna 50 ml', 'szt', 2, 3, 'Zestaw z aplikatorem'],
  ['wax', 'protection', 'Wosk Carnauba', 'ml', 400, 200],
  ['ppf', 'protection', 'Folia PPF błyszcząca', 'm²', 9.5, 6],
  ['towels', 'accessories', 'Ręcznik z mikrofibry 40×40', 'szt', 46, 20],
  ['gloves', 'accessories', 'Rękawice nitrylowe (opak. 100 szt.)', 'szt', 5, null],
];

/** Materials per service for a medium car. */
const RECIPES: Record<string, [item: string, quantity: number][]> = {
  wash: [
    ['foam', 0.15],
    ['shampoo', 0.08],
    ['rims', 0.05],
  ],
  'wash-premium': [
    ['foam', 0.2],
    ['shampoo', 0.1],
    ['wax', 15],
    ['dressing', 0.03],
    ['towels', 1],
  ],
  interior: [['upholstery', 0.05]],
  upholstery: [['upholstery', 0.4]],
  leather: [['leather', 80]],
  'polish-1': [
    ['clay', 0.25],
    ['finish', 40],
    ['pads', 1],
  ],
  'polish-2': [
    ['clay', 0.25],
    ['cut', 60],
    ['finish', 40],
    ['pads', 2],
  ],
  ceramic: [
    ['clay', 0.25],
    ['finish', 20],
    ['ceramic', 1],
    ['towels', 2],
  ],
  ppf: [['ppf', 4.5]],
  tyres: [['dressing', 0.03]],
  rims: [
    ['rims', 0.25],
    ['dressing', 0.02],
  ],
};

export const itemId = (key: string) => stableId(`inventory:${key}`);

export function seedInventoryCategories(): InventoryCategory[] {
  return CATEGORIES.map(([key, name]) => ({ id: stableId(`inventory-category:${key}`), studioId: STUDIO.full, name }));
}

export function seedInventoryItems(): InventoryItem[] {
  return ITEMS.map(([key, category, name, unit, , minStock, description]) => ({
    id: itemId(key),
    studioId: STUDIO.full,
    categoryId: stableId(`inventory-category:${category}`),
    name,
    description: description ?? null,
    unit,
    stock: 0,
    minStock,
  }));
}

export function seedRecipes(): Recipe[] {
  return Object.entries(RECIPES).map(([service, lines]) => ({
    studioId: STUDIO.full,
    serviceId: serviceId(service),
    lines: lines.map(([item, quantityForMedium]) => ({ itemId: itemId(item), quantityForMedium })),
  }));
}

/**
 * The stock ledger behind the final levels: what every completed visit used (some corrected by hand), a few
 * deliveries, and the opening balance that makes the numbers add up to the stock in `ITEMS`.
 */
export function seedLedger() {
  const state = db();
  const today = state.today;
  const pick = random(4711);
  const completed = state.bookings
    .filter((b) => b.studioId === STUDIO.full && b.status === 'completed')
    .sort((a, b) => (a.completedAt ?? '').localeCompare(b.completedAt ?? ''));
  for (const booking of completed) {
    const consumption = recordConsumption(booking);
    if (!consumption || pick() > 0.4) continue;
    const actuals = consumption.lines.map((l) => ({
      serviceId: l.serviceId,
      itemId: l.itemId,
      actualQuantity: qty(l.estimatedQuantity * (0.8 + pick() * 0.45)),
    }));
    correctConsumption(consumption, actuals, 'Kamil Nowak', consumption.completedAt);
  }

  for (const [key, , , , target] of ITEMS) {
    const item = state.inventory.find((i) => i.id === itemId(key))!;
    const used = -item.stock;
    let opening = qty(target * 0.6 + used * 0.4);
    let delivered = qty(target + used - opening);
    if (delivered < 0) {
      opening = qty(target + used);
      delivered = 0;
    }
    addMovement(item, {
      type: 'Initial',
      quantity: opening,
      bookingId: null,
      note: 'Stan początkowy',
      createdBy: 'Tomasz Wiśniewski',
      createdAt: at(today, -60, '08:00'),
    });
    const deliveries = delivered > 0 ? [0.55, 0.45] : [];
    deliveries.forEach((share, i) =>
      addMovement(item, {
        type: 'Purchase',
        quantity: qty(delivered * share),
        bookingId: null,
        note: i === 0 ? 'Dostawa – faktura FV/2026/1184' : 'Dostawa – faktura FV/2026/1302',
        createdBy: i === 0 ? 'Tomasz Wiśniewski' : 'Anna Kowalczyk',
        createdAt: at(today, i === 0 ? -38 : -12, '09:30'),
      }),
    );
    // Rounding leftovers go into a stocktake, like a real count at the end of the month.
    const drift = qty(target - item.stock);
    if (drift !== 0) {
      addMovement(item, {
        type: 'Adjustment',
        quantity: drift,
        bookingId: null,
        note: 'Inwentaryzacja',
        createdBy: 'Anna Kowalczyk',
        createdAt: at(today, -3, '17:45'),
      });
    }
  }
}
