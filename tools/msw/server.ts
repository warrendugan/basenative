/**
 * MSW Node/Jest Setup
 * Configure Mock Service Worker for Node.js and Jest test environments.
 *
 * Usage in test files:
 * ```typescript
 * import { server } from '@basenative/tools-msw-server';
 *
 * beforeAll(() => server.listen());
 * afterEach(() => server.resetHandlers());
 * afterAll(() => server.close());
 * ```
 *
 * Override handlers in specific tests:
 * ```typescript
 * server.use(
 *   http.get('/leads', () => HttpResponse.json([...], { status: 200 }))
 * );
 * ```
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
