# ADR-0014: Adotar gestao administrativa de catalogo e historico de auditoria

- Status: Accepted
- Date: 2026-03-14

## Contexto

O dominio principal de produtos do TestForge ja possuia autenticacao, autorizacao por papeis e um fluxo avancado de cadastro. Faltavam, porem, os modulos complementares que tornam a plataforma mais realista para treino de automacao:

- CRUD de categorias
- CRUD de fornecedores
- perfil do usuario autenticado
- historico das alteracoes importantes
- rastreabilidade de quem criou e quem alterou produtos

Esses modulos precisam se integrar ao fluxo principal de produtos sem criar uma arquitetura paralela ou inconsistente.

## Decisao

Adotamos a seguinte estrategia:

- criar modulos dedicados de `categories`, `suppliers` e `audit` no backend
- manter `users` como modulo responsavel por listagem administrativa e perfil autenticado
- registrar eventos relevantes em uma tabela `AuditLog`
- expor historico via endpoint paginado e filtravel
- permitir que `ADMIN` gerencie catalogo, usuarios e auditoria global
- permitir que `OPERATOR` consulte produtos, perfil proprio e historico limitado ao dominio de produtos
- integrar categorias e fornecedores ao fluxo de produtos por meio dos metadados e das telas administrativas do frontend

## Consequencias

### Positivas

- o sistema passa a se comportar mais como um produto real
- automacao ganha superficie para testes de permissao, CRUD, historico e consistencia entre modulos
- auditoria melhora rastreabilidade e explica mudancas no dominio
- categorias e fornecedores deixam de ser apenas dados seedados e passam a ser gerenciaveis

### Negativas

- aumenta o numero de modulos e contratos compartilhados
- exige manter disciplina para registrar eventos de auditoria em mutacoes relevantes
- adiciona mais cenarios de validacao e sincronizacao entre frontend e backend

## Alternativas consideradas

### Registrar auditoria apenas em logs de aplicacao

Foi descartado porque nao atende bem aos casos de uso de consulta na interface e treino de testes de historico.

### Colocar categorias e fornecedores dentro do modulo de produtos

Foi descartado para evitar um modulo inchado e reduzir acoplamento de responsabilidades.

### Permitir que operator veja toda a auditoria

Foi descartado para manter diferencas reais de permissao entre papeis.
