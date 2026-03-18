import type { ReactNode } from 'react';

interface StateBlockProps {
  title: string;
  description: string;
  action?: ReactNode;
  testId: string;
}

export function LoadingState({ title, description, testId }: StateBlockProps) {
  return (
    <section className="panel state-panel" data-testid={testId}>
      <p className="eyebrow">Carregando</p>
      <h2>{title}</h2>
      <p className="muted">{description}</p>
    </section>
  );
}

export function ErrorState({ title, description, action, testId }: StateBlockProps) {
  return (
    <section className="panel state-panel" data-testid={testId}>
      <p className="eyebrow">Algo saiu do esperado</p>
      <h2>{title}</h2>
      <p className="form-alert">{description}</p>
      {action}
    </section>
  );
}

export function EmptyState({ title, description, action, testId }: StateBlockProps) {
  return (
    <section className="panel state-panel" data-testid={testId}>
      <p className="eyebrow">Nada por aqui ainda</p>
      <h2>{title}</h2>
      <p className="muted">{description}</p>
      {action}
    </section>
  );
}

export function SkeletonPanel({ rows = 4, testId }: { rows?: number; testId: string }) {
  return (
    <section className="panel state-panel" data-testid={testId}>
      <p className="eyebrow">Carregando</p>
      <div className="skeleton-grid">
        {Array.from({ length: rows }).map((_, index) => (
          <span key={index} className="skeleton-line" />
        ))}
      </div>
    </section>
  );
}
