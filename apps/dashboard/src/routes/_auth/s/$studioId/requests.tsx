import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { RequestsView } from '@/features/booking-requests';

export const Route = createFileRoute('/_auth/s/$studioId/requests')({
  // Filter, page and the open request live in the URL; booking-request emails link to ?id=<requestId>.
  validateSearch: z.object({
    status: z.enum(['Pending', 'Accepted', 'Rejected', 'Withdrawn']).optional().catch(undefined),
    page: z.coerce.number().int().min(1).optional().catch(undefined),
    id: z.string().optional().catch(undefined),
  }),
  component: RequestsView,
});
