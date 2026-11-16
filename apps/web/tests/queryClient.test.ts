import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@detaileed/api-client';
import { createQueryClient } from '@/lib/queryClient';

describe('createQueryClient', () => {
  it('reports failed mutations unless they opt out', async () => {
    const notify = vi.fn();
    const client = createQueryClient(notify);
    const fail = () => Promise.reject(new ApiError(400, { detail: 'Błędny numer telefonu' }));

    await client
      .getMutationCache()
      .build(client, { mutationFn: fail })
      .execute(undefined)
      .catch(() => {});
    expect(notify).toHaveBeenCalledWith('Błędny numer telefonu');

    notify.mockClear();
    await client
      .getMutationCache()
      .build(client, { mutationFn: fail, meta: { skipGlobalError: true } })
      .execute(undefined)
      .catch(() => {});
    expect(notify).not.toHaveBeenCalled();
  });
});
