# Project Structure

```txt
spec-flow/
  artifacts/
    api-server/        API server source
    specflow-ai/       React + Vite app source
  lib/
    api-spec/          OpenAPI source and generator config
    api-client-react/  Generated React client
    api-zod/           Generated shared Zod types
    db/                Drizzle schema, SQL scripts, and DB helpers
  docs/                Repo-owned documentation
  specs/               Product specs, plans, research, and reports
  graphify-out/        Generated relationship graph
```

## Important Paths

| Path | Purpose |
|---|---|
| `artifacts/specflow-ai/src/App.tsx` | Frontend router and top-level shell |
| `artifacts/specflow-ai/src/pages/` | Page-level UI modules |
| `artifacts/specflow-ai/src/components/` | Shared UI and workflow panels |
| `artifacts/api-server/src/index.ts` | API server entry point |
| `artifacts/api-server/src/routes/` | HTTP routes |
| `artifacts/api-server/src/ai/` | Workflow generation support |
| `lib/api-spec/openapi.yaml` | API source contract |
| `lib/db/src/schema/index.ts` | Shared schema source |
| `docs/` | Canonical repo documentation |
| `specs/` | Feature-level plans and execution records |

## Entry Points

- `artifacts/specflow-ai/src/main.tsx`: frontend bootstrap
- `artifacts/specflow-ai/src/App.tsx`: app routing and auth gating
- `artifacts/api-server/src/index.ts`: API startup
- `lib/api-spec/openapi.yaml`: OpenAPI source for codegen

## Ignore As Source

- `graphify-out/`
- `artifacts/specflow-ai/dist/`
- `artifacts/api-server/dist/`
- `lib/api-client-react/dist/`
- `lib/api-zod/dist/`
- `node_modules/`
