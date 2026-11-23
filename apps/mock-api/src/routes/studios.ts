import type {
  ChangeStudioDetailsRequest,
  ChangeStudioTimeZoneRequest,
  CreateStudioRequest,
  StudioDetailsDto,
  UserStudioDto,
} from '@detaileed/api-client';
import { empty, validationProblem } from '../http.ts';
import { route, type Route } from '../router.ts';
import { requireOwner, requireStudio, requireUser } from '../store/context.ts';
import { newId } from '../store/ids.ts';
import { db } from '../store/store.ts';
import { TZ } from '../store/time.ts';
import type { RoleId, Studio } from '../store/types.ts';

export const ROLE_NAMES: Record<RoleId, string> = { 1: 'Owner', 2: 'Manager', 3: 'Employee' };

const toUserStudio = (studio: Studio, roleId: RoleId) =>
  ({
    studioId: studio.id,
    name: studio.name,
    role: ROLE_NAMES[roleId],
    address: [studio.address, studio.city].filter(Boolean).join(', ') || null,
    timeZone: studio.timeZone,
  }) satisfies UserStudioDto;

export const toStudioDetails = (studio: Studio) =>
  ({
    studioId: studio.id,
    name: studio.name,
    phone: studio.phone,
    email: studio.email,
    address: studio.address,
    city: studio.city,
    latitude: studio.latitude,
    longitude: studio.longitude,
    timeZone: studio.timeZone,
  }) satisfies StudioDetailsDto;

const blank = (value: string | null | undefined) => (value?.trim() ? value.trim() : null);

function isTimeZone(zone: string) {
  try {
    new Intl.DateTimeFormat('en', { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

function checkName(name: string | undefined) {
  if (!name?.trim()) throw validationProblem({ Name: ['Podaj nazwę studia.'] });
  if (name.trim().length > 100) throw validationProblem({ Name: ['Nazwa może mieć najwyżej 100 znaków.'] });
}

const toNumber = (value: number | string | null | undefined) =>
  value === null || value === undefined || value === '' ? null : Number(value);

export const studioRoutes: Route[] = [
  route('GET', '/api/Studios/my', (req) => {
    const user = requireUser(req);
    return db()
      .memberships.filter((m) => m.userId === user.id)
      .flatMap((m) => {
        const studio = db().studios.find((s) => s.id === m.studioId);
        return studio ? [toUserStudio(studio, m.roleId)] : [];
      });
  }),

  route('POST', '/api/Studios', (req) => {
    const user = requireUser(req);
    const body = (req.body ?? {}) as CreateStudioRequest;
    checkName(body.name);
    const timeZone = body.timeZone || TZ;
    if (!isTimeZone(timeZone)) throw validationProblem({ TimeZone: ['Nieznana strefa czasowa.'] });
    const studio: Studio = {
      id: newId(),
      name: body.name.trim(),
      phone: blank(body.phone),
      email: blank(body.email),
      address: blank(body.address),
      city: null,
      latitude: null,
      longitude: null,
      timeZone,
      createdAt: new Date().toISOString(),
    };
    db().studios.push(studio);
    db().memberships.push({ studioId: studio.id, userId: user.id, roleId: 1 });
    return toUserStudio(studio, 1);
  }),

  route('GET', '/api/Studios/current', (req) => toStudioDetails(requireStudio(req).studio)),

  route('PUT', '/api/Studios/current', (req) => {
    const { studio } = requireOwner(req);
    const body = (req.body ?? {}) as ChangeStudioDetailsRequest;
    checkName(body.name);
    const latitude = toNumber(body.latitude);
    const longitude = toNumber(body.longitude);
    if ((latitude === null) !== (longitude === null)) {
      throw validationProblem({ Latitude: ['Podaj obie współrzędne albo żadnej.'] });
    }
    Object.assign(studio, {
      name: body.name.trim(),
      phone: blank(body.phone),
      email: blank(body.email),
      address: blank(body.address),
      city: blank(body.city),
      latitude,
      longitude,
    });
    return empty();
  }),

  route('PUT', '/api/Studios/time-zone', (req) => {
    const { studio } = requireOwner(req);
    const { timeZone } = (req.body ?? {}) as ChangeStudioTimeZoneRequest;
    if (!timeZone || !isTimeZone(timeZone)) throw validationProblem({ TimeZone: ['Nieznana strefa czasowa.'] });
    studio.timeZone = timeZone;
    return empty();
  }),
];
