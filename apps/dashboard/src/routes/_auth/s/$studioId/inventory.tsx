import { createFileRoute } from '@tanstack/react-router';
import InventoryView from '@/views/inventory/InventoryView';

export const Route = createFileRoute('/_auth/s/$studioId/inventory')({
  component: InventoryView,
});
