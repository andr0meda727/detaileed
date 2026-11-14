import { createFileRoute } from '@tanstack/react-router';
import UserSettingsView from '@/views/settings/UserSettingsView';

export const Route = createFileRoute('/_auth/s/$studioId/settings/user')({
  component: UserSettingsView,
});
