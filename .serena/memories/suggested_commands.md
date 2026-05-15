Core commands for `spec-flow` on Darwin:
- `pnpm install` install workspace deps
- `cp .env.example .env` seed env
- `pnpm dev` run app + API
- `pnpm dev:specflow` run frontend only
- `pnpm dev:api` run API only
- `pnpm dev:mockup` run mockup sandbox
- `pnpm build` typecheck and build workspace
- `pnpm run typecheck` run TypeScript checks
- `pnpm run typecheck:libs` run workspace TS build checks
- `pnpm --filter @workspace/api-spec codegen` regenerate API client and Zod outputs
- `pnpm --filter @workspace/db push` push Drizzle schema
- `pnpm --filter @workspace/db audit:supabase` audit Supabase schema
- `pnpm --filter @workspace/db secure:supabase` apply Supabase hardening
Useful shell tools: `git`, `ls`, `cd`, `rg`, `find`, `sed`, `cat`, `pwd`.