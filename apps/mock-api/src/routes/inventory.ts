import type {
  AccuracyDto,
  CategoryCreateDto,
  CategoryResponseDto,
  ConsumptionDto,
  CorrectConsumptionRequest,
  ForecastDto,
  InventoryCreateDto,
  InventoryResponseDto,
  RecipeDto,
  RecipeRequest,
  SizeFactorsDto,
  StockChangeRequest,
  StockMovementDto,
} from '@detaileed/api-client';
import { addDays, dayInZone } from '@detaileed/domain/studioTime';
import { fullName } from '../auth/accounts.ts';
import { empty, problem, validationProblem } from '../http.ts';
import { route, type MockRequest, type Route } from '../router.ts';
import { requireManager, requireStudio } from '../store/context.ts';
import { newId } from '../store/ids.ts';
import { addMovement, correctConsumption, estimateLines, qty, sizeFactorsOf } from '../store/inventory.ts';
import { byName, paged } from '../store/paging.ts';
import { db } from '../store/store.ts';
import type { InventoryItem, StockMovement } from '../store/types.ts';

const categoryName = (id: string | null) =>
  id ? (db().inventoryCategories.find((c) => c.id === id)?.name ?? null) : null;

export const toItemDto = (i: InventoryItem) =>
  ({
    id: i.id,
    studioId: i.studioId,
    categoryName: categoryName(i.categoryId),
    name: i.name,
    description: i.description,
    unit: i.unit,
    stock: i.stock,
    minStock: i.minStock,
  }) satisfies InventoryResponseDto;

export const isLow = (i: InventoryItem) => i.minStock !== null && i.stock <= i.minStock;

function findItem(studioId: string, id: string) {
  const item = db().inventory.find((i) => i.id === id && i.studioId === studioId);
  if (!item) throw problem(404, 'INVENTORY_ITEM_NOT_FOUND', 'Nie znaleziono pozycji magazynu.');
  return item;
}

function findCategory(studioId: string, id: string) {
  const category = db().inventoryCategories.find((c) => c.id === id && c.studioId === studioId);
  if (!category) throw problem(404, 'CATEGORY_NOT_FOUND', 'Nie znaleziono kategorii.');
  return category;
}

function readCategoryName(body: CategoryCreateDto | undefined) {
  const name = body?.name?.trim();
  if (!name) throw validationProblem({ Name: ['Podaj nazwę kategorii.'] });
  return name;
}

function readItem(studioId: string, body: InventoryCreateDto) {
  const errors: Record<string, string[]> = {};
  if (!body.name?.trim()) errors.Name = ['Podaj nazwę produktu.'];
  if (!body.unit?.trim()) errors.Unit = ['Podaj jednostkę.'];
  const stock = Number(body.stock ?? 0);
  const minStock =
    body.minStock === null || body.minStock === undefined || body.minStock === '' ? null : Number(body.minStock);
  if (!(stock >= 0)) errors.Stock = ['Stan nie może być ujemny.'];
  if (minStock !== null && !(minStock >= 0)) errors.MinStock = ['Minimum nie może być ujemne.'];
  if (Object.keys(errors).length) throw validationProblem(errors);
  if (body.categoryId) findCategory(studioId, body.categoryId);
  return {
    categoryId: body.categoryId || null,
    name: body.name!.trim(),
    description: body.description?.trim() || null,
    unit: body.unit!.trim(),
    stock: qty(stock),
    minStock,
  };
}

const toMovementDto = (m: StockMovement) =>
  ({
    id: m.id,
    type: m.type,
    quantity: m.quantity,
    bookingId: m.bookingId,
    note: m.note,
    createdBy: m.createdBy,
    createdAt: m.createdAt,
  }) satisfies StockMovementDto;

function findCompletedBooking(studioId: string, bookingId: string) {
  const booking = db().bookings.find((b) => b.id === bookingId && b.studioId === studioId);
  if (!booking) throw problem(404, 'BOOKING_NOT_FOUND', 'Nie znaleziono rezerwacji.');
  return booking;
}

