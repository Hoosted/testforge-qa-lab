import { healthcheck } from '@testforge/shared-types';

export function HealthPage() {
  return (
    <div className="panel">
      <div className="status-grid">
        <article className="status-card">
          <h2>Frontend</h2>
          <span className="status-chip">Pronto</span>
          <p className="muted">
            Vite, React Router e TanStack Query ja estao conectados ao shell da aplicacao.
          </p>
        </article>

        <article className="status-card">
          <h2>Backend</h2>
          <span className="status-chip">{healthcheck.status}</span>
          <p className="muted">
            A API inicial em NestJS expoe o endpoint de saude em <code>/api/v1/health</code>.
          </p>
        </article>

        <article className="status-card">
          <h2>Monorepo</h2>
          <span className="status-chip">Estruturado</span>
          <p className="muted">
            Tipos compartilhados, configuracoes, documentacao e exemplos de teste estao prontos para
            a proxima etapa.
          </p>
        </article>
      </div>
    </div>
  );
}
