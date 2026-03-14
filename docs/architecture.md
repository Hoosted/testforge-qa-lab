# TestForge Architecture

## Principles

- Full-stack TypeScript across all apps and packages
- Modular backend with clear business boundaries
- Frontend organized by feature for scalability
- Shared contracts where coupling is valuable
- Testability as a first-class concern

## Applications

- `apps/frontend`: user-facing product management UI
- `apps/backend`: REST API, auth and business rules

## Shared Packages

- `packages/config`: reusable config presets
- `packages/shared-types`: domain types and contracts shared by apps

## Testing Surface

The repository is intentionally prepared for:

- E2E tests
- API tests
- integration tests
- contract tests
- component tests
- accessibility and visual tests
- performance and load testing
