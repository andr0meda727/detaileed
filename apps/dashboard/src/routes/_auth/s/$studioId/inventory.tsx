import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import InventoryView from '@/views/inventory/InventoryView';

export const Route = createFileRoute('/_auth/s/$studioId/inventory')({
  // ?category=<name> keeps the category filter across reloads and links.
  validateSearch: z.object({ category: z.string().optional().catch(undefined) }),
  component: InventoryView,
});
