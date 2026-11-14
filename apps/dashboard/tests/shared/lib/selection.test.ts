import { describe, expect, it } from 'vitest';
import { toggleIdSelection } from '@/shared/lib/selection';

describe('toggleIdSelection', () => {
  it('adds id when not selected', () => {
    expect(toggleIdSelection(['a', 'b'], 'c')).toEqual(['a', 'b', 'c']);
  });

  it('removes id when selected', () => {
    expect(toggleIdSelection(['a', 'b', 'c'], 'b')).toEqual(['a', 'c']);
  });
});
