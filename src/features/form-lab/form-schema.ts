import { z } from 'zod';

export const platformOptions = ['web', 'mobile', 'backoffice'] as const;
export const journeyOptions = ['checkout', 'authentication', 'catalog'] as const;
export const launchModeOptions = ['immediate', 'scheduled'] as const;
export const riskLevelOptions = ['low', 'moderate', 'high'] as const;
export const supportChannelOptions = ['slack', 'teams', 'email', 'pagerduty'] as const;

export const advancedFormSchema = z
  .object({
    name: z.string().min(3, 'Use pelo menos 3 caracteres para o nome.'),
    slug: z
      .string()
      .min(3, 'Use pelo menos 3 caracteres para o slug.')
      .regex(/^[a-z0-9-]+$/, 'Use apenas letras minusculas, numeros e hifens.'),
    platform: z.enum(platformOptions, {
      error: 'Selecione uma plataforma.',
    }),
    ownerTeam: z.string().min(1, 'Selecione o time responsavel.'),
    journeyType: z.enum(journeyOptions, {
      error: 'Selecione a jornada principal.',
    }),
    launchMode: z.enum(launchModeOptions),
    scheduledAt: z.string(),
    riskLevel: z.enum(riskLevelOptions),
    requiresApproval: z.boolean(),
    approverEmail: z.string(),
    supportChannel: z.enum(supportChannelOptions),
    accessibilityReview: z.boolean(),
    observabilityNotes: z.string(),
    checkpoints: z
      .array(
        z.object({
          label: z.string().min(2, 'Nomeie o checkpoint.'),
          url: z.url('Use uma URL valida.'),
        }),
      )
      .min(1, 'Adicione ao menos um checkpoint.'),
  })
  .superRefine((value, ctx) => {
    if (value.launchMode === 'scheduled' && !value.scheduledAt) {
      ctx.addIssue({
        code: 'custom',
        message: 'Informe a data planejada para o rollout.',
        path: ['scheduledAt'],
      });
    }

    if (value.requiresApproval) {
      const emailResult = z.email().safeParse(value.approverEmail);

      if (!emailResult.success) {
        ctx.addIssue({
          code: 'custom',
          message: 'Informe um email valido para aprovacao.',
          path: ['approverEmail'],
        });
      }
    }

    if (value.riskLevel === 'high' && value.observabilityNotes.trim().length < 12) {
      ctx.addIssue({
        code: 'custom',
        message: 'Explique como o rollout sera monitorado em detalhes.',
        path: ['observabilityNotes'],
      });
    }

    if (value.journeyType === 'checkout' && !value.accessibilityReview) {
      ctx.addIssue({
        code: 'custom',
        message: 'Fluxos de checkout exigem revisao de acessibilidade.',
        path: ['accessibilityReview'],
      });
    }
  });

export type AdvancedFormValues = z.infer<typeof advancedFormSchema>;

export const advancedFormDefaults: AdvancedFormValues = {
  name: 'Rollout observavel do checkout',
  slug: 'checkout-guard-v2',
  platform: 'web',
  ownerTeam: 'Checkout',
  journeyType: 'checkout',
  launchMode: 'scheduled',
  scheduledAt: '2026-04-12',
  riskLevel: 'moderate',
  requiresApproval: true,
  approverEmail: 'lead@testforge.dev',
  supportChannel: 'slack',
  accessibilityReview: true,
  observabilityNotes: 'Alertas e dashboard alinhados com o time de observabilidade.',
  checkpoints: [{ label: 'Smoke', url: 'https://status.testforge.dev/smoke' }],
};
