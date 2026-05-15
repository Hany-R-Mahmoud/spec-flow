# Feature Specification: Manus Export Integration Research

**Feature Branch**: `017-manus-export-integration-research`  
**Created**: 2026-05-15  
**Status**: Draft  
**Depends On**: `006-export-integrations`, `docs/manus/project-brief.md`

## Goal

Use Manus to research Jira and GitHub export integration behavior so SpecFlow
AI can make better product and implementation decisions before deep connector
work.

## Manus Assignment

Research how product breakdown artifacts should map into Jira and GitHub work
items. Identify API constraints, UX expectations, auth/security risks,
field-mapping choices, and common failure states.

## User Scenarios

1. As a PM, I want approved stories exported to Jira without losing context.
2. As an engineer, I want GitHub issues created with useful acceptance
   criteria and traceability.
3. As an admin, I want integration setup to be explicit, safe, and reversible.
4. As the product owner, I want export UX that avoids fake success.

## Requirements

- **FR-001**: Research MUST cover Jira Cloud issue creation and GitHub issue
  creation.
- **FR-002**: Research MUST identify likely field mappings from SpecFlow AI
  artifacts to external work items.
- **FR-003**: Research MUST identify auth, permission, token storage, and
  workspace-boundary risks.
- **FR-004**: Research MUST document common error states and user-facing
  recovery behavior.
- **FR-005**: Research MUST recommend export preview, dry-run, and audit
  patterns.
- **FR-006**: Research MUST include source links or label claims
  `Unknown / verify`.
- **FR-007**: Output MUST include Codex-ready product requirements for future
  implementation.
- **FR-008**: Output MUST avoid requesting or storing real credentials.

## Must Finish

- Jira mapping recommendation.
- GitHub mapping recommendation.
- Auth and security risk list.
- Export UX state model.
- Error/retry behavior.
- Codex implementation handoff.

## May Defer

- Actual connector implementation.
- OAuth app setup.
- Marketplace listing research.
- Multi-provider abstraction.

## Must Not Touch

- Repo code.
- Real Jira or GitHub credentials.
- Production integrations.
- Secret storage.

## Failure Conditions

Manus output is not acceptable if:

- It lacks source links for API or product claims.
- It ignores auth/security risks.
- It does not define field mappings.
- It recommends fake success or toast-only export behavior.
- It requests real credentials.

## Success Criteria

- **SC-001**: Codex can convert the research into export implementation specs.
- **SC-002**: Field mappings are concrete enough to review.
- **SC-003**: Security risks are explicit and actionable.
- **SC-004**: Export UX states cover success, partial success, failure, retry,
  and disconnect.

## Expected Manus Output

Create one markdown report with:

1. Executive summary
2. Jira research and source links
3. GitHub research and source links
4. Field mapping proposal
5. Export preview/dry-run/audit model
6. Auth and security risks
7. Error and retry state model
8. Recommended product requirements
9. Unknowns to verify
10. Codex implementation handoff

## Manus Handoff Prompt

```text
Read docs/manus/project-brief.md first. Then execute
specs/017-manus-export-integration-research/spec.md, plan.md, and tasks.md.
Research Jira Cloud and GitHub issue export behavior for SpecFlow AI. Produce
source-backed mappings, auth/security risks, export UX state model, error and
retry behavior, product requirements, unknowns, and Codex handoff. Do not edit
repository code or request real credentials.
```

