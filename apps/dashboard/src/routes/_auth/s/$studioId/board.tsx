import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { DayBoardView } from '@/features/planning';

export const Route = createFileRoute('/_auth/s/$studioId/board')({
  // The shown day (?date=2026-11-16, the studio's day); today when missing.
  validateSearch: z.object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .catch(undefined),
  }),
  component: DayBoardView,
});
