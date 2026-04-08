import { guides, labs } from '@/data/playground';

describe('playground content', () => {
  it('keeps every lab linked to a guide and route', () => {
    for (const lab of labs) {
      expect(lab.route.startsWith('/labs')).toBe(true);
      expect(guides.some((guide) => guide.labId === lab.id)).toBe(true);
    }
  });
});
