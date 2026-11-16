import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteApiBaysId,
  deleteApiScheduleClosuresDate,
  getApiAvailability,
  getApiBays,
  getApiSchedule,
  getApiScheduleDay,
  getGetApiBaysQueryKey,
  getGetApiScheduleDayQueryKey,
  getGetApiScheduleQueryKey,
  postApiBays,
  postApiScheduleClosures,
  putApiBaysId,
  putApiSchedule,
  type VehicleSize,
} from '@detaileed/api-client';
import { toDayBoard, toSchedule, toStaffAvailability, type ScheduleInput } from '@/features/planning/model/types';

const baysKey = getGetApiBaysQueryKey();
const scheduleKey = getGetApiScheduleQueryKey();
const dayKey = getGetApiScheduleDayQueryKey();
const availabilityKey = ['/api/availability'];

/** The studio's bays (deactivated ones too, with `isActive: false`). */
export function useBays() {
  return useQuery({ queryKey: baysKey, queryFn: ({ signal }) => getApiBays({ signal }), staleTime: 60_000 });
}

/** Opening hours, rules, multipliers and closures; `planningEnabled` once hours and a bay exist. */
export function useSchedule() {
  return useQuery({
    queryKey: scheduleKey,
    queryFn: async ({ signal }) => toSchedule(await getApiSchedule({ signal })),
    staleTime: 60_000,
  });
}

/** A planning change affects what planning is on, the day board and the free times. */
function usePlanningMutation<TVariables, TResult>(mutationFn: (variables: TVariables) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    // The settings forms show these errors themselves (with the API's codes explained).
    meta: { skipGlobalError: true },
    onSuccess: () =>
      Promise.all(
        [baysKey, scheduleKey, dayKey, availabilityKey].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      ),
  });
}

export const useCreateBay = () => usePlanningMutation((name: string) => postApiBays({ name }));
export const useRenameBay = () =>
  usePlanningMutation(({ id, name }: { id: string; name: string }) => putApiBaysId(id, { name }));
/** Deactivates a bay; refused with `BAY_HAS_UPCOMING_BOOKINGS` while open bookings are still to come on it. */
export const useDeleteBay = () => usePlanningMutation((id: string) => deleteApiBaysId(id));

export const useSaveSchedule = () => usePlanningMutation((body: ScheduleInput) => putApiSchedule(body));
export const useAddClosure = () =>
  usePlanningMutation((body: { date: string; reason: string | null }) => postApiScheduleClosures(body));
export const useRemoveClosure = () => usePlanningMutation((date: string) => deleteApiScheduleClosuresDate(date));

/** One studio day (`yyyy-MM-dd`): bays with bookings and free gaps, unassigned bookings, pending requests. */
export function useDayBoard(date: string) {
  return useQuery({
    queryKey: getGetApiScheduleDayQueryKey({ date }),
    queryFn: async ({ signal }) => toDayBoard(await getApiScheduleDay({ date }, { signal })),
  });
}

/** Free start times for these services and car size on the studio days `from`–`to` (at most 14). */
export function useStaffAvailability(
  params: { from: string; to: string; serviceIds: string[]; size: VehicleSize },
  enabled: boolean,
) {
  return useQuery({
    queryKey: [...availabilityKey, params],
    queryFn: async ({ signal }) =>
      toStaffAvailability(
        await getApiAvailability(
          { From: params.from, To: params.to, ServiceIds: params.serviceIds, VehicleSize: params.size },
          { signal },
        ),
      ),
    enabled: enabled && params.serviceIds.length > 0,
  });
}
