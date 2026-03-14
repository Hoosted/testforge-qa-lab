# ADR-0005 - Adotar NestJS Para A Base Do Backend

- Status: `Accepted`
- Data: `2026-03-14`

## Contexto

O backend precisa crescer para varios modulos de negocio, manter estrutura clara e oferecer uma base boa para:

- validacao de payloads
- autenticacao
- tratamento global de erros
- logs
- documentacao de API

## Decisao

O backend usa `NestJS` com organizacao modular.

A base adota:

- `AppModule` central
- modulos por dominio
- `ConfigModule` global
- `ValidationPipe` global
- filtro global de erros
- interceptor de logging
- Swagger

## Consequencias

- melhora separacao de responsabilidades
- oferece padroes claros para crescimento
- reduz acoplamento entre features
- facilita onboarding de quem ja conhece NestJS

Trade-offs:

- mais estrutura inicial do que um servidor Express cru
- existe curva de aprendizado com decorators e DI

## Alternativas Consideradas

- Express sem framework
- Fastify direto com arquitetura propria
- backend minimalista sem modulos desde o inicio

## Referencias

- [apps/backend/src/app.module.ts](C:/Users/PabloHenrique/projects/testforge-qa-lab/apps/backend/src/app.module.ts)
- [apps/backend/src/main.ts](C:/Users/PabloHenrique/projects/testforge-qa-lab/apps/backend/src/main.ts)
