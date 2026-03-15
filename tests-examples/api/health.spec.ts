import { describe, expect, it } from 'vitest';
import { healthcheck } from '@testforge/shared-types';

describe('health contract example', () => {
  it('matches the bootstrap status payload', () => {
    expect(healthcheck.status).toBe('ok');
  });
});
