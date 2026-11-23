import { seed, type MockState } from '../fixtures/seed.ts';

let state: MockState = seed();

/** The in-memory data every handler reads and changes. */
export const db = (): MockState => state;

/** Throws away every change and rebuilds the sample data (dated from today again). */
export function resetStore(): void {
  state = seed();
}
