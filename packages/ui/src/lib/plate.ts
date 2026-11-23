/** A licence plate as shown: upper case, single spaces ("wx  4821k" → "WX 4821K"). */
export function formatPlate(plate: string): string {
  return plate.trim().replace(/\s+/g, ' ').toLocaleUpperCase('pl');
}
