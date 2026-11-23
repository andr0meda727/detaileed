const FOCUS =
  'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/** Tile styles for the settings card grids (a card, and the dashed "add" tile). */
export const CARD =
  'group relative flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 ' +
  `transition-colors duration-150 hover:border-border-strong ${FOCUS}`;

export const ADD_CARD =
  'flex min-h-30 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong p-5 ' +
  `text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground ${FOCUS}`;
