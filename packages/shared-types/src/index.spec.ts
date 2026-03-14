import { describe, expect, it } from 'vitest';
import { healthcheck } from './index';

describe('shared healthcheck contract', () => {
  it('keeps the bootstrap API status stable', () => {
    expect(healthcheck).toMatchObject({
      status: 'ok',
      service: 'testforge-api',
      version: '0.1.0',
    });
  });
});
