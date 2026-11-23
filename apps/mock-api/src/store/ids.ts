import { createHash, randomUUID } from 'node:crypto';

/**
 * A UUID derived from a name, so sample records keep their ids across restarts and resets
 * (links such as `/s/<studioId>/bookings` stay valid). `stableId('studio:full')` is always the same.
 */
export function stableId(name: string): string {
  const hex = createHash('sha1').update(`detaileed-mock:${name}`).digest('hex');
  const variant = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

/** A fresh id for a record created at runtime. */
export const newId = (): string => randomUUID();
