import { createFileRoute } from '@tanstack/react-router';
import { LegacyApp } from '@/App';

// Temporary catch-all: screens without their own route still go through the old view switch.
export const Route = createFileRoute('/$')({
  component: LegacyApp,
});
