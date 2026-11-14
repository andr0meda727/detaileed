import { createFileRoute } from '@tanstack/react-router';
import StudioSettingsView from '@/views/settings/StudioSettingsView';

export const Route = createFileRoute('/_auth/s/$studioId/settings/studio')({
  component: StudioSettingsView,
});
