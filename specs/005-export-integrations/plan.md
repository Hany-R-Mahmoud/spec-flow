# Implementation Plan: Export Integrations

## Architecture Decisions

1. Export packages are persisted records, not only UI-generated blobs.
2. External integrations run through API server.
3. Credentials come from environment/secret-management patterns only.
4. Each story export result is recorded independently.
5. Local downloads remain available without external credentials.

## Sequence

1. Add export package schema/API.
2. Wire ExportPanel to create package from saved stories.
3. Persist package history and render ExportsPage from API.
4. Add local download from persisted package.
5. Add Jira integration configuration and disabled state.
6. Add GitHub issue integration configuration and disabled state.
7. Record remote links/errors per item.

## Validation

- Create package without external credentials.
- Download JSON/CSV/Markdown from package history.
- Confirm Jira/GitHub controls are disabled or configured honestly.
- If credentials exist, export a test item and record remote URL.

## Constitution Check

- Security: secrets never hardcoded.
- TypeScript/schema: package/item contracts shared.
- Accessibility: result/error states visible and readable.
- Surgical: no collaboration scope.
