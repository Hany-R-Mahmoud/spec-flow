# Generation Quality Rubric

Source: `docs/manus/reports/raw/workflow-fixture-benchmark.md`

Score each generation run out of 100.

| Dimension | Weight | Good Output |
|---|---:|---|
| Clarification quality | 15 | Questions are specific, actionable, and target real ambiguity. |
| PRD quality | 20 | PRD has clear scope, users, journeys, constraints, and success measures. |
| Epic breakdown | 15 | Epics are coherent, bounded, and map to product outcomes. |
| Story quality | 20 | Stories are implementable, testable, and include acceptance criteria. |
| Quality warnings | 15 | Warnings flag real gaps, risks, compliance issues, or missing decisions. |
| Export readiness | 10 | Output can map cleanly to Jira/GitHub without manual reconstruction. |
| Completeness | 5 | Output covers the required phase without filler or major omissions. |

## Rating Bands

| Score | Meaning |
|---:|---|
| 90-100 | Ready for team review with minimal edits. |
| 75-89 | Useful, but needs PM cleanup before handoff. |
| 60-74 | Directionally useful, but misses important product or engineering detail. |
| Below 60 | Not reliable enough for delivery use. |

## Pass Criteria

A fixture passes only when:

- total score is 75 or higher
- story quality is 15 or higher
- quality warnings are 10 or higher
- export readiness is 7 or higher

If a fixture fails, record the smallest useful fix: phase skill change, prompt
change, UI routing issue, or data model gap.
