import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { ReportsView } from '@/features/reports';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const Route = createFileRoute('/_auth/s/$studioId/reports')({
  // The report range lives in the URL (?from=2026-01-01&to=2026-01-31), so it can be shared or bookmarked.
  validateSearch: z.object({ from: isoDate.optional().catch(undefined), to: isoDate.optional().catch(undefined) }),
  component: ReportsView,
});
