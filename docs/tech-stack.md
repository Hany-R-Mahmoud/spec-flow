# Tech Stack

| Area | Tooling |
|---|---|
| Language | TypeScript |
| Runtime | Node.js 24 in local development |
| Frontend | React, Vite, Wouter, TanStack Query, Tailwind CSS, Radix UI, Framer Motion |
| Backend | Express 5, Pino, CORS, Cookie Parser |
| Auth | Clerk React, Clerk Express |
| Data | Supabase Postgres, Drizzle ORM, Zod, drizzle-zod |
| Shared Contracts | OpenAPI, generated API client, generated Zod types |
| Package Manager | pnpm 10 |
| Build / Tooling | TypeScript project references, Prettier, Graphify |
| Deploy | Vercel for frontend and routing |

## Important Libraries

- `@tanstack/react-query`: client data fetching and cache coordination
- `@clerk/react` and `@clerk/express`: auth integration
- `drizzle-orm` and `drizzle-zod`: persistence layer and schema helpers
- `zod`: runtime validation and generated contracts
- `lucide-react`: icon set used across the UI

## Unknowns

- `Unknown / verify`: exact production split between app and API deployments
- `Unknown / verify`: whether every deployment uses the same external service
  configuration
