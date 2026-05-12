import { apiPost, apiPut } from '../apiClient';
import { CreateStudioDto, UpdateStudioDto, StudioDto } from '../types';

export const createStudio = (dto: CreateStudioDto): Promise<StudioDto> =>
  apiPost<StudioDto>('/Studios', dto);

export const updateStudio = (studioId: string, dto: UpdateStudioDto): Promise<StudioDto> =>
  apiPut<StudioDto>(`/Studios/${studioId}`, dto);
