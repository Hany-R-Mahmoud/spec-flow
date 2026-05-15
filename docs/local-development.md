# Local Development

## Requirements

- Node.js 24
- pnpm 10
- PostgreSQL access through `DATABASE_URL`

## Setup

```bash
pnpm install
cp .env.example .env
```

## Run

```bash
pnpm dev
```

Targeted startup:

```bash
pnpm dev:specflow
pnpm dev:api
pnpm dev:mockup
```

## Verify

```bash
pnpm build
pnpm run typecheck
```

## Environment

- `CLERK_PUBLISHABLE_KEY`: Clerk frontend key
- `VITE_CLERK_PUBLISHABLE_KEY`: fallback Clerk frontend key for local/server
- `CLERK_SECRET_KEY`: Clerk backend key
- `API_SERVER_URL`: API server URL used by local tooling
- `VITE_APP_URL`: public app origin
- `APP_ALLOWED_ORIGINS`: allowed browser origins for the API
- `INTEGRATION_SECRET_ENCRYPTION_KEY`: server-only integration secret key
- `GOOGLE_OAUTH_CLIENT_ID`: optional Google OAuth config
- `GOOGLE_OAUTH_CLIENT_SECRET`: optional Google OAuth config
- `GITHUB_OAUTH_CLIENT_ID`: optional GitHub OAuth config
- `GITHUB_OAUTH_CLIENT_SECRET`: optional GitHub OAuth config
- `DATABASE_URL`: Postgres connection string

## Troubleshooting

- Missing Clerk keys: confirm `.env` matches `.env.example`
- Missing `DATABASE_URL`: the API server will fail to boot
- Port conflict on `24549`: change `PORT` for the API server
- Port conflict on `8080`: change the Vite dev server port in the app config
