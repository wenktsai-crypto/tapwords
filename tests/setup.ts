import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// vite.config.ts does not set test.globals, so @testing-library/react's own
// auto-cleanup (which checks for a global `afterEach`) never registers.
// Without this, React trees rendered by one UI test file's cases stay
// mounted in jsdom's shared document and leak into the next test.
afterEach(() => {
  cleanup();
});
