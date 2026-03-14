# ADR-0006 - Adotar Prisma Com PostgreSQL

- Status: `Accepted`
- Data: `2026-03-14`

## Contexto

O projeto precisa de persistencia relacional, migrations, seed e um caminho claro para modelagem de entidades com relacionamentos reais.

Tambem era importante manter o backend acessivel para quem esta treinando automacao de API e integracao.

## Decisao

O projeto adota:

- `PostgreSQL` como banco principal
- `Prisma` como ORM e ferramenta de schema, migration e seed

Foi criada uma modelagem inicial com:

- `User`
- `RefreshSession`

## Consequencias

- schema e migrations ficam mais previsiveis
- seed inicial ajuda a preparar massa de dados local
- PostgreSQL oferece recursos maduros para o crescimento do dominio

Trade-offs:

- Prisma adiciona etapa de generate
- mudancas de schema exigem disciplina com migrations

## Alternativas Consideradas

- TypeORM
- Sequelize
- SQLite como banco principal do projeto

## Referencias

- [apps/backend/prisma/schema.prisma](C:/Users/PabloHenrique/projects/testforge-qa-lab/apps/backend/prisma/schema.prisma)
- [apps/backend/prisma/migrations/20260314193000_init/migration.sql](C:/Users/PabloHenrique/projects/testforge-qa-lab/apps/backend/prisma/migrations/20260314193000_init/migration.sql)
- [apps/backend/prisma/seed.ts](C:/Users/PabloHenrique/projects/testforge-qa-lab/apps/backend/prisma/seed.ts)
