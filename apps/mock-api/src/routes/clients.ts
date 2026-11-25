import type {
  ClientRequest,
  ClientResponseDto,
  VehicleRequest,
  VehicleResponseDto,
  VehicleSize,
} from '@detaileed/api-client';
import { empty, problem, validationProblem } from '../http.ts';
import { route, type MockRequest, type Route } from '../router.ts';
import { requireStudio } from '../store/context.ts';
import { newId } from '../store/ids.ts';
import { byName, matches, paged } from '../store/paging.ts';
import { db } from '../store/store.ts';
import type { Client, Vehicle } from '../store/types.ts';

const SIZES: VehicleSize[] = ['Small', 'Medium', 'Large', 'XL'];

export const toVehicleDto = (v: Vehicle) =>
  ({
    id: v.id,
    licensePlate: v.licensePlate,
    brand: v.brand,
    model: v.model,
    size: v.size,
  }) satisfies VehicleResponseDto;

export const toClientDto = (c: Client) =>
  ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    nip: c.nip,
    vehicles: db()
      .vehicles.filter((v) => v.clientId === c.id)
      .map(toVehicleDto),
  }) satisfies ClientResponseDto;

export const normalizePlate = (plate: string) => plate.trim().toUpperCase().replace(/\s+/g, ' ');
const blank = (value: string | null | undefined) => (value?.trim() ? value.trim() : null);

function findClient(studioId: string, id: string) {
  const client = db().clients.find((c) => c.id === id && c.studioId === studioId);
  if (!client) throw problem(404, 'CLIENT_NOT_FOUND', 'Nie znaleziono klienta.');
  return client;
}

function findVehicle(studioId: string, id: string) {
  const vehicle = db().vehicles.find((v) => v.id === id && v.studioId === studioId);
  if (!vehicle) throw problem(404, 'VEHICLE_NOT_FOUND', 'Nie znaleziono pojazdu.');
  return vehicle;
}

function checkClient(body: ClientRequest) {
  const errors: Record<string, string[]> = {};
  if (!body.name?.trim()) errors.Name = ['Podaj imię i nazwisko lub nazwę firmy.'];
  if (!body.phone?.trim()) errors.Phone = ['Podaj numer telefonu.'];
  if (body.email && !/^[^@\s]+@[^@\s]+$/.test(body.email)) errors.Email = ['Nieprawidłowy adres e-mail.'];
  if (body.vehicle && !body.vehicle.licensePlate?.trim())
    errors['Vehicle.LicensePlate'] = ['Podaj numer rejestracyjny.'];
  if (Object.keys(errors).length) throw validationProblem(errors);
}

/** Adds a car to a client; a plate is unique within the studio. */
function addVehicle(
  studioId: string,
  clientId: string,
  input: { licensePlate: string; brand: string | null; model: string | null; size?: VehicleSize | null },
  exceptId?: string,
): Vehicle {
  const licensePlate = normalizePlate(input.licensePlate ?? '');
  if (!licensePlate) throw validationProblem({ LicensePlate: ['Podaj numer rejestracyjny.'] });
  if (input.size && !SIZES.includes(input.size)) throw validationProblem({ Size: ['Nieznana wielkość auta.'] });
  const taken = db().vehicles.some(
    (v) => v.studioId === studioId && v.id !== exceptId && normalizePlate(v.licensePlate) === licensePlate,
  );
  if (taken) throw problem(409, 'VEHICLE_PLATE_TAKEN', `Pojazd o numerze ${licensePlate} jest już w bazie studia.`);
  return {
    id: exceptId ?? newId(),
    studioId,
    clientId,
    licensePlate,
    brand: blank(input.brand),
    model: blank(input.model),
    size: input.size ?? 'Medium',
  };
}

function listClients(req: MockRequest) {
  const { studio } = requireStudio(req);
  const search = req.query.get('search');
  const items = db()
    .clients.filter((c) => c.studioId === studio.id)
    .filter((c) => {
      const plates = db()
        .vehicles.filter((v) => v.clientId === c.id)
        .map((v) => v.licensePlate);
      return matches(search, c.name, c.phone, c.email, c.nip, ...plates);
    })
    .sort(byName)
    .map(toClientDto);
  return paged(items, req.query);
}

