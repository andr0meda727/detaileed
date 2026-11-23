/** Classes shared by the Radix-based components (dialogs, menus, controls). */
import { cn } from '../lib/cn';

/** Backdrop behind dialogs (Modal, ConfirmDialog). */
export const overlayClass = 'fixed inset-0 z-100 bg-overlay motion-safe:animate-fade-in';

/** A centred dialog panel without its width; it never grows past the viewport and scrolls inside. */
export const dialogPanelClass = cn(
  'fixed inset-0 z-100 m-auto flex h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] flex-col',
  'overflow-hidden rounded-lg border border-border bg-surface text-foreground shadow-lg',
  'focus:outline-none motion-safe:animate-fade-in',
);

/** Focus ring of the interactive controls: 2px `ring`, offset 2px from the surface behind. */
export const focusRingClass =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';
