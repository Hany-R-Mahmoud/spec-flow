# Feature Specification: Manus UX Teardown

**Feature Branch**: `015-manus-ux-teardown`  
**Created**: 2026-05-15  
**Status**: Draft  
**Depends On**: `docs/manus/project-brief.md`

## Goal

Use Manus as an external UX reviewer for the SpecFlow AI product experience.
The output must identify friction, trust gaps, unclear flows, accessibility
issues, and high-leverage improvements in the live or local product.

## Manus Assignment

Inspect the app as a target user. Review landing, onboarding/login if
available, dashboard, workflow workspace, review surfaces, export surfaces, and
settings. Capture findings with evidence and prioritize fixes.

## User Scenarios

1. As a new PM, I need to understand what the app does and start a breakdown.
2. As a returning user, I need to find projects, continue workflow work, and
   trust saved state.
3. As a reviewer, I need to understand story quality, warnings, and handoff
   readiness.
4. As a delivery user, I need to export or sync work without confusion.

## Requirements

- **FR-001**: Review MUST cover landing, app shell, dashboard/projects,
  workflow workspace, review, export, and settings where accessible.
- **FR-002**: Findings MUST include reproduction steps and expected vs actual
  behavior.
- **FR-003**: Findings MUST be prioritized P0, P1, P2, P3.
- **FR-004**: UX recommendations MUST distinguish quick copy/UI fixes from
  deeper product changes.
- **FR-005**: Accessibility issues MUST call out keyboard, focus, semantics,
  contrast, labels, and alt text where relevant.
- **FR-006**: Findings MUST include screenshots or precise visual descriptions
  when screenshots are not available.
- **FR-007**: Output MUST flag any fake, partial, or misleading controls.
- **FR-008**: Output MUST include a final Codex implementation handoff.

## Must Finish

- Prioritized UX findings.
- Evidence for each finding.
- Recommended fixes.
- Accessibility review.
- Product trust-gap review.

## May Defer

- Full visual redesign.
- Brand strategy.
- Implementation.
- Automated testing.

## Must Not Touch

- Repo code.
- Authentication settings.
- Production data.
- Private user data.

## Failure Conditions

Manus output is not acceptable if:

- It only gives generic design advice.
- It lacks reproduction evidence.
- It does not prioritize findings.
- It ignores accessibility.
- It does not identify whether any controls feel fake or misleading.

## Success Criteria

- **SC-001**: Every major app area has been reviewed or marked inaccessible.
- **SC-002**: Findings can become GitHub issues or spec tasks.
- **SC-003**: The report clearly identifies the highest-impact UX fixes.
- **SC-004**: Codex can convert the handoff into implementation work.

## Expected Manus Output

Create one markdown report with:

1. Executive summary
2. Tested environment and assumptions
3. User journey notes
4. Prioritized findings
5. Accessibility findings
6. Trust-gap and fake-control findings
7. Quick wins
8. Larger product recommendations
9. Codex implementation handoff

## Manus Handoff Prompt

```text
Read docs/manus/project-brief.md first. Then execute
specs/015-manus-ux-teardown/spec.md, plan.md, and tasks.md. Review the
SpecFlow AI product experience as a PM user. Produce a prioritized UX teardown
with reproduction steps, evidence, accessibility findings, trust gaps, quick
wins, larger recommendations, and Codex handoff. Do not edit repository code or
touch production data.
```

