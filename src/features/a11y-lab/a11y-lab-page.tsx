import { useId, useState } from 'react';

export function A11yLabPage() {
  const [announcement, setAnnouncement] = useState('Nenhuma acao executada ainda.');
  const inputId = useId();

  return (
    <section className="page-shell">
      <a className="skip-link" href={`#${inputId}`}>
        Pular para a zona de formulario
      </a>

      <div className="page-intro">
        <p className="eyebrow">Accessibility Lab</p>
        <h1>Landmarks, teclado, mensagens associadas e feedback dinamico em uma tela curta.</h1>
        <p className="lede">
          O objetivo aqui nao e esconder a implementacao. E deixar claro o que deve ser auditado,
          manualmente ou por automacao.
        </p>
      </div>

      <div className="split-layout">
        <section className="panel">
          <h2>Checklist rapido</h2>
          <ul className="plain-list">
            <li>Verifique a ordem de tabulacao.</li>
            <li>Inspecione foco visivel em links, botoes e campos.</li>
            <li>Confirme se mensagens de erro estao ligadas aos inputs.</li>
            <li>Observe o live region abaixo quando a acao for disparada.</li>
          </ul>
        </section>

        <section className="panel panel-strong">
          <h2>Live region</h2>
          <p aria-live="polite" className="status-note">
            {announcement}
          </p>
          <button
            className="primary-button"
            onClick={() => setAnnouncement('Feedback dinamico atualizado com sucesso.')}
            type="button"
          >
            Atualizar feedback
          </button>
        </section>
      </div>

      <section className="panel">
        <h2 id={inputId}>Zona de formulario acessivel</h2>
        <div className="field-grid">
          <label className="field" htmlFor="email-a11y">
            Email para callback
            <input className="field-control" id="email-a11y" name="email-a11y" type="email" />
            <span className="field-hint">Use este campo para testar associacao entre label e input.</span>
          </label>

          <label className="field" htmlFor="notes-a11y">
            Observacoes
            <textarea className="field-control" id="notes-a11y" name="notes-a11y" rows={4} />
          </label>
        </div>
      </section>
    </section>
  );
}
