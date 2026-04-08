import { Link } from 'react-router-dom';
import { guides, labs } from '@/data/playground';

export function CatalogPage() {
  return (
    <section className="page-shell">
      <div className="page-intro">
        <p className="eyebrow">Catalogo</p>
        <h1>Escolha um lab, entenda o objetivo em segundos e comece a automatizar.</h1>
        <p className="lede">
          Cada modulo tem dificuldade, tempo estimado, habilidades cobertas e criterios claros de
          sucesso.
        </p>
      </div>

      <div className="catalog-grid">
        {labs.map((lab) => {
          const guide = guides.find((entry) => entry.labId === lab.id);

          return (
            <article className="catalog-card" key={lab.id}>
              <div className="catalog-meta">
                <span>{lab.difficulty}</span>
                <span>{lab.estimatedTime}</span>
                <span>{lab.status}</span>
              </div>
              <h2>{lab.title}</h2>
              <p>{lab.summary}</p>
              {guide ? (
                <ul className="plain-list compact-list">
                  {guide.goals.slice(0, 2).map((goal) => (
                    <li key={goal}>{goal}</li>
                  ))}
                </ul>
              ) : null}
              <div className="tag-row">
                {lab.skills.map((skill) => (
                  <span className="mini-tag" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
              <Link className="text-link" to={lab.route}>
                Abrir experiencia
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
