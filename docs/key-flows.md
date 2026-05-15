# Key Flows

## Flow: Public Visit To Workspace

1. Browser hits `artifacts/specflow-ai/src/App.tsx`
2. Landing page renders for `/`
3. Auth provider gates login or redirects into `/app`
4. `AppShell` routes into dashboard, projects, workspace, reviews, exports, or
   settings
5. UI state flows through `SessionProvider`

## Flow: Workflow Generation

1. User opens a workspace from the app shell
2. Session state triggers generation actions in the UI
3. React client calls `artifacts/api-server/src/routes/generation.ts`
4. API validates input, updates generation state, and persists artifacts
5. Shared schema types keep response shape stable

## Flow: Export History

1. User opens exports in the app
2. UI reads persisted export package state
3. API routes in `artifacts/api-server/src/routes/export-packages.ts` provide
   history and package detail
4. Downloads are generated from persisted data, not only live UI state

## Background Work

- `ensureWorkspaceSchema()` in `artifacts/api-server/src/server.ts` adds missing
  `workspace_id` columns on startup
- OpenAPI code generation keeps the shared client and Zod packages aligned

## External Boundaries

- Clerk auth
- Supabase Postgres
- Jira/GitHub export integrations, with configuration state needing
  deployment-specific verification

## Unknowns

- `Unknown / verify`: whether export integrations are enabled in every
  deployment
