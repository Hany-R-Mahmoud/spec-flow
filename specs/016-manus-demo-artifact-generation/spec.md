# Feature Specification: Manus Demo Artifact Generation

**Feature Branch**: `016-manus-demo-artifact-generation`  
**Created**: 2026-05-15  
**Status**: Draft  
**Depends On**: `docs/manus/project-brief.md`

## Goal

Use Manus to generate polished demo and stakeholder artifacts that explain
SpecFlow AI clearly and show the product through realistic examples.

## Manus Assignment

Create reusable product narrative material for demos, investor/user updates,
and internal validation. The artifacts should help someone understand what
SpecFlow AI does, why it matters, and how a realistic workflow moves from rough
input to export-ready stories.

## User Scenarios

1. As the founder, I need a crisp demo script for showing SpecFlow AI.
2. As a PM evaluator, I need realistic sample input and expected output.
3. As an internal teammate, I need a clear product narrative and FAQ.
4. As a future marketer, I need launch copy that matches the product truth.

## Requirements

- **FR-001**: Produce at least three demo scenarios with rough input and
  expected product journey.
- **FR-002**: Produce a 5-minute demo script.
- **FR-003**: Produce a 12-slide deck outline with slide goals and speaker
  notes.
- **FR-004**: Produce landing/launch copy variants that do not invent
  unsupported capabilities.
- **FR-005**: Produce a short FAQ for skeptical PM, design, and engineering
  stakeholders.
- **FR-006**: Produce sample before/after artifacts showing rough idea to
  review-ready stories.
- **FR-007**: Clearly label assumptions and `Unknown / verify` items.
- **FR-008**: Output MUST be ready for Codex to turn into docs, slide content,
  or app copy later.

## Must Finish

- Demo scenarios.
- Demo script.
- Deck outline.
- Launch copy variants.
- Stakeholder FAQ.
- Before/after examples.

## May Defer

- Designed slides.
- Video production.
- Final brand copy.
- Code or UI implementation.

## Must Not Touch

- Repo code.
- Production content.
- Unsupported product claims.
- Customer logos or fake endorsements.

## Failure Conditions

Manus output is not acceptable if:

- It invents customers, metrics, integrations, or claims.
- It lacks realistic demo scenarios.
- It does not include deck outline and speaker notes.
- It produces generic SaaS copy detached from SpecFlow AI.

## Success Criteria

- **SC-001**: Demo material explains the product in under five minutes.
- **SC-002**: Artifacts can be used to evaluate product-market clarity.
- **SC-003**: Claims are truthful relative to the project brief.
- **SC-004**: Codex can turn accepted sections into repo docs or presentation
  assets.

## Expected Manus Output

Create one markdown report with:

1. Executive summary
2. Three demo scenarios
3. Five-minute demo script
4. Twelve-slide deck outline with speaker notes
5. Launch copy variants
6. Stakeholder FAQ
7. Before/after example artifacts
8. Assumptions and unknowns
9. Codex implementation handoff

## Manus Handoff Prompt

```text
Read docs/manus/project-brief.md first. Then execute
specs/016-manus-demo-artifact-generation/spec.md, plan.md, and tasks.md.
Generate demo and stakeholder artifacts for SpecFlow AI: scenarios, 5-minute
demo script, 12-slide deck outline with speaker notes, launch copy variants,
FAQ, before/after examples, assumptions, and Codex handoff. Do not edit
repository code or invent unsupported product claims.
```

