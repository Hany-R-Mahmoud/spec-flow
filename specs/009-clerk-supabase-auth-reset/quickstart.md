# Quickstart: Validate Clerk-Supabase Auth Reset

## Required Env

Root `.env`:

```bash
VITE_CLERK_PUBLISHABLE_KEY=
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
VITE_APP_URL=http://127.0.0.1:8080
API_SERVER_URL=http://127.0.0.1:24549
APP_ALLOWED_ORIGINS=http://127.0.0.1:8080,http://localhost:8080
```

If integration secrets are implemented with local encryption:

```bash
INTEGRATION_SECRET_KEY=
```

Do not expose Supabase auth keys to Vite unless a later spec adds a direct
Supabase browser client.

## Start Local Runtime

Use two terminals:

```bash
pnpm dev:api
```

```bash
pnpm dev:specflow
```

Open:

```text
http://127.0.0.1:8080/
```

## Manual Validation

1. Sign in through `/login`.
2. Hard refresh `/`.
3. In browser devtools, confirm first protected requests include
   `Authorization: Bearer ...`.
4. Confirm these return `200`:
   - `/api/sessions`
   - `/api/settings`
   - `/api/export-packages`
5. Sign out or remove auth header and confirm:
   - `/api/sessions` returns `401`
   - `/api/settings` returns `401`
6. If using Clerk Organizations:
   - switch active organization
   - confirm dashboard reloads under the new workspace
   - confirm member cannot write sensitive settings/integration config
   - confirm admin can
7. Read `/api/integrations/config` and confirm no raw tokens appear.

## Suggested Commands

Only run checks when needed to diagnose or prove the reset:

```bash
pnpm --filter @workspace/specflow-ai typecheck
pnpm --filter @workspace/api-server typecheck
pnpm run typecheck:libs
```

After OpenAPI edits, regenerate the API packages using the repo's existing
codegen command if available.

## Completion Evidence

Final executor report should include:

- key changed files
- env/config summary
- browser first-load result
- `401` missing-token result
- `403` member-sensitive-write result
- secret readback result
- typecheck/codegen results if run
