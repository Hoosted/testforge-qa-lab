# ADR-0013 - Adotar wizard avancado de produtos para treino de automacao

- Status: Accepted
- Date: 2026-03-14

## Contexto

O dominio de produtos ja tinha CRUD e validacoes basicas, mas ainda faltava uma superficie realmente rica para treino de automacao.

O objetivo desta etapa e transformar o cadastro de produto em um fluxo que permita praticar cenarios reais de:

- formularios longos e divididos em etapas
- validacoes sincronas e assincronas
- mascaras de entrada
- selects dinamicos
- campos repetiveis
- debounce
- retries seletivos
- estados de loading e skeleton
- controle de permissao por perfil
- tratamento previsivel de erros HTTP

## Decisao

Vamos adotar um wizard avancado para o cadastro e edicao de produtos, mantendo o backend como fonte central de validacao.

A solucao inclui:

- wizard em multiplas etapas no frontend
- mascara monetaria no cliente com normalizacao para decimal no payload
- validacao assincrona de disponibilidade de SKU
- busca debounced para produtos relacionados
- campos repetiveis persistidos no backend (`featureBullets` e `relatedSkus`)
- campos condicionais persistidos no backend (`promotionEndsAt` e `deactivationReason`)
- sugestao dinamica de fornecedores por categoria
- permissao de escrita restrita a `ADMIN`, com `OPERATOR` em modo leitura
- simulacao controlada de erros HTTP em ambiente nao produtivo para automacao
- retry automatico apenas para falhas de servidor no frontend

## Consequencias

Consequencias positivas:

- o projeto passa a oferecer um fluxo excelente para E2E, testes de componentes e testes de API
- as regras de negocio ficam centralizadas no backend, com feedback rapido no frontend
- a UI ganha comportamento proximo de produtos reais, sem depender de integracoes externas complexas
- a automacao pode exercitar tanto cenarios felizes quanto falhas previsiveis

Consequencias negativas:

- o formulario fica mais complexo e exige mais manutencao de estados de interface
- mascaras e validacoes assincronas aumentam a superficie de bugs de UX se nao forem bem testadas
- a simulacao de erros precisa continuar restrita a ambientes nao produtivos

## Alternativas consideradas

### Manter um formulario unico e simples

Foi rejeitado porque reduziria demais o valor do projeto como laboratorio de automacao.

### Concentrar toda validacao apenas no frontend

Foi rejeitado porque o backend precisa continuar sendo a autoridade das regras de negocio.

### Implementar feature flags via servico remoto desde agora

Foi rejeitado nesta fase para evitar complexidade operacional desnecessaria. Flags locais por ambiente ja atendem o objetivo atual.

## Observacoes

Novas decisoes relacionadas a object storage, flags remotas ou formularios ainda mais complexos devem ser registradas em ADRs posteriores.
