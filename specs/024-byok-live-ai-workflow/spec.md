# Feature Specification: BYOK Live AI Workflow

**Feature Branch**: `024-byok-live-ai-workflow`  
**Created**: 2026-05-15  
**Status**: Implemented (runtime provider verification pending)  
**Source**: user next-phase request, security/product/architecture agent review, current SpecFlow workflow

## Goal

Enable real AI-assisted SpecFlow generation only when a workspace has a valid
bring-your-own-key provider configured. Without a configured API key, SpecFlow
must remain a professional manual organization and handoff tool: no agent role,
no generation claims, no custom skill authoring, and no misleading AI controls.

Security is the primary acceptance gate. User API keys must be protected from
browser exposure, logs, accidental response payloads, broad table reads, and
uncontrolled provider calls.

## Current State

- Generation is deterministic/demo-only.
- `SPECFLOW_AI_MODE=live` returns unavailable.
- Prompt text and assembled step-skill instructions are built in
  `artifacts/api-server/src/routes/generation.ts` but are not sent to a model.
- Step skills persist in browser `localStorage` and are sent as snapshots in
  generation requests.
- Settings do not expose AI provider status, API key setup, model selection, or
  BYOK safety controls.
- Landing, New Breakdown, and workflow copy currently imply AI is always
  available.

## Product Model

SpecFlow has two explicit modes:

- **AI enabled**: workspace has a validated provider key. Generation actions,
  step skills, provider-backed clarification, PRD, epics, stories, and quality
  review are available.
- **Manual mode**: no provider key is connected or key validation failed. The
  app supports structured intake, artifact editing, review, organization, and
  export preparation, but no AI agents, no generation calls, and no custom skill
  creation/editing.

Mode must be visible in landing copy, settings, New Breakdown, workspace phase
controls, loading states, and disabled states.

## User Scenarios

1. As a workspace admin, I can connect an AI provider key without the key ever
   being readable again from the browser.
2. As a PM with a valid key, I can run generation and see outputs shaped by the
   current phase input fields and active step skill.
3. As a PM without a key, I can still use SpecFlow to organize product input,
   manually fill artifacts, review readiness, and export handoff material.
4. As a team member, I can tell whether AI is enabled before starting a
   breakdown or attempting a generation action.
5. As a security-conscious owner, I can rotate or remove a provider key and see
   audit-safe status without exposing secret material.

## Requirements

- **FR-001**: Add an AI provider settings surface with explicit provider status:
  `not_configured`, `validating`, `configured`, `validation_failed`, and
  `disabled`.
- **FR-002**: Support BYOK provider setup through server-only secret handling.
  The client may submit a key once, but must never receive the plaintext key
  back.
- **FR-003**: Store provider metadata separately from encrypted secret material:
  provider, model, key fingerprint/suffix, validation status, last validated at,
  created/updated timestamps, and disabled state.
- **FR-004**: Encrypt API keys at rest using an environment-managed server key
  with key-version metadata. Do not store provider keys in workspace settings,
  localStorage, session artifacts, logs, or generated client-visible payloads.
- **FR-005**: Add server endpoints to create/update, validate, rotate, and
  delete AI provider credentials. Sensitive mutations must require the existing
  mutable/admin workspace context.
- **FR-006**: Add an AI capability/status endpoint used by landing-aware app
  surfaces, Settings, New Breakdown, and Workspace controls.
- **FR-007**: In manual mode, disable generation actions and disable custom
  skill creation/editing/assignment. Explain that custom skills affect AI
  generation and require a configured provider key.
- **FR-008**: In AI-enabled mode, persist step skills server-side or otherwise
  guarantee workspace-scoped provenance. Browser-only skill state is not
  acceptable for live provider runs.
- **FR-009**: Treat step skills as untrusted user input. Enforce server-side
  validation for size, phase ownership, forbidden secret-exfiltration patterns,
  and output contract compatibility before use.
- **FR-010**: Replace live-mode unavailable behavior with a provider adapter
  layer that can call configured providers from the API server only.
- **FR-011**: Generation requests must compose provider prompts from canonical
  session fields: `rawInput`, `inputType`, `outputDepth`, `businessGoal`,
  `knownConstraints`, `targetUsers`, `labels`, `jiraKey`, workspace settings,
  existing artifacts, clarification answers, and the active step skill.
- **FR-012**: LLM output must be parsed, validated against existing Zod/DB
  artifact schemas, and rejected without overwriting prior trusted artifacts if
  validation fails.
