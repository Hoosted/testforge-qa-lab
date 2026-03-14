import { describe, expect, it } from 'vitest';

describe('application smoke example', () => {
  it('reminds future contributors where to add E2E coverage', () => {
    expect('TestForge').toContain('Forge');
  });
});
