import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';

// findBy*/waitFor give up after 1 s by default. In CI every package's tests run in parallel, and the first role
// query in a cold jsdom (e.g. a booking slot after its query resolves) can take longer, failing a correct test.
configure({ asyncUtilTimeout: 5_000 });
