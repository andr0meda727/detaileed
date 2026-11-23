import { populate, seed, type MockState } from '../fixtures/seed.ts';

let state: MockState | undefined;

/** The in-memory data every handler reads and changes. */
export function db(): MockState {
  if (!state) resetStore();
  return state!;
}

/** Throws away every change and rebuilds the sample data (dated from today again). */
export function resetStore(): void {
  state = seed();
  populate();
}
