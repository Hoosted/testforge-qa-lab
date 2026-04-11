import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  advancedFormScenarios,
  guides,
  ownerTeamsByPlatform,
  scenarioTone,
  supportChannelsByPlatform,
} from '@/data/playground';
import { useAuth } from '@/features/auth/auth-context';
import { submitAdvancedForm, validateSlug } from '@/features/form-lab/api';
import {
  advancedFormDefaults,
  advancedFormSchema,
  type AdvancedFormValues,
  journeyOptions,
  launchModeOptions,
  platformOptions,
  riskLevelOptions,
} from '@/features/form-lab/form-schema';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import type { AdvancedFormPayload, AdvancedFormScenarioId } from '@/types/playground';

const steps = [
  {
    id: 'overview',
    title: 'Contexto',
    description: 'Defina o rollout, a plataforma e a jornada principal antes de testar erros.',
    fields: ['name', 'slug', 'platform', 'ownerTeam', 'journeyType'] as const,
  },
  {
    id: 'delivery',
    title: 'Entrega',
    description: 'Ajuste quando o fluxo entra em producao e para onde o suporte operacional aponta.',
    fields: ['launchMode', 'scheduledAt', 'supportChannel'] as const,
  },
  {
    id: 'risk',
    title: 'Risco',
    description: 'Consolide aprovacoes, acessibilidade, observabilidade e checkpoints repetiveis.',
    fields: [
      'riskLevel',
      'requiresApproval',
      'approverEmail',
      'accessibilityReview',
      'observabilityNotes',
      'checkpoints',
    ] as const,
  },
] as const;

function normalizePayload(values: AdvancedFormValues): AdvancedFormPayload {
  return {
    ...values,
    scheduledAt: values.launchMode === 'scheduled' ? values.scheduledAt : undefined,
    approverEmail: values.requiresApproval ? values.approverEmail : undefined,
    observabilityNotes: values.observabilityNotes.trim() || undefined,
    checkpoints: values.checkpoints.map((item) => ({
      label: item.label.trim(),
      url: item.url.trim(),
    })),
  };
}

