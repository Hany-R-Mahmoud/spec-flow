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
2. UI checks `/api/ai/capability`
3. If no provider key is configured, generation controls explain manual mode
   and route admins to Settings
4. If AI is enabled, React client sends the selected step-skill snapshot with
   the generation request
5. API decrypts the workspace provider key server-side, calls the provider,
   validates JSON output, updates generation state, and persists artifacts
6. Invalid provider output preserves the previous trusted artifacts and marks
   the generation step failed
7. Shared schema types keep response shape stable

## Flow: Adaptive Intake

1. User pastes rough, partial, or complete content into New Breakdown
2. Browser classifies detected PRD sections, stories, answers, and unknowns
3. User confirms whether to reuse detected content
4. Session creation persists imported artifacts and phase state
5. Workspace opens at the recommended next phase, such as `epics` or `quality`

## Flow: Step Skills

1. User opens Settings
2. If AI is not enabled, default skills remain visible but custom skill actions
   are disabled
3. If AI is enabled, user selects a workflow phase and edits or duplicates the
   default skill
4. Future generation requests include the assigned skill snapshot
5. Server-side validation rejects oversized or unsafe skill instructions before
   live provider calls
6. Generation provenance is stored in `generation.promptVersion`

## Flow: BYOK AI Provider

1. Workspace admin opens Settings
2. Admin enters provider, model, and API key
3. API encrypts the key, stores only metadata and ciphertext, validates the key,
   and records audit events
4. Browser receives only status, provider, model, key suffix/fingerprint, and
   timestamps
5. Rotate, validate, and remove actions never return plaintext key material

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
- AI provider keys require `AI_SECRET_ENCRYPTION_KEY` or
  `INTEGRATION_SECRET_ENCRYPTION_KEY` on the API server

## External Boundaries

- Clerk auth
- Supabase Postgres
- OpenAI-compatible provider calls from the API server when BYOK is configured
- Jira/GitHub export integrations, with configuration state needing
  deployment-specific verification

## Unknowns

- `Unknown / verify`: whether export integrations are enabled in every
  deployment
