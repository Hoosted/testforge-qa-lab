# TestForge QA

A modern full-stack product management platform designed as a real-world playground for test automation practice and portfolio projects.

## Stack

- Monorepo with PNPM Workspaces and Turborepo
- Frontend with React, TypeScript and Vite
- Backend with NestJS, Prisma and PostgreSQL
- Shared packages for config and types
- Docker Compose for local database setup

## Workspace Structure

```txt
apps/
  frontend/
  backend/
packages/
  config/
  shared-types/
docs/
tests-examples/
```

## Quick Start

### 1. Install PNPM

```bash
corepack enable
corepack prepare pnpm@10.18.3 --activate
```

If Corepack fails because of signature issues, install PNPM globally:

```bash
npm install -g pnpm@10.18.3
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

### 4. Start PostgreSQL

```bash
docker compose up -d
```

### 5. Run the apps

```bash
pnpm dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001/api/v1`
- Swagger: `http://localhost:3001/api/docs`

## Main Scripts

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm format`
- `pnpm typecheck`
- `pnpm test`

## Next Steps

- Add Prisma schema and first migrations
- Implement JWT authentication
- Build product management modules
- Add automated test suites and CI pipeline
