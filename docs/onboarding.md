# Onboarding

## First-Day Reading Path

1. `README.md`
2. `docs/overview.md`
3. `docs/project-structure.md`
4. `docs/local-development.md`
5. `docs/key-flows.md`
6. `docs/team-decisions/README.md`

## First Local Run

```bash
pnpm install
cp .env.example .env
pnpm dev
```

## Safe First Change

- Update a docs page or a copy-only UI string in a non-critical route

## Common Pitfalls

- Editing generated files instead of the source contract or schema
- Changing auth, workspace, or generation logic without checking the related
  specs and team decisions
- Forgetting that the API requires real env vars before it boots

## Team Decisions

Durable agreements live in `docs/team-decisions/`.
