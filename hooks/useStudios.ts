import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../apiClient';
import { StudioDto } from '../types';

const QUERY_KEY = 'studios';

export function useStudios() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => apiGet<StudioDto[]>('/studios/my'),
    staleTime: 5 * 60_000, // studios rarely change
  });
}
