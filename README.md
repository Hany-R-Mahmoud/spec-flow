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
