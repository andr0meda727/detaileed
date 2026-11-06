export function toggleIdSelection(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((currentId) => currentId !== id) : [...ids, id];
}
