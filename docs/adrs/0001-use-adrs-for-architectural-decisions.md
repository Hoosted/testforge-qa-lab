# ADR-0001 - Usar ADRs Para Registrar Decisoes Arquiteturais

- Status: `Accepted`
- Data: `2026-03-14`

## Contexto

O TestForge esta sendo construido para servir como projeto de portfolio e como laboratorio de automacao de testes.

Esse tipo de projeto tende a crescer rapido em numero de modulos, ferramentas, integracoes e fluxos de entrega. Sem historico de decisoes, novas pessoas no projeto acabam vendo apenas o estado atual do codigo, mas nao entendem por que a arquitetura ficou daquele jeito.

## Decisao

Todas as decisoes arquiteturais relevantes devem ser registradas em ADRs dentro de `docs/adrs`.

As proximas decisoes tambem devem seguir esse processo, em vez de ficarem apenas em conversa, commit ou memoria implicita do time.

## Consequencias

- o projeto ganha historico tecnico legivel
- novas pessoas conseguem entender contexto e trade-offs com menos dependencia de onboarding oral
- mudancas futuras ficam mais faceis de avaliar
- decisoes antigas podem ser substituidas com rastreabilidade

## Alternativas Consideradas

- manter decisoes apenas em README
- confiar apenas no historico de commits
- documentar apenas quando houver problema

Essas alternativas foram rejeitadas porque nao oferecem contexto suficiente nem uma trilha clara de evolucao arquitetural.

## Referencias

- [docs/adrs/README.md](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/adrs/README.md)
