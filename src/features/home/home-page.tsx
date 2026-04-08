import { Link } from 'react-router-dom';
import { labs } from '@/data/playground';

export function HomePage() {
  const featuredLabs = labs.slice(0, 3);

  return (
    <div className="home-shell">
      <section className="hero-poster">
        <div className="hero-copy">
          <p className="eyebrow">Editorial QA playground</p>
          <h1>Pratique testes onde os estados importam, nao onde o setup engole seu tempo.</h1>
          <p className="lede">
            TestForge nasceu para ser pequeno o bastante para entender em minutos e rico o bastante
            para render boas suites de UI, API, auth e acessibilidade.
          </p>
          <div className="action-row">
            <Link className="primary-link" to="/labs">
              Explorar labs
            </Link>
            <Link className="secondary-link" to="/entrar">
              Entrar com seed
            </Link>
          </div>
        </div>

        <div className="hero-rail">
          <div className="rail-line">
            <span>UI automation</span>
            <span>API contracts</span>
            <span>Auth & roles</span>
            <span>A11y</span>
          </div>
          <div className="hero-note">
            <strong>Deterministico por design.</strong>
            <p>Os cenarios de erro sao acionados por seed e header, nao por sorte.</p>
          </div>
        </div>
      </section>

      <section className="editorial-strip">
        <div>
          <p className="eyebrow">Como o produto pensa</p>
          <h2>Quatro labs, uma fonte de verdade e a mesma camada de dados para UI, mock e teste.</h2>
        </div>
        <p className="support-copy">
          O reboot abandona o produto legado e foca em superficies modulares. A primeira entrega ja
          nasce com contratos tipados, identidade forte e um lab funcional de ponta a ponta.
        </p>
      </section>

      <section className="feature-columns">
        {featuredLabs.map((lab) => (
          <article className="feature-column" key={lab.id}>
            <p className="eyebrow">{lab.difficulty}</p>
            <h3>{lab.title}</h3>
            <p>{lab.summary}</p>
            <Link className="text-link" to={lab.route}>
              Abrir lab
            </Link>
          </article>
        ))}
      </section>

      <section className="final-cta">
        <div>
          <p className="eyebrow">Fonte de verdade</p>
          <h2>Produto, UI, arquitetura e criterios de evolucao vivem no `AGENTS.md`.</h2>
        </div>
        <Link className="secondary-link" to="/labs/formulario-avancado">
          Abrir o lab principal
        </Link>
      </section>
    </div>
  );
}
