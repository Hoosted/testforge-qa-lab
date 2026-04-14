import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="home-shell">
      <section className="home-hero">
        <div className="home-hero-grid">
          <div className="home-copy">
            <p className="eyebrow">QA playground editorial</p>
            <span className="home-kicker">TestForge QA Lab</span>
            <h1>Treine UI, API, auth e acessibilidade em um sandbox previsivel.</h1>
            <p className="lede">
              Um laboratorio pequeno o bastante para entender rapido e realista o bastante para
              render boas suites de teste com estados observaveis de verdade.
            </p>
            <Link className="primary-link home-cta" to="/labs">
              Iniciar
            </Link>
          </div>

          <div aria-hidden="true" className="home-visual">
            <div className="signal-grid" />
            <div className="signal-orb signal-orb-teal" />
            <div className="signal-orb signal-orb-amber" />
            <div className="signal-panel">
              <p>Estados legiveis</p>
              <strong>UI + rede + contrato em sincronia</strong>
            </div>
            <div className="signal-panel signal-panel-offset">
              <p>Seeds fixas</p>
              <strong>Falhas 401, 403, 409 e 500 acionaveis</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section home-section-split">
        <div>
          <p className="eyebrow">Como o sistema funciona</p>
          <h2>Comece pela leitura do desafio, entre no lab e valide cada estado sem depender de sorte.</h2>
        </div>

        <div className="home-process-list">
          <article>
            <span>01</span>
            <div>
              <strong>Contexto claro antes da pratica</strong>
              <p>
                Cada area explica o que treinar, qual seed usar e como reconhecer sucesso pela UI
                ou pela rede.
              </p>
            </div>
          </article>
          <article>
            <span>02</span>
            <div>
              <strong>Cenarios controlados por dados</strong>
              <p>
                Os labs nascem de definicoes tipadas, com cenarios e contratos compartilhados entre
                componentes, mocks e testes.
              </p>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <strong>Espaco seguro para portfolio</strong>
              <p>
                O setup local continua leve enquanto a pratica cobre wizard, auth, contratos e
                acessibilidade.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="home-section home-section-detail">
        <div className="detail-column">
          <p className="eyebrow">Determinismo e observabilidade</p>
          <h2>O foco aqui e treinar automacao reproduzivel, nao lutar contra um ambiente caprichoso.</h2>
        </div>

        <div className="detail-grid">
          <article className="detail-block">
            <strong>UI que mostra o que importa</strong>
            <p>
              A interface expoe estados de loading, erro, permissao e validacao para que o QA veja
              o comportamento antes de automatizar.
            </p>
          </article>
          <article className="detail-block">
            <strong>Rede previsivel via MSW</strong>
            <p>
              A API fake e a fonte de verdade da v1, com respostas estaveis, erros controlados e
              contratos tipados compartilhados.
            </p>
          </article>
          <article className="detail-block">
            <strong>Seeds e perfis publicos</strong>
            <p>
              Admin e operator ajudam a praticar guardas, expiracao de sessao e diferenca entre
              falha de fluxo e falha de autorizacao.
            </p>
          </article>
        </div>
      </section>

      <section className="home-final">
        <div>
          <p className="eyebrow">Pronto para praticar</p>
          <h2>Entre na area de laboratorio e escolha o fluxo que voce quer automatizar primeiro.</h2>
        </div>
        <Link className="primary-link" to="/labs">
          Iniciar
        </Link>
      </section>
    </div>
  );
}
