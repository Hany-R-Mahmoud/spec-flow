# Research: Workflow Generation UX — Code-Level Evidence

## Investigation Method

Full source-code read of the workflow UI layer, session store, API generation
routes, AI provider client, and custom fetch implementation. No browser testing
was performed — findings are based on static analysis of behavior.

## Architecture Summary

```
User clicks "Generate X"
  → handleGeneration(step) in WorkflowWorkspace.tsx
    → isWorkflowGenerating guard (prevents double-click)
    → runGeneration(sessionId, step) in session-store.tsx
      → setState: generation[step].status = 'running' (local)
      → customFetch POST /api/sessions/:id/generate/:step
        → Server: marks 'running' in DB
        → Server: calls runOpenAiJson (45s timeout)
        → Server: marks 'succeeded' or 'failed'
      → Client awaits full HTTP response (no streaming)
    → On success: replaceSession in state, toast
    → On failure: set status='failed', toast
```

## Timing Analysis

| Phase | Typical Duration | Max Duration |
|-------|-----------------|--------------|
| Client state update | <1ms | <1ms |
| Network round-trip | 50–200ms | 500ms |
| AI provider processing | 5–30s | 45s (timeout) |
| Response parsing | <50ms | <50ms |
| **Total user wait** | **5–30s** | **~46s** |

## UI Feedback During Wait (Current State)

| UI Region | What happens | Visibility |
|-----------|-------------|------------|
| Button | Tiny 14px spinner appears next to unchanged text | Low |
| StepActionBar | opacity drops from 1.0 to 0.85 | Nearly invisible |
| GenerationStatusNotice | Nothing (only renders for succeeded/failed) | None |
| PhaseTracker | No change | None |
| GuidancePanel | No change (isLoading never set to true) | None |
| Content area | Stays completely static | None |
| Toast | Nothing until completion | None |

## Key Code Evidence

### GenerationStatusNotice only shows post-generation states

```typescript
// GenerationStatusNotice.tsx line 18
const isVisible = status === 'succeeded' || status === 'failed' ||
  status === 'unavailable' || Boolean(errorMessage);

if (!isVisible) {
  return null; // ← 'running' status renders NOTHING
}
```

### StepActionBar loading is barely visible

```typescript
// StepActionBar.tsx line 18
<div className={cn(
  "flex items-center justify-end gap-2 px-0 transition-opacity",
  isLoading && "opacity-85", // ← 15% reduction, nearly invisible
)}>
```

### Button has no loading variant

```typescript
// button.tsx — CVA variants
// No 'loading' variant exists. Spinners are manually placed as children:
{isGenerating ? <Spinner className="h-3.5 w-3.5" /> : null}
// Button text never changes during loading
```

### No AbortController in the client

```typescript
// custom-fetch.ts — customFetch function
// Accepts RequestInit options but no AbortController is ever passed
// from session-store.tsx's runGeneration
export async function customFetch<T = unknown>(
  input: RequestInfo | URL,
  options: CustomFetchOptions = {},
): Promise<T> {
  // ... no signal handling beyond what RequestInit provides
}
```

### Server timeout is 45 seconds with no progress events

```typescript
// provider-client.ts
const DEFAULT_AI_PROVIDER_TIMEOUT_MS = 45_000;

// The entire call is a single fetch with AbortSignal.timeout:
function createTimeoutSignal(timeoutMs: number): AbortSignal {
  return AbortSignal.timeout(timeoutMs);
}
```

### GuidancePanel has loading UI but it's never triggered

```typescript
// GuidancePanel.tsx — accepts isLoading prop with full skeleton UI
// WorkflowWorkspaceContent.tsx — never passes isLoading=true:
<GuidancePanel
  phase={activePhase}
  phaseStatus={session.phases[activePhase]}
  items={guidanceItems}
  completionCount={completionCount}
  // isLoading is never passed ← defaults to false
/>
```

### ai-loading-slide animation exists but is unused

```css
/* index.css lines 7-17 */
@keyframes ai-loading-slide {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(60%); }
  100% { transform: translateX(220%); }
}
/* Not referenced in any component className */
```

## Comparison: What Users Expect vs What They Get

| Expectation | Reality |
|-------------|---------|
| Clear "processing" state | Static screen with tiny spinner |
| Progress indicator | Nothing |
| Time estimate | Nothing |
| Cancel option | Nothing (must refresh page) |
| Completion signal | Toast notification (easy to miss) |
| Next step guidance | Must manually discover what to do |

## Risk Assessment

| Issue | Severity | User Impact |
|-------|----------|-------------|
| No running-state UI | Critical | Users think app is broken |
| No time estimate | High | Users abandon prematurely |
| No cancel mechanism | Medium | Users must refresh to escape |
| Imperceptible button feedback | High | Users double-click or think click failed |
| No completion highlight | Medium | Users miss that content arrived |
| No phase auto-advance | Low | Minor friction, not blocking |
