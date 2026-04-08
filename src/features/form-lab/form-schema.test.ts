import { advancedFormDefaults, advancedFormSchema } from '@/features/form-lab/form-schema';

describe('advancedFormSchema', () => {
  it('requires a scheduled date when launch mode is scheduled', () => {
    const result = advancedFormSchema.safeParse({
      ...advancedFormDefaults,
      scheduledAt: '',
      launchMode: 'scheduled',
    });

    expect(result.success).toBe(false);
  });

  it('requires accessibility review for checkout flows', () => {
    const result = advancedFormSchema.safeParse({
      ...advancedFormDefaults,
      accessibilityReview: false,
      journeyType: 'checkout',
    });

    expect(result.success).toBe(false);
  });
});
