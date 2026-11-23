import { OnlineRequestStatus } from '@detaileed/api-client';
import type { BadgeTone } from '@detaileed/ui';

/** Request statuses in filter order, with Polish labels and badge tones. */
export const REQUEST_STATUSES: { value: OnlineRequestStatus; label: string; tone: BadgeTone }[] = [
  { value: OnlineRequestStatus.Pending, label: 'Oczekujące', tone: 'warning' },
  { value: OnlineRequestStatus.Accepted, label: 'Przyjęte', tone: 'success' },
  { value: OnlineRequestStatus.Rejected, label: 'Odrzucone', tone: 'danger' },
  { value: OnlineRequestStatus.Withdrawn, label: 'Wycofane', tone: 'neutral' },
];

export function requestStatus(status: string) {
  return REQUEST_STATUSES.find((s) => s.value === status) ?? { value: status, label: status, tone: 'neutral' as const };
}
