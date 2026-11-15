import { apiFetch } from '@detaileed/api-client';
import type { CreateStudioInput, Studio } from '@/features/studios/model/types';

// These endpoints are not in the API spec yet (backend work in progress), so there is no generated
// function; they call apiFetch directly. Replace them with the generated ones once the spec has them.

export const createStudio = (dto: CreateStudioInput): Promise<Studio> =>
  apiFetch<Studio>('/api/Studios', { method: 'POST', body: JSON.stringify(dto) });
