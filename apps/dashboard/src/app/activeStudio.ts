import type { QueryClient } from '@tanstack/react-query';
import { STUDIOS_QUERY_KEY } from '@/hooks/useStudios';
import type { StudioDto } from '@/types';

/** Last opened studio, so `/` can reopen it after a reload. */
const STORAGE_KEY = 'df_selected_studio';

function readStored(): StudioDto | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as StudioDto) : null;
  } catch {
    return null;
  }
}

let active: StudioDto | null = readStored();

/** Studio the API calls work in (sent as `X-Studio-Id`). */
export function getActiveStudioId(): string | null {
  return active?.studioId ?? null;
}

export function getLastStudioId(): string | null {
  return readStored()?.studioId ?? null;
}

/**
 * Makes `studio` the one API calls work in. Switching to another studio drops every cached query
 * except the studio list, because query keys don't include the studio.
 */
export function activateStudio(studio: StudioDto, queryClient: QueryClient): void {
  const changed = studio.studioId !== active?.studioId;
  active = studio;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(studio));
  } catch {
    // Storage full or blocked: only the "reopen last studio" convenience is lost.
  }
  if (changed) queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== STUDIOS_QUERY_KEY });
}

export function forgetActiveStudio(): void {
  active = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clean up when storage is unavailable.
  }
}
