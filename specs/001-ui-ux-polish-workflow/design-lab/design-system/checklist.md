# SpecFlow AI UI Polish Checklist

Use before any app-code implementation prompt is handed to OpenCode.

## Product Fit

- [ ] UI feels like a precise developer SaaS workflow tool, not a landing page.
- [ ] Dashboard emphasizes active specs, review needs, exports, and handoffs.
- [ ] Visual language is calm, premium, and operational.
- [ ] Design avoids decorative blobs, generic gradients, and oversized hero
      treatment.
- [ ] Selected direction can be implemented with existing project tools.

## Layout

- [ ] Header, sidebar, and main content have clear separation.
- [ ] Sidebar active state is visible without relying on color alone.
- [ ] Main dashboard has clear page title and primary action.
- [ ] KPI cards have stable size and consistent spacing.
- [ ] Tables remain readable at dense SaaS dashboard scale.
- [ ] No nested card-in-card layouts.
- [ ] No horizontal scroll on supported viewport widths.

## Typography

- [ ] Type scale follows 12/14/16/24/28-ish roles.
- [ ] Body copy is readable and not below 14px on desktop.
- [ ] Metrics use tabular numbers.
- [ ] Labels are short, concrete, and consistent.
- [ ] Text wraps or truncates intentionally with recovery path.

## Color And Status

- [ ] Semantic tokens are used for action, sync, agent, success, warning, danger.
- [ ] Gray palette is not the only visual personality.
- [ ] Status badges include text plus color.
- [ ] Readiness and review states have clear meaning.
- [ ] Contrast meets WCAG AA for text and interactive states.

## Navigation And Interaction

- [ ] Command/search trigger has clear affordance and accessible name.
- [ ] Keyboard shortcut hint is visible but not the only label.
- [ ] One primary action is visually dominant per screen or panel.
- [ ] Hover, active, pressed, disabled, loading, and focus states are defined.
- [ ] Click/tap targets are at least 44px where practical.

## Accessibility

- [ ] App has semantic `main`.
- [ ] Sidebar uses semantic `nav` with an accessible label.
- [ ] Skip-to-content link exists.
- [ ] Icon-only buttons have accessible names.
- [ ] Search/input controls are not placeholder-only labeled.
- [ ] Tables have caption or accessible name.
- [ ] Table headers use correct scope.
- [ ] Focus ring is visible on all interactive elements.
- [ ] Async state updates use user-friendly feedback and screen-reader-safe
      announcements where relevant.
- [ ] Motion respects `prefers-reduced-motion`.

## Implementation Guardrails

- [ ] Changes are scoped to approved spec.
- [ ] Existing app files are inspected before editing.
- [ ] Existing user changes are preserved.
- [ ] No unrelated refactor or formatting churn.
- [ ] No new runtime dependency unless justified in plan.
- [ ] No `console.log`, unused import, unused variable, or dead code introduced.
- [ ] TypeScript stays strict-compatible; no `any`.
- [ ] Existing schema-layer types are reused when behavior touches data.

## First Slice Readiness

- [ ] First micro-change is named.
- [ ] Files likely affected are listed before implementation.
- [ ] Verification is visual/accessibility-focused and proportional.
- [ ] "Do not change yet" items are explicit.
