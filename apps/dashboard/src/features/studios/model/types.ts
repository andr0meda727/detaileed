import type { CreateStudioRequest, UserStudioDto } from '@detaileed/api-client';

/** A studio the signed-in user belongs to, with their role in it (`GET /api/Studios/my`). */
export type Studio = UserStudioDto;

/** Body of `POST /api/Studios` (name, contact details, optional IANA time zone). */
export type CreateStudioInput = CreateStudioRequest;
