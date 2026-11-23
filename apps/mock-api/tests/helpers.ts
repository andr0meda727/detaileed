import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createMockServer } from '../src/app.ts';

/** Starts the mock on a free port; call `close()` after the tests. */
export async function startMock(): Promise<{ url: string; close: () => Promise<void> }> {
  const server: Server = createMockServer();
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}
