import { describe, expect, it } from 'vitest';
import { cn } from '../../src/lib/cn';

describe('cn', () => {
  it('joins strings and drops falsy values', () => {
    expect(cn('px-3', false, undefined, null, '', 'py-2')).toBe('px-3 py-2');
  });

  it('applies conditional objects and arrays', () => {
    expect(cn(['rounded-md', { 'bg-muted': true, 'bg-surface': false }])).toBe('rounded-md bg-muted');
  });

  it('keeps a token text colour next to a font size', () => {
    expect(cn('text-muted-foreground', 'text-sm')).toBe('text-muted-foreground text-sm');
    expect(cn('text-sm', 'text-primary-foreground')).toBe('text-sm text-primary-foreground');
  });

  it('keeps the last of two token colours of the same kind', () => {
    expect(cn('bg-surface', 'bg-muted')).toBe('bg-muted');
    expect(cn('text-foreground', 'text-danger')).toBe('text-danger');
    expect(cn('border-border', 'border-border-strong')).toBe('border-border-strong');
  });

  it('keeps colours of different kinds', () => {
    expect(cn('bg-danger-soft', 'text-danger', 'border-danger')).toBe('bg-danger-soft text-danger border-danger');
  });

  it('lets a className override the defaults', () => {
    expect(cn('rounded-md px-3 bg-primary', 'rounded-lg bg-danger')).toBe('px-3 rounded-lg bg-danger');
  });
});
