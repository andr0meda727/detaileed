import { createFileRoute } from '@tanstack/react-router';
import { UserSettingsView } from '@/features/auth';

export const Route = createFileRoute('/_signed-in/s/$studioId/settings/user')({
  component: UserSettingsView,
});
