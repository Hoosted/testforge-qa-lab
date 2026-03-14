# ADR-0008 - Adotar JWT Com Access Token E Refresh Token

- Status: `Accepted`
- Data: `2026-03-14`

## Contexto

O sistema precisa ter autenticacao realista o suficiente para praticar:

- login
- expiracao de sessao
- renovacao de token
- autorizacao
- testes de seguranca e integracao

## Decisao

O backend prepara a base para uma estrategia com:

- `access token JWT` de curta duracao
- `refresh token` separado
- `JwtStrategy` para proteger endpoints
- armazenamento de sessoes de refresh no banco

A implementacao completa do fluxo ainda sera feita depois, mas a fundacao tecnica ja esta definida.

## Consequencias

- aproxima o projeto de cenarios reais de mercado
- cria uma superficie rica para testes automatizados
- permite evoluir para logout, rotacao de token e revogacao

Trade-offs:

- aumenta complexidade em relacao a um token unico simples
- exige cuidado com expiracao, armazenamento e invalidacao

## Alternativas Consideradas

- sessao server-side tradicional
- JWT unico sem refresh
- mock de autenticacao sem persistencia

## Referencias

- [apps/backend/src/modules/auth/auth.module.ts](C:/Users/PabloHenrique/projects/testforge-qa-lab/apps/backend/src/modules/auth/auth.module.ts)
- [apps/backend/src/modules/auth/auth.service.ts](C:/Users/PabloHenrique/projects/testforge-qa-lab/apps/backend/src/modules/auth/auth.service.ts)
- [apps/backend/src/modules/auth/strategies/jwt.strategy.ts](C:/Users/PabloHenrique/projects/testforge-qa-lab/apps/backend/src/modules/auth/strategies/jwt.strategy.ts)
- [apps/backend/prisma/schema.prisma](C:/Users/PabloHenrique/projects/testforge-qa-lab/apps/backend/prisma/schema.prisma)
