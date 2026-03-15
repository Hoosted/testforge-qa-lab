# ADR-0012 - Adotar produtos e gestao administrativa de usuarios como primeiros dominios de negocio

- Status: Accepted
- Date: 2026-03-14

## Contexto

O TestForge precisa sair da base tecnica e entrar em um dominio de negocio realista.

A plataforma foi pensada como playground para automacao de testes. Isso exige superficies ricas para praticar:

- CRUD completo
- regras de negocio reais
- filtros, ordenacao e paginacao
- upload de arquivos
- autorizacao por papel
- estados visuais de loading, erro e vazio
- seeds previsiveis para E2E e API

Ao mesmo tempo, a primeira versao precisa continuar simples de rodar localmente e facil de entender para quem entrar no projeto depois.

## Decisao

Vamos adotar dois primeiros dominios de negocio:

- `Products` como dominio principal funcional da aplicacao
- `Users` como dominio administrativo restrito a `ADMIN`

Para `Products`, a primeira iteracao deve incluir:

- modelagem completa de dados de catalogo e estoque
- CRUD
- busca
- filtros
- paginacao
- ordenacao
- upload de imagem principal
- validacoes de negocio no backend

Para `Users`, a primeira iteracao deve incluir:

- listagem paginada
- filtro por papel e status
- atualizacao de papel e status
- acesso protegido exclusivamente para `ADMIN`

A estrategia de upload de imagem nesta fase sera armazenamento local em disco, no backend, dentro do diretorio `uploads`.

## Consequencias

Consequencias positivas:

- o projeto ganha um fluxo de negocio crivel para portfolio
- a base fica excelente para testes E2E, API, integracao, contrato e massa de dados
- o upload local reduz dependencia externa e facilita reproducao local e em CI
- a gestao de usuarios demonstra autorizacao com impacto real no produto

Consequencias negativas:

- armazenamento local nao e adequado para producao distribuida
- a experiencia de upload ainda nao trata CDN, antivirus, redimensionamento ou storage externo
- a administracao de usuarios ainda e basica e nao cobre convite, reset de senha ou auditoria detalhada

## Alternativas consideradas

### Comecar por um dominio menor e mais simples

Foi rejeitado porque geraria pouco valor para pratica de automacao e deixaria o portfolio com menos profundidade.

### Implementar storage externo desde o inicio

Foi rejeitado nesta fase porque aumentaria custo de setup, credenciais e manutencao local sem necessidade imediata.

### Deixar gestao de usuarios para depois

Foi rejeitado porque a combinacao entre autenticacao e autorizacao precisa aparecer cedo no produto, com uma tela de administracao real.

## Observacoes

Quando o projeto evoluir para cenarios mais proximos de producao, esta decisao podera ser estendida por um novo ADR para migracao de upload local para object storage.
