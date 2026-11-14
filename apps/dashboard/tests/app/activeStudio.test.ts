import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';

vi.mock('@/shared/lib/supabase', () => ({ default: { auth: { getSession: vi.fn() } } }));

const { activateStudio, forgetActiveStudio, getActiveStudioId, getLastStudioId } = await import('@/app/activeStudio');

const studio = (studioId: string) => ({ studioId, name: studioId, role: 'Owner', address: null });

describe('activeStudio', () => {
  beforeEach(() => forgetActiveStudio());

  it('remembers the active studio', () => {
    activateStudio(studio('a'), new QueryClient());
    expect(getActiveStudioId()).toBe('a');
    expect(getLastStudioId()).toBe('a');

    forgetActiveStudio();
    expect(getActiveStudioId()).toBeNull();
    expect(getLastStudioId()).toBeNull();
  });

  it('drops cached studio data on a switch but keeps the studio list', () => {
    const client = new QueryClient();
    activateStudio(studio('a'), client);
    client.setQueryData(['studios'], [studio('a'), studio('b')]);
    client.setQueryData(['clients'], []);

    activateStudio(studio('a'), client);
    expect(client.getQueryData(['clients'])).toEqual([]);

    activateStudio(studio('b'), client);
    expect(client.getQueryData(['clients'])).toBeUndefined();
    expect(client.getQueryData(['studios'])).toHaveLength(2);
  });
});