- **FR-013**: Generation metadata must record provider, model, prompt version,
  skill id/version, input field snapshot hash, provider request id when
  available, mode, status, token/cost estimates when available, and error class.
- **FR-014**: Generation UI must show long-running states, retryable failures,
  unavailable/manual-mode reasons, and follow-up clarification questions when
  the AI result needs more user input.
- **FR-015**: Landing and app copy must honestly distinguish AI-enabled BYOK
  workflow from manual organization workflow. Avoid implying model calls happen
  without a configured key.
- **FR-016**: Add rate limits or quota guards for provider validation and
  generation routes to reduce accidental spend and abuse.
- **FR-017**: Add audit events for provider credential create/update/validate/
  rotate/delete and generation run start/success/failure. Audit events must not
  include secret values or full prompts.
- **FR-018**: Deleting or disabling a provider key immediately prevents new
  provider calls and moves the workspace to manual mode while preserving
  existing artifacts.

## Security Requirements

- Plaintext API keys exist only in memory during validation/encryption/provider
  call setup.
- API keys are never returned by API responses. Responses may include provider,
  status, model, fingerprint/suffix, and timestamps only.
- Logs must redact authorization headers, provider keys, prompt payloads, and
  provider responses by default.
- Provider calls run only from `artifacts/api-server`; the frontend never calls
  model providers directly.
- Stored ciphertext must include key version and enough metadata to support
  future rotation.
- Secret deletion must remove ciphertext or mark it unrecoverable, not only set
  `enabled=false`.
- Server must enforce workspace scope for every provider config and generation
  request.
- Prompt/skill injection must not be able to request key disclosure, arbitrary
  network calls, filesystem access, or cross-workspace data.
- Error messages shown to users must be useful but must not include provider
  secrets, raw prompts, stack traces, or hidden system instructions.

## UX Requirements

- Settings gets an AI provider section before Step Skills. It shows connection
  status, provider/model, last validation time, rotate/remove actions, and a
  short security explanation.
- Step Skills remains visible in manual mode but custom actions are disabled
  with concise rationale. Defaults can be previewed read-only.
- New Breakdown copy changes based on mode:
  - AI enabled: generation and agent-assisted refinement available.
  - Manual mode: structured organization and handoff available; connect a key
    to enable generation.
- Workspace phase controls show an AI status badge and disable generation
  buttons in manual mode.
- Running generation states should reflect possible latency with professional
  microcopy, not instant/deterministic language.
- If a generation result needs more information, the workflow should surface
  follow-up questions and keep the user in the current phase instead of forcing
  blind progression.

## Data / Contract Changes

Expected additions:

- AI provider config schema/table or dedicated extension of integration config.
- Encrypted secret storage shape with provider type, model, fingerprint,
  validation status, key version, and timestamps.
- Audit event table or route-backed audit append helper.
- OpenAPI schemas and endpoints for:
  - `GET /ai/provider`
  - `PUT /ai/provider`
  - `POST /ai/provider/validate`
  - `POST /ai/provider/rotate`
  - `DELETE /ai/provider`
  - `GET /ai/capability`
- Generation response metadata fields for live provider runs.
- Server-backed step skill contracts if live mode uses editable skills.

Keep `lib/api-spec/openapi.yaml`, `lib/api-zod/src/generated/`, and
`lib/api-client-react/src/generated/` in sync.

## Affected Areas

- `lib/api-spec/openapi.yaml`
- `lib/api-zod/src/generated/`
- `lib/api-client-react/src/generated/`
- `lib/db/src/schema/index.ts`
- `artifacts/api-server/src/routes/generation.ts`
- `artifacts/api-server/src/routes/settings.ts`
- `artifacts/api-server/src/routes/integrations.ts`
- `artifacts/api-server/src/lib/integration-secrets.ts`
- `artifacts/api-server/src/ai/`
- `artifacts/specflow-ai/src/pages/LandingPage.tsx`
- `artifacts/specflow-ai/src/components/landing/Hero.tsx`
- `artifacts/specflow-ai/src/pages/NewBreakdown.tsx`
- `artifacts/specflow-ai/src/pages/WorkflowWorkspace.tsx`
- `artifacts/specflow-ai/src/pages/SettingsPage.tsx`
- `artifacts/specflow-ai/src/components/settings/StepSkillsSection.tsx`
- `artifacts/specflow-ai/src/store/session-store.tsx`
- `docs/architecture.md`
- `docs/key-flows.md`
- `docs/adaptive-intake-and-step-skills.md`
- `docs/team-decisions/`

## Implementation Order

1. Contracts and DB schema: provider status, secret metadata, capability
   response, generation provenance, audit events.
