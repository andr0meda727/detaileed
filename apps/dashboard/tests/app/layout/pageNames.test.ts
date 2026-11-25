import { describe, expect, it } from 'vitest';
import { pageName } from '@/app/layout/pageNames';

describe('pageName', () => {
  it('names the studio screens by route id', () => {
    expect(pageName('/_signed-in/s/$studioId/')).toBe('Panel główny');
    expect(pageName('/_signed-in/s/$studioId/tasks')).toBe('Rezerwacje');
    expect(pageName('/_signed-in/s/$studioId/settings/user')).toBe('Moje konto');
  });

  it('has no name outside a studio or for unknown screens', () => {
    expect(pageName('/_signed-in/studios')).toBeUndefined();
    expect(pageName('/_signed-in/s/$studioId/unknown')).toBeUndefined();
  });
});
