import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@detaileed/api-client';
import { createQueryClient } from '@/shared/lib/queryClient';

function failingMutation(client: ReturnType<typeof createQueryClient>, meta?: { skipGlobalError?: boolean }) {
  return client
    .getMutationCache()
    .build(client, {
      mutationFn: () => Promise.reject(new ApiError(409, { detail: 'Termin jest zajęty' })),
      meta,
    })
    .execute(undefined)
    .catch(() => undefined);
}

describe('createQueryClient', () => {
  it('reports mutation errors globally', async () => {
    const notify = vi.fn();
    await failingMutation(createQueryClient(notify));
    expect(notify).toHaveBeenCalledWith('Termin jest zajęty');
  });

  it('skips mutations that handle errors themselves', async () => {
    const notify = vi.fn();
    await failingMutation(createQueryClient(notify), { skipGlobalError: true });
    expect(notify).not.toHaveBeenCalled();
  });
});
