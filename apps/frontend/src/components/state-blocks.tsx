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
      <p className="eyebrow">Loading</p>
      <h2>{title}</h2>
      <p className="muted">{description}</p>
    </section>
  );
}

export function ErrorState({ title, description, action, testId }: StateBlockProps) {
  return (
    <section className="panel state-panel" data-testid={testId}>
      <p className="eyebrow">Error</p>
      <h2>{title}</h2>
      <p className="form-alert">{description}</p>
      {action}
    </section>
  );
}

export function EmptyState({ title, description, action, testId }: StateBlockProps) {
  return (
    <section className="panel state-panel" data-testid={testId}>
      <p className="eyebrow">Empty state</p>
      <h2>{title}</h2>
      <p className="muted">{description}</p>
      {action}
    </section>
  );
}
