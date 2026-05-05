# Tasks: Export Integrations

## Preflight

- [ ] T001 Read constitution, spec, plan, and specs 004/005 outcomes.
- [ ] T002 Inspect `ExportPanel`, `ExportsPage`, API routes, DB schema, and
      current `mockExportPackages` usage.
- [ ] T003 Identify where export history must stop being mock-primary.

## Persistence And API

- [ ] T004 Add persisted export package schema.
- [ ] T005 Add persisted export item/result schema.
- [ ] T006 Add API endpoint to create export package from selected stories.
- [ ] T007 Add API endpoint to list export packages.
- [ ] T008 Add API endpoint to view export package detail.
- [ ] T009 Add API endpoint or service to produce Markdown/CSV/JSON content.
- [ ] T010 Validate package creation inputs.

## Local Export UI

- [ ] T011 Wire ExportPanel to create persisted package.
- [ ] T012 Wire ExportsPage to API-backed package history.
- [ ] T013 Keep Markdown download from package data.
- [ ] T014 Keep CSV download from package data.
- [ ] T015 Keep JSON download from package data.
- [ ] T016 Verify downloaded content matches selected persisted stories.

## External Integrations

- [ ] T017 Add Jira configuration detection.
- [ ] T018 Add Jira disabled/unconfigured state.
- [ ] T019 Add Jira export endpoint if configured.
- [ ] T020 Record Jira per-item success/failure and remote keys/URLs.
- [ ] T021 Add GitHub configuration detection.
- [ ] T022 Add GitHub disabled/unconfigured state.
- [ ] T023 Add GitHub issue export endpoint if configured.
- [ ] T024 Record GitHub per-item success/failure and remote URLs.
- [ ] T025 Add retry path for failed items where safe.

## Security And Report

- [ ] T026 Ensure no tokens/secrets are hardcoded.
- [ ] T027 Ensure secrets are not logged.
- [ ] T028 Run or skip focused checks with reason.
- [ ] T029 Report configured/unconfigured integration behavior.
- [ ] T030 Report changed files and remaining integration limitations.