export function AdvancedFormLabPage() {
  const guide = guides.find((entry) => entry.labId === 'advanced-form');
  const { session, canWrite } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [scenario, setScenario] = useState<AdvancedFormScenarioId>('happy');
  const form = useForm<AdvancedFormValues>({
    resolver: zodResolver(advancedFormSchema),
    defaultValues: advancedFormDefaults,
    mode: 'onBlur',
  });
  const {
    fields: checkpointFields,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: 'checkpoints',
  });

  const watchedSlug = form.watch('slug');
  const watchedPlatform = form.watch('platform');
  const watchedLaunchMode = form.watch('launchMode');
  const watchedRequiresApproval = form.watch('requiresApproval');
  const watchedRiskLevel = form.watch('riskLevel');
  const debouncedSlug = useDebouncedValue(watchedSlug, 300);
  const currentTone = scenarioTone[scenario];
  const activeStepConfig = steps[activeStep];

  const slugValidationQuery = useQuery({
    queryKey: ['advanced-form', 'slug', debouncedSlug, scenario],
    queryFn: () => validateSlug(debouncedSlug, scenario),
    enabled: debouncedSlug.trim().length >= 3,
  });

  useEffect(() => {
    if (!slugValidationQuery.data || !debouncedSlug.trim()) {
      return;
    }

    if (!slugValidationQuery.data.available) {
      form.setError('slug', {
        type: 'validate',
        message: slugValidationQuery.data.reason ?? 'Esse slug ja esta reservado.',
      });
      return;
    }

    if (form.formState.errors.slug?.type === 'validate') {
      form.clearErrors('slug');
    }
  }, [debouncedSlug, form, slugValidationQuery.data, form.formState.errors.slug?.type]);

  const submitMutation = useMutation({
    mutationFn: (values: AdvancedFormValues) =>
      submitAdvancedForm(normalizePayload(values), {
        scenario,
        token: session?.token ?? null,
      }),
  });

  const ownerTeams = useMemo(
    () => ownerTeamsByPlatform[watchedPlatform ?? 'web'],
    [watchedPlatform],
  );

  const supportChannels = useMemo(
    () => supportChannelsByPlatform[watchedPlatform ?? 'web'],
    [watchedPlatform],
  );

  const moveStep = async (nextStep: number) => {
    if (nextStep <= activeStep) {
      setActiveStep(nextStep);
      return;
    }

    const valid = await form.trigger([...steps[activeStep].fields]);

    if (valid) {
      setActiveStep(nextStep);
    }
  };

  const handleSubmit = form.handleSubmit((values) => {
    submitMutation.mutate(values);
  });

  return (
    <section className="page-shell">
      <div className="page-intro">
        <p className="eyebrow">Advanced Form Lab</p>
        <h1>O lab principal agora deixa o wizard no centro e o contexto ao redor, nao em cima dele.</h1>
        <p className="lede">
          Entre como admin para o fluxo feliz ou como operator para validar 403. Depois altere o
          cenario e force 401, 409 ou 500 sem trocar de pagina.
        </p>
      </div>

      <section className="context-strip">
        <div className="context-card">
          <p className="eyebrow">{currentTone.eyebrow}</p>
          <h2>{advancedFormScenarios.find((item) => item.id === scenario)?.title}</h2>
          <p className="support-copy">{currentTone.helper}</p>
          <div className="scenario-list" role="list" aria-label="Cenarios">
            {advancedFormScenarios.map((item) => (
              <button
                key={item.id}
                className={cn('scenario-chip', item.id === scenario && 'scenario-chip-active')}
                onClick={() => setScenario(item.id as AdvancedFormScenarioId)}
                type="button"
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>

        <aside className="context-card">
          <p className="eyebrow">Sessao atual</p>
          {session ? (
            <div className="status-stack">
              <strong>{session.email}</strong>
              <span>{session.role}</span>
              <p>{canWrite ? 'Pode escrever no lab.' : 'Vai receber 403 ao enviar.'}</p>
            </div>
          ) : (
            <div className="status-stack">
              <p>Este lab exige autenticacao.</p>
              <Link className="primary-link" to="/entrar">
                Entrar agora
              </Link>
            </div>
          )}
        </aside>
      </section>

      <div className="lab-workspace">
        <section className="panel panel-strong">
          <div className="step-row" role="tablist" aria-label="Etapas do formulario">
            {steps.map((step, index) => (
              <button
                key={step.id}
                className={cn('step-button', index === activeStep && 'step-button-active')}
                onClick={() => {
                  void moveStep(index);
                }}
                role="tab"
                type="button"
              >
                <span>{index + 1}</span>
                {step.title}
              </button>
            ))}
          </div>

          <div className="step-intro">
            <p className="eyebrow">Etapa {activeStep + 1}</p>
            <h2>{activeStepConfig.title}</h2>
            <p className="support-copy">{activeStepConfig.description}</p>
          </div>

          <form className="form-stack" onSubmit={handleSubmit}>
            {activeStep === 0 ? (
              <div className="field-grid">
                <label className="field">
                  Nome do rollout
                  <input
                    {...form.register('name')}
                    className="field-control"
                    data-testid="advanced-form-name"
                  />
                  <span className="field-error">{form.formState.errors.name?.message}</span>
                </label>

                <label className="field">
                  Slug
                  <input
                    {...form.register('slug')}
                    className="field-control"
                    data-testid="advanced-form-slug"
                  />
                  <span className="field-error">{form.formState.errors.slug?.message}</span>
                  {slugValidationQuery.isFetching ? (
                    <span className="field-hint">Validando disponibilidade...</span>
                  ) : null}
                  {slugValidationQuery.data?.available ? (
                    <span className="field-success">Slug liberado para uso.</span>
                  ) : null}
                </label>

                <label className="field">
                  Plataforma
                  <select {...form.register('platform')} className="field-control">
                    {platformOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  Time responsavel
                  <select {...form.register('ownerTeam')} className="field-control">
                    {ownerTeams.map((team) => (
                      <option key={team} value={team}>
                        {team}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field field-full">
                  Jornada principal
                  <select {...form.register('journeyType')} className="field-control">
                    {journeyOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : null}

            {activeStep === 1 ? (
              <div className="field-grid">
                <label className="field">
                  Modo de lancamento
                  <select {...form.register('launchMode')} className="field-control">
                    {launchModeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                {watchedLaunchMode === 'scheduled' ? (
                  <label className="field">
                    Data planejada
                    <input className="field-control" type="date" {...form.register('scheduledAt')} />
                    <span className="field-error">{form.formState.errors.scheduledAt?.message}</span>
                  </label>
                ) : null}

                <label className="field field-full">
                  Canal principal de suporte
                  <select {...form.register('supportChannel')} className="field-control">
                    {supportChannels.map((channel) => (
                      <option key={channel} value={channel}>
                        {channel}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : null}

            {activeStep === 2 ? (
              <div className="field-grid">
                <label className="field">
                  Nivel de risco
                  <select {...form.register('riskLevel')} className="field-control">
                    {riskLevelOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field field-toggle">
                  <span className="toggle-copy">
                    <strong>Requer aprovacao manual</strong>
                    <span className="field-hint">Ative para exigir um aprovador antes do envio.</span>
                  </span>
                  <input className="toggle-control" type="checkbox" {...form.register('requiresApproval')} />
                </label>

                {watchedRequiresApproval ? (
                  <label className="field field-full">
                    Email do aprovador
                    <input className="field-control" {...form.register('approverEmail')} />
                    <span className="field-error">{form.formState.errors.approverEmail?.message}</span>
                  </label>
                ) : null}

                <label className="field field-toggle">
                  <span className="toggle-copy">
                    <strong>Revisao de acessibilidade concluida</strong>
                    <span className="field-hint">Checkout sem revisao deve falhar no schema.</span>
                  </span>
                  <input
                    className="toggle-control"
                    type="checkbox"
                    {...form.register('accessibilityReview')}
                  />
                </label>
                <span className="field-error field-full">
                  {form.formState.errors.accessibilityReview?.message}
                </span>

                <label className="field field-full">
                  Notas de observabilidade
                  <textarea className="field-control" rows={4} {...form.register('observabilityNotes')} />
                  <span className="field-error">
                    {form.formState.errors.observabilityNotes?.message}
                  </span>
                  {watchedRiskLevel === 'high' ? (
                    <span className="field-hint">
                      Risco alto exige estrategia de monitoramento detalhada.
                    </span>
                  ) : null}
                </label>

                <div className="field field-full">
                  <div className="field-row">
                    <div>
                      <strong>Checkpoints monitorados</strong>
                      <p className="field-hint">Campos repetiveis otimos para automacao.</p>
                    </div>
                    <button
                      className="secondary-button"
                      onClick={() => append({ label: '', url: '' })}
                      type="button"
                    >
                      Adicionar checkpoint
                    </button>
                  </div>

                  <div className="repeatable-stack">
                    {checkpointFields.map((field, index) => (
                      <div className="repeatable-row" key={field.id}>
                        <label className="field">
                          Nome
                          <input
                            className="field-control"
                            {...form.register(`checkpoints.${index}.label`)}
                          />
                        </label>
                        <label className="field">
                          URL
                          <input className="field-control" {...form.register(`checkpoints.${index}.url`)} />
                        </label>
                        <button
                          className="secondary-button"
                          disabled={checkpointFields.length === 1}
                          onClick={() => remove(index)}
                          type="button"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                  <span className="field-error">{form.formState.errors.checkpoints?.message}</span>
                </div>
              </div>
            ) : null}

            {submitMutation.error ? (
              <div className="inline-alert" role="alert">
                {submitMutation.error instanceof ApiError
                  ? `${submitMutation.error.status}: ${submitMutation.error.message}`
                  : 'Nao foi possivel concluir a simulacao.'}
              </div>
            ) : null}

            {submitMutation.data ? (
              <div className="inline-success" role="status">
                Submissao {submitMutation.data.id} enfileirada com sucesso para o time{' '}
                {submitMutation.data.ownerTeam}.
              </div>
            ) : null}

            <div className="action-row">
              <button
                className="secondary-button"
                disabled={activeStep === 0}
                onClick={() => {
                  void moveStep(activeStep - 1);
                }}
                type="button"
              >
                Etapa anterior
              </button>

              {activeStep < steps.length - 1 ? (
                <button
                  className="primary-button"
                  onClick={() => {
                    void moveStep(activeStep + 1);
                  }}
                  type="button"
                >
                  Proxima etapa
                </button>
              ) : (
                <button className="primary-button" disabled={submitMutation.isPending} type="submit">
                  {submitMutation.isPending ? 'Enfileirando...' : 'Enviar simulacao'}
                </button>
              )}
            </div>
          </form>
        </section>

        <aside className="info-rail">
          <section className="panel summary-panel">
            <p className="eyebrow">Resumo vivo</p>
            <dl className="summary-list">
              <div>
                <dt>Slug</dt>
                <dd>{form.watch('slug') || '-'}</dd>
              </div>
              <div>
                <dt>Plataforma</dt>
                <dd>{form.watch('platform')}</dd>
              </div>
              <div>
                <dt>Risco</dt>
                <dd>{form.watch('riskLevel')}</dd>
              </div>
              <div>
                <dt>Aprovacao</dt>
                <dd>{form.watch('requiresApproval') ? 'Obrigatoria' : 'Nao requerida'}</dd>
              </div>
              <div>
                <dt>Checkpoints</dt>
                <dd>{form.watch('checkpoints').length}</dd>
              </div>
            </dl>
          </section>

          {guide ? (
            <section className="panel">
              <p className="eyebrow">O que praticar</p>
              <div className="bullet-columns">
                <div>
                  <h3>Objetivos</h3>
                  <ul className="plain-list compact-list">
                    {guide.goals.map((goal) => (
                      <li key={goal}>{goal}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Critérios</h3>
                  <ul className="plain-list compact-list">
                    {guide.successCriteria.map((criterion) => (
                      <li key={criterion}>{criterion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          ) : null}

          <section className="panel">
            <div className="mini-contract">
              <p className="eyebrow">Contrato observado</p>
              <code>POST /api/labs/advanced-form/submissions</code>
              <p className="field-hint">
                O header `x-testforge-scenario` controla a falha previsivel. O `Authorization`
                define o papel ativo.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
