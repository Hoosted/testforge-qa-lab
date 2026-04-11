import { useState } from 'react';
import { Link } from 'react-router-dom';
import { contractCatalog } from '@/data/playground';
import { useAuth } from '@/features/auth/auth-context';
import { apiRequest } from '@/lib/api';
import type {
  AdvancedFormPayload,
  HealthResponse,
  SlugValidationResponse,
  SubmissionResponse,
} from '@/types/playground';

const sampleSubmission: AdvancedFormPayload = {
  name: 'Rollback seguro mobile',
  slug: 'mobile-safe-rollback',
  platform: 'mobile',
  ownerTeam: 'Performance',
  journeyType: 'authentication',
  launchMode: 'immediate',
  riskLevel: 'moderate',
  requiresApproval: false,
  supportChannel: 'pagerduty',
  accessibilityReview: true,
  observabilityNotes: 'Dashboards de login acompanhados em tempo real.',
  checkpoints: [{ label: 'Synthetic login', url: 'https://status.testforge.dev/login' }],
};

export function ApiLabPage() {
  const { session } = useAuth();
  const [result, setResult] = useState<string>('Selecione uma acao para inspecionar o payload.');
  const [isPending, setIsPending] = useState(false);

  async function run(action: () => Promise<unknown>) {
    setIsPending(true);

    try {
      const response = await action();
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha desconhecida';
      setResult(message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section className="page-shell">
      <div className="page-intro">
        <p className="eyebrow">API Lab</p>
        <h1>Contratos tipados e requests previsiveis para praticar leitura de rede sem backend real.</h1>
        <p className="lede">
          Todos os exemplos abaixo usam a mesma camada `MSW` do app. Isso garante que UI, mocks e
          testes apontem para o mesmo contrato.
        </p>
      </div>

      <div className="lab-workspace">
        <section className="panel panel-strong">
          <div className="action-row action-row-fill">
            <button
              className="primary-button"
              onClick={() => run(() => apiRequest<HealthResponse>('/api/health'))}
              type="button"
            >
              GET health
            </button>
            <button
              className="secondary-button"
              onClick={() =>
                run(() =>
                  apiRequest<SlugValidationResponse>('/api/labs/advanced-form/validate-slug', {
                    method: 'POST',
                    json: { slug: 'checkout-guard' },
                    scenario: 'slug-conflict',
                  }),
                )
              }
              type="button"
            >
              POST validate-slug
            </button>
            <button
              className="secondary-button"
              onClick={() =>
                run(() =>
                  apiRequest<SubmissionResponse>('/api/labs/advanced-form/submissions', {
                    method: 'POST',
                    json: sampleSubmission,
                    scenario: 'server-error',
                    token: session?.token ?? null,
                  }),
                )
              }
              type="button"
            >
              POST submission 500
            </button>
          </div>

          <pre className="result-panel" aria-live="polite">
            {isPending ? 'Carregando resposta...' : result}
          </pre>
        </section>

        <aside className="info-rail">
          <section className="panel">
            <p className="eyebrow">Contracts</p>
            <div className="contract-list">
              {contractCatalog.map((contract) => (
                <article className="contract-item" key={contract.id}>
                  <header>
                    <span className="contract-method">{contract.method}</span>
                    <code>{contract.path}</code>
                  </header>
                  <p>{contract.description}</p>
                  <small>Erros previstos: {contract.errorStatuses.join(', ') || 'nenhum'}</small>
                </article>
              ))}
            </div>

            {!session ? (
              <p className="field-hint">
                Para testar submits autenticados, entre com uma seed no{' '}
                <Link to="/entrar">login</Link>.
              </p>
            ) : null}
          </section>
        </aside>
      </div>
    </section>
  );
}
