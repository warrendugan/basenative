/**
 * MSW Browser Setup
 * Configure Mock Service Worker for browser-based tests and development.
 *
 * Usage:
 * - Import and start in setupFilesAfterEnv for Jest tests
 * - Or manually start/stop in tests with beforeAll/afterAll
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
