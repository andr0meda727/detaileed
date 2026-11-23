import { describe, expect, it } from 'vitest';
import { passwordStrength } from '@/features/auth/model/passwordStrength';

describe('passwordStrength', () => {
  it('fills one step per three characters', () => {
    expect(passwordStrength('')).toBe(0);
    expect(passwordStrength('ab')).toBe(0);
    expect(passwordStrength('abc')).toBe(1);
    expect(passwordStrength('abcdefgh')).toBe(2);
    expect(passwordStrength('abcdefghi')).toBe(3);
  });

  it('stops at four steps', () => {
    expect(passwordStrength('abcdefghijkl')).toBe(4);
    expect(passwordStrength('a'.repeat(40))).toBe(4);
  });
});
