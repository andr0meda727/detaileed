import { createFileRoute, useNavigate } from '@tanstack/react-router';
import StudioSelectView from '@/views/settings/StudioSelectView';

export const Route = createFileRoute('/_auth/studios')({
  component: StudiosPage,
});

function StudiosPage() {
  const navigate = useNavigate();
  return (
    <StudioSelectView
      onSelect={(studio) => void navigate({ to: '/s/$studioId', params: { studioId: studio.studioId } })}
    />
  );
}
