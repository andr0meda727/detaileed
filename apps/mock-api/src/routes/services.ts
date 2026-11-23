import type { ServiceCategory, ServiceRequest, ServiceResponseDto, VehicleSize } from '@detaileed/api-client';
import { empty, problem, validationProblem } from '../http.ts';
import { route, type Route } from '../router.ts';
import { requireManager, requireStudio } from '../store/context.ts';
import { newId } from '../store/ids.ts';
import { db } from '../store/store.ts';
import type { Service } from '../store/types.ts';

const CATEGORIES: ServiceCategory[] = [
  'ExteriorWash',
  'Interior',
  'Polishing',
  'Ceramic',
  'Ppf',
  'WheelsAndTyres',
  'Other',
];
const SIZES: VehicleSize[] = ['Small', 'Medium', 'Large', 'XL'];

export const toServiceDto = (s: Service) =>
  ({
    id: s.id,
    name: s.name,
    category: s.category,
    prices: s.prices,
    durationMinutes: s.durationMinutes,
  }) satisfies ServiceResponseDto;

/** The studio's live services, by category and name. */
export const servicesOf = (studioId: string) =>
  db()
    .services.filter((s) => s.studioId === studioId && !s.deleted)
    .sort(
      (a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) || a.name.localeCompare(b.name, 'pl'),
    );

function readService(body: ServiceRequest): Omit<Service, 'id' | 'studioId' | 'deleted'> {
  const errors: Record<string, string[]> = {};
  if (!body.name?.trim()) errors.Name = ['Podaj nazwę usługi.'];
  else if (body.name.trim().length > 100) errors.Name = ['Nazwa może mieć najwyżej 100 znaków.'];
  if (body.category && !CATEGORIES.includes(body.category)) errors.Category = ['Nieznana kategoria.'];
  const prices = (body.prices ?? []).map((p) => ({ vehicleSize: p.vehicleSize, price: Number(p.price) }));
  if (prices.some((p) => !SIZES.includes(p.vehicleSize) || !(p.price >= 0))) {
    errors.Prices = ['Ceny muszą być liczbami nieujemnymi.'];
  }
  if (new Set(prices.map((p) => p.vehicleSize)).size !== prices.length) errors.Prices = ['Jedna cena na rozmiar auta.'];
  const duration =
    body.durationMinutes === null || body.durationMinutes === undefined ? 60 : Number(body.durationMinutes);
  if (!Number.isInteger(duration) || duration < 5 || duration > 1440) {
    errors.DurationMinutes = ['Czas trwania musi wynosić od 5 do 1440 minut.'];
  }
  if (Object.keys(errors).length) throw validationProblem(errors);
  return {
    name: body.name.trim(),
    category: body.category ?? 'Other',
    prices: SIZES.flatMap((size) => prices.filter((p) => p.vehicleSize === size)),
    durationMinutes: duration,
  };
}

function findService(studioId: string, id: string) {
  const service = db().services.find((s) => s.id === id && s.studioId === studioId && !s.deleted);
  if (!service) throw problem(404, 'SERVICE_NOT_FOUND', 'Nie znaleziono usługi.');
  return service;
}

export const serviceRoutes: Route[] = [
  route('GET', '/api/service', (req) => servicesOf(requireStudio(req).studio.id).map(toServiceDto)),

  route('POST', '/api/service', (req) => {
    const { studio } = requireManager(req);
    const service: Service = {
      id: newId(),
      studioId: studio.id,
      deleted: false,
      ...readService((req.body ?? {}) as ServiceRequest),
    };
    db().services.push(service);
    return toServiceDto(service);
  }),

  route('PUT', '/api/service/{id}', (req) => {
    const { studio } = requireManager(req);
    const service = findService(studio.id, req.params.id);
    Object.assign(service, readService((req.body ?? {}) as ServiceRequest));
    return toServiceDto(service);
  }),

  route('DELETE', '/api/service/{id}', (req) => {
    const { studio } = requireManager(req);
    findService(studio.id, req.params.id).deleted = true;
    return empty();
  }),
];
