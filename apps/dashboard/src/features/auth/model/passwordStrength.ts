/** How many of the four strength steps a password fills: one step per three characters, at most four. */
export function passwordStrength(password: string): number {
  return Math.min(4, Math.floor(password.length / 3));
}
