# ADR-0003 - Padronizar TypeScript Em Todo O Projeto

- Status: `Accepted`
- Data: `2026-03-14`

## Contexto

O projeto foi pensado para ser full stack, com compartilhamento de contratos, evolucao incremental e foco em refatoracao segura.

Tambem existe uma necessidade clara de preparar terreno para testes de API, integracao e contrato.

## Decisao

Todo o projeto usa TypeScript:

- frontend
- backend
- pacotes compartilhados
- scripts de seed

Foi adotado `strict mode` com configuracao compartilhada em `tsconfig.base.json`.

## Consequencias

- melhora consistencia entre camadas
- reduz ambiguidade de contratos
- ajuda na evolucao de APIs e tipos compartilhados
- aumenta seguranca de refatoracao

Trade-offs:

- configuracao inicial e tipagem exigem mais disciplina
- alguns tipos de bibliotecas externas exigem mais ajuste

## Alternativas Consideradas

- JavaScript no frontend e TypeScript apenas no backend
- TypeScript apenas nos apps principais
- sem compartilhamento de configuracao base

## Referencias

- [tsconfig.base.json](C:/Users/PabloHenrique/projects/testforge-qa-lab/tsconfig.base.json)
- [packages/shared-types/src/index.ts](C:/Users/PabloHenrique/projects/testforge-qa-lab/packages/shared-types/src/index.ts)
