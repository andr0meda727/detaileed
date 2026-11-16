import type {
  AccuracyDto,
  ConsumptionDto,
  ForecastDto,
  RecipeDto,
  SizeFactorsDto,
  StockMovementDto,
  StockMovementType,
  VehicleSize,
} from '@detaileed/api-client';

const num = (v: number | string) => Number(v);
const numOrNull = (v: number | string | null | undefined) => (v == null ? null : Number(v));

export interface StockMovement {
  id: string;
  type: StockMovementType;
  /** Signed change of stock (a stocktake records the difference). */
  quantity: number;
  bookingId: string | null;
  note: string | null;
  createdBy: string | null;
  createdAt: string;
}

export const toStockMovement = (dto: StockMovementDto): StockMovement => ({ ...dto, quantity: num(dto.quantity) });

/** Polish names of the ledger's movement types. */
export const MOVEMENT_LABELS: Record<string, string> = {
  Initial: 'Stan początkowy',
  Purchase: 'Dostawa',
  Adjustment: 'Inwentaryzacja',
  Consumption: 'Zużycie (wizyta)',
  Correction: 'Korekta zużycia',
};

export interface Recipe {
  serviceId: string;
  lines: { itemId: string; itemName: string; unit: string; quantityForMedium: number }[];
}

export const toRecipe = (dto: RecipeDto): Recipe => ({
  serviceId: dto.serviceId,
  lines: dto.lines.map((l) => ({ ...l, quantityForMedium: num(l.quantityForMedium) })),
});

export interface SizeFactors {
  small: number;
  medium: number;
  large: number;
  xl: number;
}

export const toSizeFactors = (dto: SizeFactorsDto): SizeFactors => ({
  small: num(dto.small),
  medium: num(dto.medium),
  large: num(dto.large),
  xl: num(dto.xl),
});

export interface Consumption {
  bookingId: string;
  vehicleSize: VehicleSize;
  completedAt: string;
  lines: {
    serviceId: string;
    itemId: string;
    itemName: string;
    unit: string;
    /** The norm for the car's size. */
    baseQuantity: number;
    /** What was taken off stock. */
    estimatedQuantity: number;
    /** What the staff recorded the visit really used, if they did. */
    actualQuantity: number | null;
  }[];
}

export const toConsumption = (dto: ConsumptionDto): Consumption => ({
  bookingId: dto.bookingId,
  vehicleSize: dto.vehicleSize,
  completedAt: dto.completedAt,
  lines: dto.lines.map((l) => ({
    ...l,
    baseQuantity: num(l.baseQuantity),
    estimatedQuantity: num(l.estimatedQuantity),
    actualQuantity: numOrNull(l.actualQuantity),
  })),
});

export interface ForecastItem {
  itemId: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number | null;
  averageDailyUse: number;
  daysLeft: number | null;
  plannedUse: number;
  stockAfterPlanned: number;
  /** Start of the first booked visit the stock won't cover. */
  runsOutAt: string | null;
  isLowStock: boolean;
}

export const toForecastItem = (dto: ForecastDto): ForecastItem => ({
  ...dto,
  stock: num(dto.stock),
  minStock: numOrNull(dto.minStock),
  averageDailyUse: num(dto.averageDailyUse),
  daysLeft: numOrNull(dto.daysLeft),
  plannedUse: num(dto.plannedUse),
  stockAfterPlanned: num(dto.stockAfterPlanned),
});

export interface AccuracyRow {
  serviceId: string;
  itemId: string;
  itemName: string;
  factor: number;
  factorApplied: boolean;
  samples: number;
  meanAbsolutePercentageError: number | null;
}

export const toAccuracyRow = (dto: AccuracyDto): AccuracyRow => ({
  ...dto,
  factor: num(dto.factor),
  samples: num(dto.samples),
  meanAbsolutePercentageError: numOrNull(dto.meanAbsolutePercentageError),
});

/** A quantity typed by a person ("2,5"), at most three decimals, as the API allows. */
export const QUANTITY = /^\d{1,7}([.,]\d{1,3})?$/;
export const parseQuantity = (text: string) => Number(text.trim().replace(',', '.'));
/** A quantity for display, Polish decimals, at most three. */
export const formatQuantity = (n: number) =>
  n.toLocaleString('pl-PL', { maximumFractionDigits: 3, useGrouping: false });
