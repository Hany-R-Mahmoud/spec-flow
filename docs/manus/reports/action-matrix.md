# Manus Action Matrix

**Created**: 2026-05-15  
**Purpose**: Convert Manus reports into traceable decisions before any code or
product changes.

## Decision Legend

- `Accept`: use this as input for specs/docs/tasks
- `Needs verification`: plausible but must be checked first
- `Reject / stale`: do not use as current project truth
- `Future idea`: useful later, not current scope

## Matrix

| Source | Finding / Recommendation | Repo Area | Confidence | Priority | Decision | Next Artifact |
|---|---|---|---:|---:|---|---|
| Workflow Fixture Benchmark | Preserve ten product scenarios as generation evaluation fixtures | `docs/evals/generation` | High | P0 | Accept | `018-generation-quality-evals` |
| Workflow Fixture Benchmark | Use weighted rubric: clarification 15%, PRD 20%, epics 15%, stories 20%, warnings 15%, export readiness 10%, completeness 5% | `docs/evals/generation` | High | P0 | Accept | `018-generation-quality-evals` |
| Workflow Fixture Benchmark | Start with manual scoring before automated eval harness | Docs/evals | High | P0 | Accept | `018-generation-quality-evals` |
| Workflow Fixture Benchmark | Structured clarification should ask specific, actionable questions | `artifacts/api-server/src/ai/` | Medium | P1 | Accept | Future implementation spec after eval baseline |
| Workflow Fixture Benchmark | Technical constraint validation should flag feasibility gaps | `artifacts/api-server/src/ai/` | Medium | P1 | Future idea | Needs product design and data model |
| Workflow Fixture Benchmark | Effort estimation calibration against historical data | AI workflow | Low | P3 | Future idea | Needs real historical data first |
| Workflow Fixture Benchmark | Scenario-specific prompts by domain | AI workflow | Medium | P2 | Future idea | Consider after eval scoring exists |
| Export Integration Research | Add export preview before external issue creation | `ExportPanel`, export API | High | P0 | Accept | `019-export-preview-and-dry-run` |
| Export Integration Research | Add dry-run validation before export | export API/routes | High | P0 | Accept | `019-export-preview-and-dry-run` |
| Export Integration Research | Model partial success, retry, and created issue links | export API/UI | High | P1 | Accept | `019-export-preview-and-dry-run` |
| Export Integration Research | Field mapping for Jira/GitHub should be explicit and reviewable | settings/export UI | Medium-high | P1 | Accept | `019-export-preview-and-dry-run` |
| Export Integration Research | Token encryption, scope validation, workspace boundary enforcement | API/security/db | High | P0 | Needs verification | Security design before implementation |
| Export Integration Research | OAuth implementation for Jira/GitHub | integrations | Medium | P2 | Needs verification | Requires provider setup and secrets policy |
| Export Integration Research | Scheduled exports and bi-directional sync | integrations | Low | P3 | Future idea | Out of current scope |
| Demo Artifact Pack | Keep factual claim guardrails | `docs/`, landing copy | High | P1 | Accept | `020-demo-content-kit` |
| Demo Artifact Pack | Preserve three demo scenarios for product demos | `docs/demo/` | Medium-high | P1 | Accept | `020-demo-content-kit` |
| Demo Artifact Pack | Five-minute demo script and deck outline | `docs/demo/` | Medium-high | P2 | Accept | `020-demo-content-kit` |
| Demo Artifact Pack | Launch copy variants by audience | landing/docs | Medium | P2 | Needs verification | Claim cleanup before publishing |
| Demo Artifact Pack | Investor claims, TAM, market-size framing | marketing | Low | P3 | Needs verification | Needs external validation |
| Competitive Research | Position around review-ready, export-ready delivery artifacts | README/landing/product docs | Medium | P1 | Accept | `022-positioning-copy-refresh` |
| Competitive Research | Emphasize structured review loop and quality warnings | product docs/landing | Medium | P1 | Accept | `022-positioning-copy-refresh` |
| Competitive Research | Competitor comparison claims | product docs/marketing | Medium-low | P2 | Needs verification | Re-check sources before public use |
| Competitive Research | Technical context ingestion API | product roadmap | Low-medium | P2 | Future idea | Needs separate discovery spec |
| Competitive Research | Cross-project knowledge graph | product roadmap | Low | P3 | Future idea | Not near-term |
| UX Teardown | "No project creation/dashboard/workflow/export/settings" | app UX | Low | P0 | Reject / stale | Tested Manus preview, not app |
| UX Teardown | Accessibility reminders: focus, keyboard, ARIA, semantics, contrast, alt text | app UI | Medium | P2 | Accept | `021-real-ux-audit` |
| UX Teardown | Run actual UX audit against correct app URL | app UX | High | P1 | Accept | `021-real-ux-audit` |
| UX Teardown | Remove preview banner from production | deployment | Low | P2 | Reject / stale | Banner belonged to Manus preview |

## Recommended Execution Order

1. `018-generation-quality-evals`
2. `019-export-preview-and-dry-run`
3. `020-demo-content-kit`
4. `021-real-ux-audit`
5. `022-positioning-copy-refresh`

## Notes

- Raw Manus UX findings should not be used as product evidence because the
  tested URL was a Manus preview artifact.
- Export work touches credentials and workspace boundaries. Treat it as
  security-sensitive.
- Fixture work can proceed without code changes first, then evolve into eval
  automation.