2. Secret management: encrypt, decrypt for provider calls only, rotate, delete,
   validate, redact, and audit.
3. Provider runtime: server-only provider adapter and live generation
   resolution. Keep deterministic demo as explicit non-live mode.
4. Generation pipeline: compose prompts from real fields and step skills, call
   provider, validate/repair/reject outputs, preserve prior artifacts on error.
5. Server-backed step skills: workspace persistence, validation, assignment,
   provenance, and manual-mode disablement.
6. UI/UX: Settings provider onboarding, landing copy, New Breakdown mode copy,
   Workspace gating/loading/follow-up states, Step Skills disabled/read-only
   manual behavior.
7. Documentation and team decision record for BYOK security model and manual
   mode behavior.

## MVP Boundary

MVP should include:

- One supported provider adapter, preferably OpenAI-compatible if the chosen
  SDK and environment support it.
- Workspace-scoped BYOK key.
- Manual mode gates and copy across landing, settings, new breakdown, and
  workflow.
- Secure storage, validation, rotation, deletion, and audit-safe status.
- Live generation for existing five generated phases: clarification, PRD,
  epics, stories, quality.
- Schema validation with prior-artifact preservation on failure.
- Server-backed or disabled live-compatible step skills.

Defer:

- Multi-provider marketplace.
- Per-user keys.
- Shared skill marketplace.
- Full cost dashboards.
- Background queue workers for long generation runs.
- Streaming responses unless required by provider latency.

## Must Not Do

- Do not store API keys in localStorage, browser state, workspace settings JSON,
  session artifacts, or generated client-visible responses.
- Do not let the frontend call AI providers directly.
- Do not silently fall back to demo generation when the user expects live BYOK
  output.
- Do not let local browser step skills control live generation without
  server-side validation and provenance.
- Do not overwrite existing artifacts when provider output is invalid.
- Do not hand-edit generated OpenAPI client/Zod outputs without regenerating
  from `lib/api-spec/openapi.yaml`.

## Open Questions

- Which provider is the first supported BYOK target?
- Should provider config be workspace-scoped only for MVP, or support user
  overrides later?
- Which roles map to "admin" for credential mutation in the current Clerk
  workspace model?
- Should encrypted AI keys live in a dedicated table instead of extending
  `integration_config`?
- What is the required production key-management standard beyond the current
  environment-derived AES-GCM helper?

## Success Criteria

- Without an API key, users can complete a manual organization workflow and all
  AI/skill-generation controls are clearly disabled.
- With a valid API key, generation calls a real provider from the API server and
  produces schema-valid artifacts.
- Each generated output reflects the relevant input fields and active step
  skill, with provenance recorded.
- API key plaintext never appears in API responses, logs, database plaintext,
  generated artifacts, or browser storage.
- Provider failure, validation failure, rate-limit failure, and no-key mode all
  produce recoverable user-facing states.
- Removing the key immediately prevents new live provider calls.

## Failure Conditions

Executor must not report complete if:

- `SPECFLOW_AI_MODE=live` still returns only unavailable for the intended live
  path.
- Generation still discards prompt and step-skill instructions.
- API keys are returned to the browser after save.
- Step Skills can be edited/assigned in manual mode.
- Browser-local custom skills are used for live provider runs without server
  validation/provenance.
- Invalid provider output can overwrite saved artifacts.
- Landing/New Breakdown/Workspace copy still implies AI generation works
  without a configured key.

## Evidence Required

Executor must report:

1. Provider credential schema and API endpoints added.
2. Secret encryption/decryption/rotation/delete behavior and redaction path.
3. Live provider adapter and generation route changes.
4. How each session input field and active step skill affects provider prompts.
5. Manual-mode UI gates and copy changes.
6. Generated contract files refreshed from OpenAPI.
7. Security checks performed, including response/log review for secret leakage.
8. Verification result for no-key manual flow and valid-key live generation
   flow, or exact blocker.

## Executor Handoff

```text
Execute spec 024-byok-live-ai-workflow only after approval. Read this spec,
docs/architecture.md, docs/key-flows.md, docs/adaptive-intake-and-step-skills.md,
docs/team-decisions/README.md, specs/005-ai-workflow-mvp/spec.md,
specs/023-adaptive-intake-and-step-skills/spec.md, and
specs/009-clerk-supabase-auth-reset/data-model.md first.

Implement security-first BYOK live AI workflow. Preserve manual mode as a
first-class flow. Do not expose API keys to the browser after submission. Keep
OpenAPI, generated clients, DB schema, API server, and UI mode gates aligned.
```
