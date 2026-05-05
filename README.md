# SpecFlow AI

Local run instructions for the Replit-exported workspace.

## Requirements

- Node.js 24
- pnpm 10

## Run the app

```bash
pnpm install
pnpm dev
```

Open:

```text
http://localhost:8080/
```

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
