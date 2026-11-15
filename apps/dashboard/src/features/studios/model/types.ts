import type { UserStudioDto } from '@detaileed/api-client';

/** A studio the signed-in user belongs to, with their role in it (`GET /api/Studios/my`). */
export type Studio = UserStudioDto;

/** Body for creating a studio (endpoint not in the API spec yet). */
export interface CreateStudioInput {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}
