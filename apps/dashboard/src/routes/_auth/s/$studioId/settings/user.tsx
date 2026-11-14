import { createFileRoute } from '@tanstack/react-router';
import UserSettingsView from '@/features/auth/components/UserSettingsView';

export const Route = createFileRoute('/_auth/s/$studioId/settings/user')({
  component: UserSettingsView,
});
