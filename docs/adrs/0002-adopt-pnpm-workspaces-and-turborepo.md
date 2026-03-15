# ADR-0002 - Adotar PNPM Workspaces E Turborepo

- Status: `Accepted`
- Data: `2026-03-14`

## Contexto

O projeto precisa suportar frontend, backend, pacotes compartilhados, exemplos de testes e crescimento futuro sem perder organizacao.

Tambem era importante manter o ambiente local simples e permitir execucao consistente de scripts como `dev`, `build`, `lint`, `test` e `typecheck`.

## Decisao

O TestForge adota:

- `pnpm workspaces` para gerenciamento do monorepo
- `turborepo` para orquestracao de tarefas, cache e pipelines

A estrutura principal do repositorio fica organizada em:

- `apps`
- `packages`
- `docs`
- `tests-examples`

## Consequencias

- facilita compartilhar codigo entre apps e pacotes
- reduz duplicacao de dependencias
- padroniza comandos do dia a dia
- prepara o projeto para CI/CD com pipelines reaproveitaveis

Trade-offs:

- monorepo exige mais cuidado com dependencias e scripts
- pessoas menos acostumadas com workspace podem precisar de onboarding inicial

## Alternativas Consideradas

- repositorios separados para frontend e backend
- npm workspaces sem orquestrador
- um unico app sem separacao por dominios

## Referencias

- [package.json](C:/Users/PabloHenrique/projects/testforge-qa-lab/package.json)
- [pnpm-workspace.yaml](C:/Users/PabloHenrique/projects/testforge-qa-lab/pnpm-workspace.yaml)
- [turbo.json](C:/Users/PabloHenrique/projects/testforge-qa-lab/turbo.json)
