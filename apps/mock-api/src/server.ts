import { parseArgs } from 'node:util';
import { createMockServer } from './app.ts';

const { values } = parseArgs({ options: { port: { type: 'string', short: 'p' } }, strict: false });
const port = Number(values.port ?? process.env.MOCK_API_PORT ?? 5180);

createMockServer({ log: true }).listen(port, () => {
  console.log(`Detaileed mock API on http://localhost:${port} (Supabase at /auth/v1, reset: POST /__mock/reset)`);
});
