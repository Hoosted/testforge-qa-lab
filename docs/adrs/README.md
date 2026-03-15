# ADRs

Este diretorio guarda os `Architecture Decision Records` do TestForge.

Um ADR registra uma decisao arquitetural importante de forma curta e rastreavel.

## Como ler

- Cada ADR tem um numero sequencial.
- O titulo resume a decisao.
- O conteudo explica:
  - contexto
  - decisao
  - consequencias
  - alternativas consideradas, quando fizer sentido

## Status

Os status usados no projeto sao:

- `Accepted`: decisao adotada e valida
- `Superseded`: decisao substituida por outra ADR
- `Proposed`: decisao em discussao, ainda nao consolidada

## Regra para o projeto

Toda decisao arquitetural relevante deve gerar ou atualizar um ADR.

Exemplos:

- troca de stack
- mudanca de estrategia de autenticacao
- alteracao na estrutura do monorepo
- adocao de um novo padrao de API
- mudanca de banco, ORM ou estrategia de deploy

## Indice

- [ADR-0001](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/0001-use-adrs-for-architectural-decisions.md) - Usar ADRs para registrar decisoes arquiteturais
- [ADR-0002](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/0002-adopt-pnpm-workspaces-and-turborepo.md) - Adotar PNPM Workspaces e Turborepo
- [ADR-0003](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/0003-standardize-on-typescript-across-the-stack.md) - Padronizar TypeScript em todo o projeto
- [ADR-0004](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/0004-adopt-react-vite-and-feature-oriented-frontend.md) - Adotar React, Vite e frontend orientado por features
- [ADR-0005](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/0005-adopt-nestjs-for-the-backend-core.md) - Adotar NestJS para a base do backend
- [ADR-0006](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/0006-adopt-prisma-with-postgresql.md) - Adotar Prisma com PostgreSQL
- [ADR-0007](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/0007-standardize-rest-api-conventions.md) - Padronizar convencoes da API REST
- [ADR-0008](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/0008-adopt-jwt-access-and-refresh-token-strategy.md) - Adotar JWT com access token e refresh token
- [ADR-0009](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/0009-adopt-docker-compose-for-local-infrastructure.md) - Adotar Docker Compose para infraestrutura local
- [ADR-0010](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/0010-prepare-the-repository-for-test-automation.md) - Preparar o repositorio para automacao de testes
- [ADR-0011](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/0011-adopt-http-only-refresh-cookie-with-role-based-access.md) - Adotar refresh token em cookie httpOnly e autorizacao por papeis
- [ADR-0012](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/0012-adopt-products-and-admin-users-as-the-first-business-domains.md) - Adotar produtos e gestao administrativa de usuarios como primeiros dominios de negocio`r`n- [ADR-0013](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/0013-adopt-advanced-product-wizard-for-automation-training.md) - Adotar wizard avancado de produtos para treino de automacao

## Template

Use como base o arquivo:

- [adr-template.md](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/adr-template.md)
