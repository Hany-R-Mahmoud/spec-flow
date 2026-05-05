# Implementation Plan: Persistence MVP

## Summary

Introduce the smallest durable data layer that turns the prototype into a
refresh-safe app without building AI or external integrations yet.

## Architecture Decisions

1. API server owns persistence.
2. Frontend calls API through generated/shared client where practical.
3. DB schema is source of persisted truth; frontend types reuse generated/schema
   contracts.
4. Mock data becomes seed/demo fallback only.

## Sequence

1. Model persisted entities in Drizzle.
2. Update OpenAPI contracts.
3. Regenerate/update Zod/client packages if local workflow supports it.
4. Add API routes and validation.
5. Wire frontend read paths.
6. Wire frontend write paths.
7. Keep loading/error/empty states visible.

## Validation

- API health still works.
- Create session through UI or API, refresh, confirm it persists.
- Update settings, refresh, confirm it persists.
- Run focused typecheck if executor has time/approval.

## Constitution Check

- Complexity: justified because persistence is core product behavior.
- TypeScript/schema: must reuse schema-layer types.
- Accessibility: states must remain user-friendly.
- Security: validate all inputs at API boundary.
- Surgical: no AI/export integration.
