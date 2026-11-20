import { createFileRoute } from '@tanstack/react-router';
import { StudioSettingsView } from '@/features/settings';

export const Route = createFileRoute('/_signed-in/s/$studioId/settings/studio')({
  component: StudioSettingsView,
});