function toConsumptionDto(bookingId: string, studioId: string): ConsumptionDto {
  const consumption = db().consumptions.find((c) => c.bookingId === bookingId && c.studioId === studioId);
  if (!consumption) throw problem(404, 'CONSUMPTION_NOT_FOUND', 'Zużycie tej wizyty nie zostało jeszcze zapisane.');
  return {
    bookingId: consumption.bookingId,
    vehicleSize: consumption.vehicleSize,
    completedAt: consumption.completedAt,
    lines: consumption.lines.map((l) => {
      const item = db().inventory.find((i) => i.id === l.itemId);
      return { ...l, itemName: item?.name ?? 'Usunięty produkt', unit: item?.unit ?? '' };
    }),
  };
}

/** How well the recipes match what visits really used, per service and material. */
function accuracy(req: MockRequest): AccuracyDto[] {
  const { studio } = requireStudio(req);
  const state = db();
  return state.recipes
    .filter((r) => r.studioId === studio.id)
    .flatMap((recipe) =>
      recipe.lines.map((line) => {
        const samples = state.consumptions
          .filter((c) => c.studioId === studio.id)
          .flatMap((c) => c.lines)
          .filter((l) => l.serviceId === recipe.serviceId && l.itemId === line.itemId && l.actualQuantity !== null);
        const ratio =
          samples.reduce((sum, l) => sum + l.actualQuantity! / l.estimatedQuantity, 0) / (samples.length || 1);
        const mape =
          samples.length === 0
            ? null
            : (samples.reduce(
                (sum, l) => sum + Math.abs(l.actualQuantity! - l.estimatedQuantity) / l.actualQuantity!,
                0,
              ) /
                samples.length) *
              100;
        return {
          serviceId: recipe.serviceId,
          itemId: line.itemId,
          itemName: state.inventory.find((i) => i.id === line.itemId)?.name ?? 'Usunięty produkt',
          factor: samples.length ? Math.round(ratio * 100) / 100 : 1,
          factorApplied: samples.length >= 5,
          samples: samples.length,
          meanAbsolutePercentageError: mape === null ? null : Math.round(mape * 10) / 10,
        };
      }),
    );
}

/** Daily use over the last four weeks and what the next two weeks' bookings will take. */
function forecast(req: MockRequest): ForecastDto[] {
  const { studio } = requireStudio(req);
  const state = db();
  const since = new Date(Date.now() - 28 * 86_400_000).toISOString();
  const today = dayInZone(new Date(), studio.timeZone);
  const horizon = addDays(today, 14);
  const upcoming = state.bookings.filter(
    (b) =>
      b.studioId === studio.id &&
      b.status === 'created' &&
      dayInZone(b.scheduledAt, studio.timeZone) >= today &&
      dayInZone(b.scheduledAt, studio.timeZone) <= horizon,
  );
  return state.inventory
    .filter((i) => i.studioId === studio.id)
    .sort(byName)
    .map((item) => {
      const used = -state.movements
        .filter(
          (m) => m.itemId === item.id && (m.type === 'Consumption' || m.type === 'Correction') && m.createdAt >= since,
        )
        .reduce((sum, m) => sum + m.quantity, 0);
      const averageDailyUse = qty(Math.max(0, used) / 28);
      const plannedUse = qty(
        upcoming
          .flatMap((b) => estimateLines(b, state.vehicles.find((v) => v.id === b.vehicleId)?.size ?? 'Medium'))
          .filter((l) => l.itemId === item.id)
          .reduce((sum, l) => sum + l.estimatedQuantity, 0),
      );
      const daysLeft = averageDailyUse > 0 ? Math.round((item.stock / averageDailyUse) * 10) / 10 : null;
      return {
        itemId: item.id,
        name: item.name,
        unit: item.unit,
        stock: item.stock,
        minStock: item.minStock,
        averageDailyUse,
        daysLeft,
        plannedUse,
        stockAfterPlanned: qty(item.stock - plannedUse),
        runsOutAt: daysLeft === null ? null : new Date(Date.now() + daysLeft * 86_400_000).toISOString(),
        isLowStock: isLow(item),
      };
    });
}

function recipeDto(studioId: string, serviceId: string): RecipeDto {
  if (!db().services.some((s) => s.id === serviceId && s.studioId === studioId)) {
    throw problem(404, 'SERVICE_NOT_FOUND', 'Nie znaleziono usługi.');
  }
  const recipe = db().recipes.find((r) => r.serviceId === serviceId && r.studioId === studioId);
  return {
    serviceId,
    lines: (recipe?.lines ?? []).map((l) => {
      const item = db().inventory.find((i) => i.id === l.itemId);
      return { ...l, itemName: item?.name ?? 'Usunięty produkt', unit: item?.unit ?? '' };
    }),
  };
}

