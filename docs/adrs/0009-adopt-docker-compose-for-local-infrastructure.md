# ADR-0009 - Adotar Docker Compose Para Infraestrutura Local

- Status: `Accepted`
- Data: `2026-03-14`

## Contexto

O projeto precisa ser facil de subir localmente por qualquer pessoa.

Como o banco principal e PostgreSQL, era importante evitar setups manuais diferentes por maquina.

## Decisao

O ambiente local usa `Docker Compose` para subir o PostgreSQL.

Tambem foram adicionados scripts de apoio na raiz para facilitar:

- subir banco
- derrubar banco
- ver logs

## Consequencias

- setup local fica mais previsivel
- reduz divergencia entre ambientes
- facilita onboarding

Trade-offs:

- depende de Docker instalado na maquina
- algumas pessoas podem preferir banco local sem container

## Alternativas Consideradas

- cada pessoa instalar PostgreSQL manualmente
- usar banco embarcado para desenvolvimento
- depender apenas de ambiente remoto compartilhado

## Referencias

- [docker-compose.yml](C:/Users/PabloHenrique/projects/testforge-qa-lab/docker-compose.yml)
- [package.json](C:/Users/PabloHenrique/projects/testforge-qa-lab/package.json)