function listVehicles(req: MockRequest) {
  const { studio } = requireStudio(req);
  const clientId = req.query.get('clientId');
  const search = req.query.get('search');
  const items = db()
    .vehicles.filter((v) => v.studioId === studio.id && (!clientId || v.clientId === clientId))
    .filter((v) => matches(search, v.licensePlate, v.brand, v.model))
    .sort((a, b) => a.licensePlate.localeCompare(b.licensePlate))
    .map(toVehicleDto);
  return paged(items, req.query);
}

export const clientRoutes: Route[] = [
  route('GET', '/api/Clients', listClients),

  route('POST', '/api/Clients', (req) => {
    const { studio } = requireStudio(req);
    const body = (req.body ?? {}) as ClientRequest;
    checkClient(body);
    const client: Client = {
      id: newId(),
      studioId: studio.id,
      name: body.name!.trim(),
      email: blank(body.email),
      phone: body.phone!.trim(),
      nip: blank(body.nip),
      customerUserId: null,
    };
    const vehicle = body.vehicle ? addVehicle(studio.id, client.id, body.vehicle) : null;
    db().clients.push(client);
    if (vehicle) db().vehicles.push(vehicle);
    return toClientDto(client);
  }),

  route('GET', '/api/Clients/{id}', (req) => toClientDto(findClient(requireStudio(req).studio.id, req.params.id))),

  route('PUT', '/api/Clients/{id}', (req) => {
    const { studio } = requireStudio(req);
    const client = findClient(studio.id, req.params.id);
    const body = (req.body ?? {}) as ClientRequest;
    checkClient(body);
    Object.assign(client, {
      name: body.name!.trim(),
      email: blank(body.email),
      phone: body.phone!.trim(),
      nip: blank(body.nip),
    });
    if (body.vehicle) db().vehicles.push(addVehicle(studio.id, client.id, body.vehicle));
    return toClientDto(client);
  }),

  route('DELETE', '/api/Clients/{id}', (req) => {
    const { studio } = requireStudio(req);
    const client = findClient(studio.id, req.params.id);
    const state = db();
    if (state.bookings.some((b) => b.clientId === client.id)) {
      throw problem(409, 'CLIENT_HAS_BOOKINGS', 'Nie można usunąć klienta, który ma rezerwacje.');
    }
    state.vehicles = state.vehicles.filter((v) => v.clientId !== client.id);
    state.clients = state.clients.filter((c) => c.id !== client.id);
    return empty();
  }),

  route('GET', '/api/vehicle', listVehicles),

  route('POST', '/api/vehicle', (req) => {
    const { studio } = requireStudio(req);
    const body = (req.body ?? {}) as VehicleRequest;
    const client = findClient(studio.id, body.clientId);
    const vehicle = addVehicle(studio.id, client.id, body);
    db().vehicles.push(vehicle);
    return toVehicleDto(vehicle);
  }),

  route('PUT', '/api/vehicle/{id}', (req) => {
    const { studio } = requireStudio(req);
    const vehicle = findVehicle(studio.id, req.params.id);
    const body = (req.body ?? {}) as VehicleRequest;
    const clientId = body.clientId ? findClient(studio.id, body.clientId).id : vehicle.clientId;
    Object.assign(vehicle, addVehicle(studio.id, clientId, { ...body, size: body.size ?? vehicle.size }, vehicle.id));
    return toVehicleDto(vehicle);
  }),

  route('DELETE', '/api/vehicle/{id}', (req) => {
    const { studio } = requireStudio(req);
    const vehicle = findVehicle(studio.id, req.params.id);
    if (db().bookings.some((b) => b.vehicleId === vehicle.id)) {
      throw problem(409, 'VEHICLE_HAS_BOOKINGS', 'Nie można usunąć pojazdu, który ma rezerwacje.');
    }
    db().vehicles = db().vehicles.filter((v) => v.id !== vehicle.id);
    return empty();
  }),
];
