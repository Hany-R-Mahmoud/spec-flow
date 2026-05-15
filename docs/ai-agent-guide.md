# AI Agent Guide

## Read First

- `README.md`
- `docs/overview.md`
- `docs/architecture.md`
- `docs/project-structure.md`
- `docs/team-decisions/README.md`
- `AGENTS.md`

## Safe Edit Boundaries

- `artifacts/specflow-ai/src/pages/` for page-level UI changes
- `artifacts/specflow-ai/src/components/` for reusable UI pieces
- `docs/` for documentation maintenance

## Risky Areas

- `artifacts/api-server/src/routes/`
- `artifacts/api-server/src/ai/`
- `lib/api-spec/openapi.yaml`
- `lib/api-zod/src/generated/`
- `lib/api-client-react/src/generated/`
- `lib/db/src/schema/index.ts`

## Verification Commands

```bash
pnpm run typecheck
pnpm build
```

## Rules

- Do not invent commands, env vars, services, APIs, or architecture.
- Read team decisions before changing durable architecture, API, workflow, or
  convention behavior.
- Update docs when durable behavior changes.
- Use `Unknown / verify` when facts are unclear.
