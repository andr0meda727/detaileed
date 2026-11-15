import { useMutation } from '@tanstack/react-query';
import { postApiReportsBookings } from '@detaileed/api-client';

/**
 * Asks the API to build the bookings PDF for \`dateFrom\`–\`dateTo\` (studio days, \`YYYY-MM-DD\`, both included).
 * The API answers 202 and emails the report to the signed-in user.
 */
export function useGenerateBookingsReport() {
  return useMutation({
    // The screen shows its own error toast.
    meta: { skipGlobalError: true },
    mutationFn: (range: { dateFrom: string; dateTo: string }) => postApiReportsBookings(range),
  });
}
