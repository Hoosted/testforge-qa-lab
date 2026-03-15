# ADR-0010 - Preparar O Repositorio Para Automacao De Testes

- Status: `Accepted`
- Data: `2026-03-14`

## Contexto

O objetivo central do TestForge nao e apenas funcionar como produto, mas servir como playground para automacao de testes.

Isso exige que a arquitetura seja desenhada desde o inicio pensando em testabilidade e nao como uma preocupacao tardia.

## Decisao

O repositorio foi preparado para praticar diferentes tipos de testes:

- E2E
- API
- integracao
- contrato
- componentes
- acessibilidade
- visual
- performance

Para isso, a base inclui:

- monorepo organizado
- exemplos de testes
- tipos compartilhados
- scripts previsiveis
- backend com health check e Swagger

## Consequencias

- facilita criar suites de automacao progressivamente
- melhora clareza dos contratos entre camadas
- deixa o projeto mais util para portfolio e treino real

Trade-offs:

- exige mais estrutura inicial
- algumas decisoes favorecem previsibilidade e padronizacao acima de velocidade bruta de prototipagem

## Alternativas Consideradas

- criar arquitetura primeiro e pensar em testes depois
- usar um projeto simples apenas para CRUD
- nao separar exemplos de testes do resto do repositorio

## Referencias

- [tests-examples/package.json](C:/Users/PabloHenrique/projects/testforge-qa-lab/tests-examples/package.json)
- [docs/architecture.md](C:/Users/PabloHenrique/projects/testforge-qa-lab/docs/architecture.md)