function readFactors(body: SizeFactorsDto) {
  const f = {
    small: Number(body?.small),
    medium: Number(body?.medium),
    large: Number(body?.large),
    xl: Number(body?.xl),
  };
  if (!Object.values(f).every((x) => x >= 0.1 && x <= 5)) {
    throw validationProblem({ SizeFactors: ['Współczynniki muszą być między 0,1 a 5.'] });
  }
  return f;
}

export const inventoryRoutes: Route[] = [
  route('GET', '/api/inventory-categories', (req) => {
    const { studio } = requireStudio(req);
    return db()
      .inventoryCategories.filter((c) => c.studioId === studio.id)
      .sort(byName)
      .map((c) => ({ id: c.id, name: c.name }) satisfies CategoryResponseDto);
  }),

  route('POST', '/api/inventory-categories', (req) => {
    const { studio } = requireStudio(req);
    const category = { id: newId(), studioId: studio.id, name: readCategoryName(req.body as CategoryCreateDto) };
    db().inventoryCategories.push(category);
    return { id: category.id, name: category.name } satisfies CategoryResponseDto;
  }),

  route('GET', '/api/inventory-categories/{id}', (req) => {
    const category = findCategory(requireStudio(req).studio.id, req.params.id);
    return { id: category.id, name: category.name } satisfies CategoryResponseDto;
  }),

  route('PUT', '/api/inventory-categories/{id}', (req) => {
    const category = findCategory(requireStudio(req).studio.id, req.params.id);
    category.name = readCategoryName(req.body as CategoryCreateDto);
    return { id: category.id, name: category.name } satisfies CategoryResponseDto;
  }),

  route('DELETE', '/api/inventory-categories/{id}', (req) => {
    const category = findCategory(requireStudio(req).studio.id, req.params.id);
    for (const item of db().inventory) if (item.categoryId === category.id) item.categoryId = null;
    db().inventoryCategories = db().inventoryCategories.filter((c) => c.id !== category.id);
    return empty();
  }),

  route('GET', '/api/Inventory', (req) => {
    const { studio } = requireStudio(req);
    const low = req.query.get('isLowStock');
    const items = db()
      .inventory.filter((i) => i.studioId === studio.id && (low === null || isLow(i) === (low === 'true')))
      .sort(byName)
      .map(toItemDto);
    return paged(items, req.query);
  }),

  route('POST', '/api/Inventory', (req) => {
    const { studio, user } = requireStudio(req);
    const { stock, ...fields } = readItem(studio.id, (req.body ?? {}) as InventoryCreateDto);
    const item: InventoryItem = { id: newId(), studioId: studio.id, ...fields, stock: 0 };
    db().inventory.push(item);
    addMovement(item, {
      type: 'Initial',
      quantity: stock,
      bookingId: null,
      note: 'Stan początkowy',
      createdBy: fullName(user),
      createdAt: new Date().toISOString(),
    });
    return toItemDto(item);
  }),

  route('GET', '/api/Inventory/{id}', (req) => toItemDto(findItem(requireStudio(req).studio.id, req.params.id))),

  route('PUT', '/api/Inventory/{id}', (req) => {
    const { studio, user } = requireStudio(req);
    const item = findItem(studio.id, req.params.id);
    const { stock, ...fields } = readItem(studio.id, (req.body ?? {}) as InventoryCreateDto);
    Object.assign(item, fields);
    if (stock !== item.stock) {
      addMovement(item, {
        type: 'Adjustment',
        quantity: stock - item.stock,
        bookingId: null,
        note: 'Zmiana stanu przy edycji',
        createdBy: fullName(user),
        createdAt: new Date().toISOString(),
      });
    }
    return toItemDto(item);
  }),

  route('POST', '/api/Inventory/{id}/movements', (req) => {
    const { studio, user } = requireStudio(req);
    const item = findItem(studio.id, req.params.id);
    const body = (req.body ?? {}) as StockChangeRequest;
    const quantity = Number(body.quantity);
    if (body.kind !== 'Purchase' && body.kind !== 'Stocktake')
      throw validationProblem({ Kind: ['Nieznany rodzaj zmiany.'] });
    if (body.kind === 'Purchase' && !(quantity > 0)) throw validationProblem({ Quantity: ['Podaj dodatnią ilość.'] });
    if (body.kind === 'Stocktake' && !(quantity >= 0))
      throw validationProblem({ Quantity: ['Stan nie może być ujemny.'] });
    addMovement(item, {
      type: body.kind === 'Purchase' ? 'Purchase' : 'Adjustment',
      quantity: body.kind === 'Purchase' ? quantity : quantity - item.stock,
      bookingId: null,
      note: body.note?.trim() || null,
      createdBy: fullName(user),
      createdAt: new Date().toISOString(),
    });
    return toItemDto(item);
  }),

  route('GET', '/api/Inventory/{id}/movements', (req) => {
    const item = findItem(requireStudio(req).studio.id, req.params.id);
    const items = db()
      .movements.filter((m) => m.itemId === item.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(toMovementDto);
    return paged(items, req.query);
  }),

  route('GET', '/api/inventory/recipes/{serviceId}', (req) =>
    recipeDto(requireStudio(req).studio.id, req.params.serviceId),
  ),

  route('PUT', '/api/inventory/recipes/{serviceId}', (req) => {
    const { studio } = requireManager(req);
    recipeDto(studio.id, req.params.serviceId);
    const body = (req.body ?? {}) as RecipeRequest;
    const lines = (body.lines ?? []).map((l) => {
      findItem(studio.id, l.itemId);
      const quantityForMedium = Number(l.quantityForMedium);
      if (!(quantityForMedium > 0)) throw validationProblem({ Lines: ['Ilości muszą być dodatnie.'] });
      return { itemId: l.itemId, quantityForMedium };
    });
    if (new Set(lines.map((l) => l.itemId)).size !== lines.length) {
      throw validationProblem({ Lines: ['Każdy produkt może wystąpić w recepturze raz.'] });
    }
    db().recipes = [
      ...db().recipes.filter((r) => !(r.serviceId === req.params.serviceId && r.studioId === studio.id)),
      { studioId: studio.id, serviceId: req.params.serviceId, lines },
    ];
    return recipeDto(studio.id, req.params.serviceId);
  }),

  route('GET', '/api/inventory/size-factors', (req) => {
    const { small, medium, large, xl } = sizeFactorsOf(requireStudio(req).studio.id);
    return { small, medium, large, xl } satisfies SizeFactorsDto;
  }),

  route('PUT', '/api/inventory/size-factors', (req) => {
    const { studio } = requireManager(req);
    Object.assign(sizeFactorsOf(studio.id), readFactors(req.body as SizeFactorsDto));
    const { small, medium, large, xl } = sizeFactorsOf(studio.id);
    return { small, medium, large, xl } satisfies SizeFactorsDto;
  }),

  route('GET', '/api/inventory/consumptions/accuracy', accuracy),

  route('GET', '/api/inventory/consumptions/{bookingId}', (req) => {
    const { studio } = requireStudio(req);
    return toConsumptionDto(findCompletedBooking(studio.id, req.params.bookingId).id, studio.id);
  }),

  route('PUT', '/api/inventory/consumptions/{bookingId}', (req) => {
    const { studio, user } = requireStudio(req);
    const booking = findCompletedBooking(studio.id, req.params.bookingId);
    const consumption = db().consumptions.find((c) => c.bookingId === booking.id);
    if (!consumption) throw problem(404, 'CONSUMPTION_NOT_FOUND', 'Zużycie tej wizyty nie zostało jeszcze zapisane.');
    const body = (req.body ?? {}) as CorrectConsumptionRequest;
    const actuals = (body.lines ?? []).map((l) => ({ ...l, actualQuantity: Number(l.actualQuantity) }));
    if (actuals.some((l) => !(l.actualQuantity >= 0)))
      throw validationProblem({ Lines: ['Ilości nie mogą być ujemne.'] });
    correctConsumption(consumption, actuals, fullName(user));
    return toConsumptionDto(booking.id, studio.id);
  }),

  route('GET', '/api/inventory/forecast', forecast),
];
