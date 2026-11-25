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

/** Classes of a sidebar row (nav links, the user menu button): 36px, muted text, `muted` fill when hovered. */
export const NAV_ROW =
  'flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors duration-150 ' +
  'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-subtle';
