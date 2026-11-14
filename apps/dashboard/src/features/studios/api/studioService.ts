import { apiPost, apiPut } from '@/apiClient';
import type { CreateStudioDto, UpdateStudioDto } from '@/types';
import type { Studio } from '@/features/studios/model/types';

export const createStudio = (dto: CreateStudioDto): Promise<Studio> => apiPost<Studio>('/Studios', dto);

export const updateStudio = (studioId: string, dto: UpdateStudioDto): Promise<Studio> =>
  apiPut<Studio>(`/Studios/${studioId}`, dto);
