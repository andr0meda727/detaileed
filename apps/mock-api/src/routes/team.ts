import type {
  BookingsReportRequest,
  ChangeEmployeeRoleRequest,
  InvitationResponseDto,
  InviteEmployeeRequest,
  StudioEmployeeDto,
} from '@detaileed/api-client';
import { randomBytes } from 'node:crypto';
import { empty, problem, Reply, validationProblem } from '../http.ts';
import { route, type Route } from '../router.ts';
import { requireOwner, requireStudio, requireUser } from '../store/context.ts';
import { newId } from '../store/ids.ts';
import { db } from '../store/store.ts';
import type { RoleId } from '../store/types.ts';
import { ROLE_NAMES } from './studios.ts';

const toRoleId = (value: number | string | undefined): RoleId | null => {
  const id = Number(value);
  return id === 1 || id === 2 || id === 3 ? id : null;
};

function findInvitation(token: string) {
  const invitation = db().invitations.find((i) => i.token === token);
  if (!invitation || invitation.status !== 'pending' || invitation.expiresAt < new Date().toISOString()) {
    throw problem(404, 'INVITATION_NOT_FOUND', 'Zaproszenie wygasło albo zostało już wykorzystane.');
  }
  return invitation;
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;

export const teamRoutes: Route[] = [
  route('GET', '/api/Employees', (req) => {
    const { studio } = requireStudio(req);
    return db()
      .memberships.filter((m) => m.studioId === studio.id)
      .sort((a, b) => a.roleId - b.roleId)
      .flatMap((m) => {
        const user = db().users.find((u) => u.id === m.userId);
        if (!user) return [];
        return [
          {
            userId: user.id,
            email: user.email,
            firstName: user.firstName || null,
            lastName: user.lastName || null,
            roleId: m.roleId,
            roleName: ROLE_NAMES[m.roleId],
          } satisfies StudioEmployeeDto,
        ];
      });
  }),

  route('POST', '/api/Employees/invite', (req) => {
    const { studio } = requireOwner(req);
    const body = (req.body ?? {}) as InviteEmployeeRequest;
    const email = body.email?.trim().toLowerCase() ?? '';
    const roleId = toRoleId(body.roleId);
    if (!/^[^@\s]+@[^@\s]+$/.test(email)) throw validationProblem({ Email: ['Nieprawidłowy adres e-mail.'] });
    if (!roleId) throw validationProblem({ RoleId: ['Nieznana rola.'] });
    if (roleId === 1) throw problem(400, 'CANNOT_INVITE_OWNER', 'Nie można zaprosić kolejnego właściciela.');
    const user = db().users.find((u) => u.email.toLowerCase() === email);
    if (user && db().memberships.some((m) => m.studioId === studio.id && m.userId === user.id)) {
      throw problem(409, 'EMPLOYEE_ALREADY_MEMBER', 'Ta osoba już należy do zespołu studia.');
    }
    const token = randomBytes(12).toString('hex');
    db().invitations.push({
      id: newId(),
      token,
      studioId: studio.id,
      email,
      roleId,
      expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      status: 'pending',
    });
    console.log(`[mock-api] invitation for ${email} to ${studio.name}: /accept-invitation?token=${token}`);
    return empty();
  }),

  route('DELETE', '/api/Employees/{userId}', (req) => {
    const { studio } = requireOwner(req);
    const member = db().memberships.find((m) => m.studioId === studio.id && m.userId === req.params.userId);
    if (!member) throw problem(404, 'EMPLOYEE_NOT_FOUND', 'Nie znaleziono pracownika w tym studiu.');
    if (member.roleId === 1) throw problem(400, 'CANNOT_REMOVE_OWNER', 'Nie można usunąć właściciela studia.');
    db().memberships = db().memberships.filter((m) => m !== member);
    return empty();
  }),

  route('PATCH', '/api/Employees/role', (req) => {
    const { studio } = requireOwner(req);
    const body = (req.body ?? {}) as ChangeEmployeeRoleRequest;
    const roleId = toRoleId(body.roleId);
    const member = db().memberships.find((m) => m.studioId === studio.id && m.userId === body.userId);
    if (!member) throw problem(404, 'EMPLOYEE_NOT_FOUND', 'Nie znaleziono pracownika w tym studiu.');
    if (!roleId) throw validationProblem({ RoleId: ['Nieznana rola.'] });
    if (member.roleId === 1 || roleId === 1) {
      throw problem(400, 'CANNOT_CHANGE_OWNER', 'Roli właściciela nie można nadać ani odebrać.');
    }
    member.roleId = roleId;
    return empty();
  }),

  route('GET', '/api/Invitations/{token}', (req) => {
    const invitation = findInvitation(req.params.token);
    const studio = db().studios.find((s) => s.id === invitation.studioId);
    return {
      id: invitation.id,
      studioName: studio?.name ?? 'Studio',
      role: ROLE_NAMES[invitation.roleId],
      email: invitation.email,
      expiresAt: invitation.expiresAt,
    } satisfies InvitationResponseDto;
  }),

  route('POST', '/api/Invitations/{token}/accept', (req) => {
    const user = requireUser(req);
    const invitation = findInvitation(req.params.token);
    if (!db().memberships.some((m) => m.studioId === invitation.studioId && m.userId === user.id)) {
      db().memberships.push({ studioId: invitation.studioId, userId: user.id, roleId: invitation.roleId });
    }
    invitation.status = 'accepted';
    return empty();
  }),

  route('POST', '/api/Invitations/{token}/decline', (req) => {
    findInvitation(req.params.token).status = 'declined';
    return empty();
  }),

  route('POST', '/api/Reports/bookings', (req) => {
    const { user, studio } = requireStudio(req);
    const body = (req.body ?? {}) as BookingsReportRequest;
    if (!DAY.test(body.dateFrom ?? '') || !DAY.test(body.dateTo ?? '') || body.dateFrom > body.dateTo) {
      throw validationProblem({ DateTo: ['Podaj poprawny zakres dat.'] });
    }
    console.log(`[mock-api] bookings report ${body.dateFrom}…${body.dateTo} of ${studio.name} "sent" to ${user.email}`);
    return new Reply(202);
  }),
];
