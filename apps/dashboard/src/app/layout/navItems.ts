import type { LucideIcon } from 'lucide-react';

export type StudioPath =
  | '/s/$studioId'
  | '/s/$studioId/tasks'
  | '/s/$studioId/requests'
  | '/s/$studioId/board'
  | '/s/$studioId/clients'
  | '/s/$studioId/team'
  | '/s/$studioId/inventory'
  | '/s/$studioId/reports'
  | '/s/$studioId/settings/studio'
  | '/s/$studioId/settings/user';

export interface NavItem {
  to: StudioPath;
  icon: LucideIcon;
  label: string;
  /** A count shown next to the label (e.g. pending requests); hidden when 0. */
  badge?: number;
}
