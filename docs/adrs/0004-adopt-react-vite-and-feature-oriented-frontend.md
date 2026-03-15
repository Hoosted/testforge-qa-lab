# ADR-0004 - Adotar React, Vite E Frontend Orientado Por Features

- Status: `Accepted`
- Data: `2026-03-14`

## Contexto

O frontend precisa parecer um produto real, ter boa experiencia de desenvolvimento e continuar facil de crescer.

Tambem precisa ser bom para praticar:

- testes E2E
- testes de componentes
- acessibilidade
- testes visuais

## Decisao

O frontend usa:

- `React`
- `Vite`
- `React Router`
- `TanStack Query`

A organizacao segue separacao por features e por camadas de app, em vez de um unico diretorio misturando tudo.

## Consequencias

- desenvolvimento local rapido com Vite
- roteamento e dados assincronos com bibliotecas maduras
- organizacao melhor para crescimento por dominio funcional
- melhor superficie para testes de interface e fluxo

Trade-offs:

- React com ecossistema moderno adiciona mais pecas de configuracao
- manter padrao por feature exige disciplina de time

## Alternativas Consideradas

- Next.js desde o inicio
- frontend baseado em pages sem separacao por feature
- estado remoto manual sem TanStack Query

## Referencias

- [apps/frontend/package.json](C:/Users/PabloHenrique/projects/testforge-qa-lab/apps/frontend/package.json)
- [apps/frontend/src/app/router.tsx](C:/Users/PabloHenrique/projects/testforge-qa-lab/apps/frontend/src/app/router.tsx)
- [apps/frontend/src/lib/query-client.ts](C:/Users/PabloHenrique/projects/testforge-qa-lab/apps/frontend/src/lib/query-client.ts)
