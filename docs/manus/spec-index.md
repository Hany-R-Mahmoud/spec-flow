# Manus Spec Index

Each folder below is meant to be used separately with Manus. Start every Manus
run by pasting `docs/manus/project-brief.md`, then paste the target spec,
plan, and tasks.

## Specs

| Folder | Use Manus For | Expected Outcome |
|---|---|---|
| `specs/013-manus-competitive-product-research` | Market and competitor research | Positioning, feature gaps, onboarding/export patterns |
| `specs/014-manus-workflow-fixture-benchmark` | Workflow quality benchmark fixtures | Realistic inputs plus expected PRD/epic/story outputs |
| `specs/015-manus-ux-teardown` | UX review of live/local product | Prioritized UX issues with reproduction evidence |
| `specs/016-manus-demo-artifact-generation` | Demo and stakeholder artifacts | Demo scripts, launch copy, example briefs, deck outline |
| `specs/017-manus-export-integration-research` | Jira/GitHub export research | Integration behavior, risks, API constraints, UX recommendations |

## Processed Reports

- `docs/manus/reports/raw/`: original Manus markdown exports
- `docs/manus/reports/synthesis.md`: Codex synthesis and validation notes
- `docs/manus/reports/action-matrix.md`: decision board for accepted,
  rejected, verification-needed, and future items

## Recommended Loop

1. Run one spec in Manus.
2. Save Manus output as a single markdown report.
3. Pass the report back to Codex.
4. Codex converts accepted findings into project specs, docs, or code changes.
