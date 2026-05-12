# SpecFlow AI

Local run instructions for the Replit-exported workspace.

## Requirements

- Node.js 24
- pnpm 10

## Environment

Create a local `.env` at the workspace root from `.env.example` and set:

- `CLERK_PUBLISHABLE_KEY`
- `VITE_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `DATABASE_URL`
- `VITE_APP_URL`
- `VITE_API_SERVER_URL`
- optional `API_SERVER_URL`
- optional `APP_ALLOWED_ORIGINS`
- optional `INTEGRATION_SECRET_ENCRYPTION_KEY`

`pnpm dev` loads that root `.env` through the Vite config. The API server also
reads the same root `.env` before constructing Clerk middleware, so Clerk,
origin allowlists, and database settings stay in one place.

Runtime model:

- Clerk handles sign-in and session tokens.
- Express handles API authorization and workspace scoping.
- Supabase provides Postgres through `DATABASE_URL`.
- Browser `SUPABASE_` env vars are not part of the current runtime path.

## Database hardening

Supabase exposes the `public` schema through its Data API by default. This app
does not use that API for application access, so public tables should stay
locked down.

Run after provisioning or after schema changes:

```bash
pnpm --filter @workspace/db secure:supabase
```

Audit current RLS and grants:

```bash
pnpm --filter @workspace/db audit:supabase
```

## Run the app

```bash
pnpm install
pnpm dev
```

Open:

```text
http://localhost:8080/
```

`pnpm dev` starts both the API server and the Vite app. Local dev needs both
because the browser app calls `/api/*` for auth, sessions, settings, and
workspace data.

For production deploys like Vercel, you do not run both local processes on your
machine. The frontend is deployed separately, and the API is deployed behind its
own hosted endpoint or serverless route. The browser then points at that hosted
API instead of `localhost:24549`.

Frontend-only Vercel setup:

1. Deploy the frontend from the repo root using the Vercel config in
   [`vercel.json`](./vercel.json).
2. Set these Vercel env vars on the frontend project:
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_API_SERVER_URL`
   - `VITE_APP_URL` if you want canonical URLs to resolve from the deployed site
3. Keep the backend exactly as-is, but point its env at the deployed frontend:
   - `VITE_APP_URL=https://your-project.vercel.app`
   - `APP_ALLOWED_ORIGINS=https://your-project.vercel.app`

Backend Vercel project setup:

1. Set Root Directory to `artifacts/api-server`.
2. Keep build command as `pnpm run build`.
3. Let Vercel serve the `api/[...path].ts` handler in that directory.

After the server bundle change in `artifacts/api-server/src/server.ts`,
backend production setup is env-only as long as the API stays reachable and the
frontend origin is allowlisted.

Preview deploys need the preview origin allowlisted too. If you want previews to
work, add the preview URL to `APP_ALLOWED_ORIGINS` before or after each deploy.
Otherwise, treat preview as frontend-only UI testing and use production API
origins.

## Other workspace targets

```bash
pnpm dev:mockup
pnpm dev:api
```

Defaults:

- `@workspace/specflow-ai`: `PORT=8080`, `BASE_PATH=/`
- `@workspace/mockup-sandbox`: `PORT=8081`, `BASE_PATH=/`
- `@workspace/api-server`: `PORT=24549`

You can still override ports:

```bash
PORT=3000 pnpm dev
```
