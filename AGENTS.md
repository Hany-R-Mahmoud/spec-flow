## Project Summary

SpecFlow AI turns rough product input into breakdowns, structured stories,
review output, and export-ready handoff.

## Read First

1. `README.md`
2. `docs/overview.md`
3. `docs/architecture.md`
4. `docs/project-structure.md`
5. `docs/local-development.md`
6. `docs/ai-agent-guide.md`
7. `docs/team-decisions/README.md`
8. `graphify-out/GRAPH_REPORT.md`

## Repo Map

| Path | Purpose |
|---|---|
| `artifacts/specflow-ai/` | React + Vite app for landing, auth, dashboard, workflow, review, export, and settings screens |
| `artifacts/api-server/` | Express 5 API server for auth-scoped app behavior, persistence, generation, and exports |
| `lib/api-spec/` | OpenAPI source and codegen entry point |
| `lib/api-client-react/` | Generated React client for API calls |
| `lib/api-zod/` | Generated Zod contracts and shared response types |
| `lib/db/` | Drizzle schema, SQL hardening/audit scripts, and database helpers |
| `specs/` | Product specs, plans, research, and execution reports |
| `docs/` | Repo-owned human and AI documentation |
| `graphify-out/` | Generated relationship graph and wiki output |

## Commands

| Command | Purpose |
|---|---|
| `pnpm install` | Install workspace dependencies |
| `pnpm dev` | Start API server and app in parallel |
| `pnpm dev:specflow` | Start only the app |
| `pnpm dev:api` | Start only the API server |
| `pnpm dev:mockup` | Start the mockup sandbox app |
| `pnpm build` | Typecheck and build workspace packages |
| `pnpm run typecheck` | Run TypeScript checks for libs and app packages |
| `pnpm run typecheck:libs` | Run workspace TypeScript build checks |
| `pnpm --filter @workspace/api-spec codegen` | Regenerate OpenAPI-derived client and Zod outputs |
| `pnpm --filter @workspace/db push` | Push Drizzle schema changes |
| `pnpm --filter @workspace/db audit:supabase` | Audit the Supabase public schema |
| `pnpm --filter @workspace/db secure:supabase` | Apply Supabase public-schema hardening |

## Conventions

- Keep `lib/api-spec/openapi.yaml`, `lib/api-zod/src/generated/`, and
  `lib/api-client-react/src/generated/` in sync.
- Treat `artifacts/api-server/src/routes/` and `lib/db/src/schema/` as high-risk
  boundaries.
- Inspect `specs/` and `docs/team-decisions/` before changing durable API,
  workflow, or architecture behavior.
- Preserve generated files; do not hand-edit them unless the repo already does.
- Use `Unknown / verify` instead of guessing missing facts.

## Safety Rules

- Inspect relevant files before changing code.
- Preserve user changes and useful existing docs.
- Do not invent commands, env vars, services, APIs, or architecture.
- Update docs when durable architecture, API, workflow, or convention changes
  land.
- Read `docs/team-decisions/` before making durable changes to workflow,
  schema, auth, or exports.

## Unknowns

- `Unknown / verify`: final production deployment split between the app and API
  server.
- `Unknown / verify`: whether all production environments use the same Clerk
  and Supabase setup or separate instances.

## Graphify

Before architecture or codebase questions, read `graphify-out/GRAPH_REPORT.md`.
If `graphify-out/wiki/index.md` exists, use it before raw file scans.
For cross-module relationship questions, prefer `graphify query`, `graphify
path`, or `graphify explain`.
After modifying code files, run `graphify update .`.
