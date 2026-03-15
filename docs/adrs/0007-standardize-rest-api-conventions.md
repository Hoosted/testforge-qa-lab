# ADR-0007 - Padronizar Convencoes Da API REST

- Status: `Accepted`
- Data: `2026-03-14`

## Contexto

Como o TestForge sera usado para treinar testes de API, integracao e contrato, a API precisa seguir um padrao previsivel.

Sem isso, cada modulo tende a responder de um jeito diferente, o que piora a experiencia de desenvolvimento e de automacao.

## Decisao

A API segue estas convencoes:

- estilo REST
- prefixo global `/api`
- versionamento por URI com `/v1`
- validacao global de entrada
- erros padronizados por filtro global
- documentacao Swagger em `/api/docs`

## Consequencias

- consumidores da API sabem onde encontrar rotas e documentacao
- contratos ficam mais estaveis para testes automatizados
- mudancas futuras de versao ficam mais controladas

Trade-offs:

- exige manter consistencia entre modulos
- evolucoes maiores podem demandar nova versao em vez de mudanca direta

## Alternativas Consideradas

- sem versionamento inicial
- GraphQL desde o inicio
- respostas e erros definidos livremente por modulo

## Referencias

- [apps/backend/src/main.ts](C:/Users/PabloHenrique/projects/testforge-qa-lab/apps/backend/src/main.ts)
- [apps/backend/src/common/filters/global-exception.filter.ts](C:/Users/PabloHenrique/projects/testforge-qa-lab/apps/backend/src/common/filters/global-exception.filter.ts)
