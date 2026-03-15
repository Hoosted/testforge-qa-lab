# ADR-0011 - Adotar Refresh Token Em Cookie HttpOnly E Autorizacao Por Papeis

- Status: `Accepted`
- Data: `2026-03-14`

## Contexto

O TestForge precisava sair da fundacao de JWT e entrar em um fluxo de autenticacao utilizavel de verdade, tanto para uso manual quanto para automacao de testes.

Os requisitos principais eram:

- login e logout reais
- restauracao de sessao em refresh de pagina
- perfis com diferenca real de permissao
- feedback visual claro no frontend
- previsibilidade para cenarios automatizados

Tambem era importante evitar uma estrategia em que o frontend dependesse de guardar credenciais sensiveis de forma fraca apenas para manter o usuario autenticado.

## Decisao

O projeto adota a seguinte estrategia:

- `access token JWT` enviado no corpo da resposta e usado nas chamadas autenticadas
- `refresh token` persistido em cookie `httpOnly`
- renovacao de sessao por endpoint dedicado `/auth/refresh`
- rotacao de refresh token com persistencia em `RefreshSession`
- logout invalidando a sessao de refresh atual
- autorizacao baseada em papéis com dois perfis:
  - `ADMIN`
  - `OPERATOR`

As permissoes ficam assim:

- `ADMIN`: pode acessar area de operador e area administrativa
- `OPERATOR`: pode acessar apenas a area de operador

No frontend:

- a sessao em memoria e restaurada ao recarregar a pagina via refresh token
- rotas protegidas exigem autenticacao
- rotas de papel exigem autorizacao explicita
- elementos principais recebem `data-testid` para facilitar automacao

## Consequencias

- melhora seguranca em relacao a guardar refresh token em `localStorage`
- cria um fluxo realista de autenticacao para treino de testes
- permite validar cenarios de expiracao, renovacao e logout
- deixa a diferenca entre autenticacao e autorizacao visivel no sistema

Trade-offs:

- o fluxo fica mais complexo do que um JWT unico simples
- o frontend precisa lidar com renovacao de sessao
- testes precisam considerar cookies e tokens no fluxo autenticado

## Alternativas Consideradas

- guardar access e refresh token no `localStorage`
- usar apenas um JWT sem refresh
- fazer mock de login apenas no frontend
- usar sessao server-side tradicional

Essas alternativas foram rejeitadas porque reduzem o valor do projeto como laboratorio de autenticacao e automacao realista.

## Referencias

- [apps/backend/src/modules/auth/auth.controller.ts](C:/Users/PabloHenrique/projects/testforge-qa-lab/apps/backend/src/modules/auth/auth.controller.ts)
- [apps/backend/src/modules/auth/auth.service.ts](C:/Users/PabloHenrique/projects/testforge-qa-lab/apps/backend/src/modules/auth/auth.service.ts)
- [apps/frontend/src/features/auth/auth-context.tsx](C:/Users/PabloHenrique/projects/testforge-qa-lab/apps/frontend/src/features/auth/auth-context.tsx)
- [apps/frontend/src/features/auth/components/protected-route.tsx](C:/Users/PabloHenrique/projects/testforge-qa-lab/apps/frontend/src/features/auth/components/protected-route.tsx)
- [apps/frontend/src/features/auth/components/role-route.tsx](C:/Users/PabloHenrique/projects/testforge-qa-lab/apps/frontend/src/features/auth/components/role-route.tsx)
