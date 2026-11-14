import { useEffect, useState } from 'react';

/** `value`, updated only after it stopped changing for `delayMs` (for search boxes). */
export function useDebouncedValue<T>(value: T, delayMs = 140): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);
  return debounced;
}
