# Adaptive Intake And Step Skills

## Purpose

Adaptive intake lets users paste complete or incomplete product content and
continue from the right SpecFlow phase instead of always starting from scratch.
Step skills let users edit the behavior guide used by each workflow phase.

## Adaptive Intake

The intake form analyzes raw text, input type, business goal, constraints,
target users, and labels. It detects:

- clarification answers
- PRD-like sections
- story-like lines
- uncertain content that should stay marked `Unknown / verify`

The UI shows detected progress and a phase plan:

- `reuse`: preserve detected content
- `continue`: content is partial and should be reviewed
- `generate`: no usable content detected for that phase

If the user keeps detected content, session creation persists imported
artifacts and routes to the recommended phase:

- PRD-like content starts at `epics`
- story-like content starts at `quality`
- sparse input starts at `clarification`

Imported content is not silently overwritten. Generation respects the selected
step skill and preserves user-kept artifacts when the skill asks to preserve or
avoid repeating existing content.

## Step Skills

Default step skills exist for:

- clarification
- prd
- epics
- stories
- quality
- export

Each skill contains:

- purpose
- inputs
- process rules
- output contract
- quality checks

Users can edit, duplicate, reset, and assign phase skills in Settings. Custom
skills currently persist in browser `localStorage`. Generation sends a skill
snapshot with the request and records provenance in `generation.promptVersion`
using this pattern:

```text
<prompt-version>+skill:<skill-id>@v<version>
```

## Current Limits

- Step skills are local to the browser until API/database-backed persistence is
  added.
- Skill content affects the deterministic generator through simple rule
  detection, not full prompt execution.
- `Unknown / verify` warnings are preserved and surfaced, but there is no
  separate unknowns dashboard yet.

## Key Files

- `artifacts/specflow-ai/src/lib/adaptive-intake.ts`
- `artifacts/specflow-ai/src/lib/step-skills.ts`
- `artifacts/specflow-ai/src/pages/NewBreakdown.tsx`
- `artifacts/specflow-ai/src/components/settings/StepSkillsSection.tsx`
- `artifacts/specflow-ai/src/store/session-store.tsx`
- `artifacts/api-server/src/routes/generation.ts`
- `artifacts/api-server/src/ai/deterministic-workflow.ts`
- `lib/api-spec/openapi.yaml`
