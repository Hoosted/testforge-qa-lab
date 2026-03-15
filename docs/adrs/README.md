# ADRs

Este diretório guarda os `Architecture Decision Records` do TestForge.

Um ADR registra uma decisão arquitetural importante de forma curta e rastreável.

## Como ler

- Cada ADR tem um número sequencial.
- O título resume a decisão.
- O conteúdo explica:
  - contexto
  - decisão
  - consequências
  - alternativas consideradas, quando fizer sentido

## Status

Os status usados no projeto são:

- `Accepted`: decisão adotada e válida
- `Superseded`: decisão substituída por outra ADR
- `Proposed`: decisão em discussão, ainda não consolidada

## Regra para o projeto

Toda decisão arquitetural relevante deve gerar ou atualizar um ADR.

Exemplos:

- troca de stack
- mudança de estratégia de autenticação
- alteração na estrutura do monorepo
- adoção de um novo padrão de API
- mudança de banco, ORM ou estratégia de deploy

## Índice

- [ADR-0001](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/0001-use-adrs-for-architectural-decisions.md) - Usar ADRs para registrar decisões arquiteturais
- [ADR-0002](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/0002-adopt-pnpm-workspaces-and-turborepo.md) - Adotar PNPM Workspaces e Turborepo
- [ADR-0003](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/0003-standardize-on-typescript-across-the-stack.md) - Padronizar TypeScript em todo o projeto
- [ADR-0004](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/0004-adopt-react-vite-and-feature-oriented-frontend.md) - Adotar React, Vite e frontend orientado por features
- [ADR-0005](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/0005-adopt-nestjs-for-the-backend-core.md) - Adotar NestJS para a base do backend
- [ADR-0006](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/0006-adopt-prisma-with-postgresql.md) - Adotar Prisma com PostgreSQL
- [ADR-0007](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/0007-standardize-rest-api-conventions.md) - Padronizar convenções da API REST
- [ADR-0008](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/0008-adopt-jwt-access-and-refresh-token-strategy.md) - Adotar JWT com access token e refresh token
- [ADR-0009](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/0009-adopt-docker-compose-for-local-infrastructure.md) - Adotar Docker Compose para infraestrutura local
- [ADR-0010](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/0010-prepare-the-repository-for-test-automation.md) - Preparar o repositório para automação de testes

## Template

Use como base o arquivo:

- [adr-template.md](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/adr-template.md)
