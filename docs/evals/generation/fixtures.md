# Generation Evaluation Fixtures

Source: `docs/manus/reports/raw/workflow-fixture-benchmark.md`

Use these fixtures to manually evaluate SpecFlow AI generation quality before
changing prompts, workflow routing, or phase behavior. Raw Manus output remains
the trace source; this document is the repo-owned working fixture index.

## Fixture Set

| ID | Scenario | Domain | Complexity | Ambiguity | Main Quality Check |
|---|---|---:|---:|---:|---|
| GQ-001 | Real-time notification system | Backend infrastructure | High | Medium | Technical constraints, batching, offline delivery, scalability |
| GQ-002 | User authentication redesign | Frontend/UX | Medium | High | Scope narrowing, provider decision, migration strategy, 2FA policy |
| GQ-003 | Analytics dashboard | Data visualization | Medium | Low | Clear PRD sections, useful stories, export-ready acceptance criteria |
| GQ-004 | Mobile app offline sync | Mobile | High | High | Conflict handling, sync strategy, edge cases, data loss risks |
| GQ-005 | Payment processing integration | Backend/finance | High | Low | Security, compliance, provider mapping, failure handling |
| GQ-006 | Social sharing feature | Frontend/social | Low | Medium | Integration dependencies, privacy controls, simple scope discipline |
| GQ-007 | Admin moderation panel | Backend/admin | Medium | Medium | Role permissions, moderation queue, audit trail, escalation workflow |
| GQ-008 | Search and filtering | Frontend/UX | Medium | Medium | Performance constraints, filters, ranking, empty states |
| GQ-009 | Email notification system | Backend/communication | Medium | Low | Template rules, unsubscribe, deliverability, retry model |
| GQ-010 | Dark mode implementation | Frontend/design | Low | Low | Design-token consistency, accessibility, regression boundaries |

## Required Manual Run Notes

For each fixture, capture:

- rough input used
- generated clarification questions
- generated PRD sections
- generated epics
- generated stories and acceptance criteria
- generated warnings
- export readiness notes
- evaluator score using `rubric.md`
- missing or duplicated steps
- recommendation: keep, adjust prompt/skill, or create product issue

## First Baseline Recommendation

Run all ten fixtures manually before automated eval work. Store the scorecard in
`docs/evals/generation/runs/YYYY-MM-DD.md` when the run exists.
