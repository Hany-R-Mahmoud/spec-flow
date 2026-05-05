# SpecFlow AI Design System Direction

**Source**: UI UX Pro Max local skill  
**Feature**: `001-ui-ux-polish-workflow`  
**Created**: 2026-05-05  
**Status**: Round 1 design direction, pre-implementation  

## Product Positioning

SpecFlow AI is a developer workflow SaaS for spec-driven AI development,
GitHub/local sync, Spec Kit lifecycle management, and AI agent handoffs. The UI
should feel clear, precise, premium, and operational. It should not feel like a
marketing site, toy prototype, or decorative portfolio surface.

Primary design promise:

- Make workflow state obvious.
- Make next action easy to find.
- Make agent/spec handoff trustable.
- Keep dense information scannable.

## Visual Tone

- **Precise**: clear hierarchy, stable layout, tabular numbers, consistent
  spacing.
- **Calm**: restrained color, low-noise surfaces, limited shadows.
- **Premium dev-tool**: technical but not terminal cosplay; modern SaaS polish
  without glossy decoration.
- **Action-oriented**: status, readiness, review queue, and export state should
  lead the eye.

Avoid:

- Marketing-heavy hero layouts.
- Oversized decorative gradients.
- Monochrome gray-only interface.
- Nested cards and decorative card stacks.
- Abstract illustrations in operational dashboard space.

## Color System

Use semantic tokens, not raw component-level hex values.

### Core Tokens

| Token | Role | Suggested Value |
|---|---|---|
| `surface.canvas` | App background | `#F6F7F9` |
| `surface.panel` | Sidebar/header surface | `#FFFFFF` |
| `surface.card` | KPI/table cards | `#FFFFFF` |
| `surface.subtle` | Hover rows, grouped metadata | `#EEF2F6` |
| `border.default` | Card/input dividers | `#D7DEE8` |
| `border.strong` | Active/focus structural border | `#A9B7C8` |
| `text.primary` | Main text | `#111827` |
| `text.secondary` | Supporting text | `#4B5563` |
| `text.muted` | Metadata | `#6B7280` |
| `accent.primary` | Primary action/active nav | `#2563EB` |
| `accent.primarySoft` | Active nav background | `#EFF6FF` |
| `accent.sync` | GitHub/local sync | `#0F766E` |
| `accent.agent` | AI agent handoff | `#7C3AED` |
| `status.success` | Ready/complete | `#15803D` |
| `status.warning` | Awaiting review | `#B45309` |
| `status.danger` | Blocked/error | `#B91C1C` |
| `focus.ring` | Keyboard focus | `#2563EB` |

### Color Rules

- Use blue as the main product/action accent.
- Use teal for sync/integration state.
- Use violet sparingly for AI agent/handoff concepts.
- Use green/yellow/red only for status and never as decoration.
- Never convey readiness or risk by color alone; pair with labels, icons, or
  numeric values.
- All foreground/background pairs must meet WCAG AA contrast.

## Typography

Preferred system stack:

```text
Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Use tabular numbers for metrics, scores, percentages, and timestamps.

| Role | Size | Weight | Line Height | Use |
|---|---:|---:|---:|---|
| Page title | 24px | 650 | 32px | Main screen title |
| Section title | 16px | 650 | 24px | Card/table headings |
| Body | 14px | 400 | 22px | Table cells, descriptions |
| Label | 12px | 600 | 16px | Metadata, badges |
| Metric | 28px | 700 | 34px | KPI numbers |
| Small meta | 12px | 400 | 16px | Last updated, helper text |

Rules:

- Minimum body text: 14px desktop, 16px mobile forms.
- No negative letter spacing.
- Keep labels short and concrete.
- Prefer wrapping over truncation; if truncation is needed, provide full text on
  hover/focus where the app pattern supports it.

## Spacing And Layout

Base spacing scale:

```text
4, 8, 12, 16, 20, 24, 32, 40, 48
```

Desktop dashboard rhythm:

- App shell header: 56-64px.
- Sidebar width: 240-280px.
- Main content max width: fluid, with 24-32px page padding.
- Card radius: 8px maximum unless existing design system requires otherwise.
- Card padding: 16-20px for KPI cards, 20-24px for larger panels.
- Table row height: 48-56px.
- Icon buttons: at least 40px visual box, 44px hit target.

Responsive rules:

- Avoid horizontal scroll.
- Collapse sidebar into accessible navigation before content becomes cramped.
- Prioritize command/search, active workflow state, and next action on smaller
  screens.

## Component Rules

### App Shell

- Header should separate product identity, workspace context, and global
  command/search.
- Sidebar must be a semantic `nav` with an accessible label.
- Active nav must have both background and text/icon treatment.
- Focus ring must be visible for all nav items and controls.

### Command Search

- Use a real button or labeled input trigger for command palette.
- Visible label or accessible name is required; placeholder-only is not enough.
- Show keyboard shortcut as metadata, not as the only affordance.
- Trigger should have clear border/container separation.

### KPI Cards

- Each KPI card needs: label, value, status/meaning, optional trend or queue
  context.
- Add small consistent icons only when they improve scanning.
- Readiness score, review queue, and export state should use semantic status.
- Avoid big decorative numbers with no workflow meaning.

### Tables

- Include table caption or accessible name.
- Use column headers with correct scope.
- Use tabular figures for scores/progress.
- Row hover/focus state should be subtle but visible.
- Dense tables need whitespace and dividers, not zebra striping by default.

### Badges And Status

- Badges should use text plus color.
- Keep status vocabulary stable: `Draft`, `In review`, `Ready`, `Blocked`,
  `Export ready`, `Synced`.
- Status colors must map to semantic tokens only.

### Buttons

- One primary action per screen or panel.
- Icon-only buttons require accessible names and tooltip labels.
- Disabled state must use semantic disabled attributes plus visual change.
- Loading actions show progress and prevent duplicate submit.

## Accessibility Rules

Non-negotiable:

- Contrast at least 4.5:1 for normal text.
- Visible keyboard focus ring on every interactive element.
- No icon-only control without accessible label.
- No placeholder-only input label.
- Semantic `main`, `nav`, headings, table headers, and buttons.
- Skip-to-content link for app shell.
- Status changes announced where async workflow state updates.
- Respect `prefers-reduced-motion`.

## Motion

- Use motion only for state continuity: command palette opening, sidebar
  collapse, row expansion, status update.
- Duration: 150-250ms for most interactions.
- Use transform/opacity; avoid layout-shifting animation.
- No decorative looping motion on dashboard.

## Anti-Patterns

- Replacing dashboard with landing page/hero.
- Adding decorative blobs, oversized gradients, or fake 3D previews.
- Hiding workflow state behind large cards.
- Mixing multiple visual languages from different design tools.
- Adding dependencies for visual polish that existing CSS can support.
- Using gray-on-gray text with weak active states.
- Shipping any icon button with empty accessible text.
- Changing unrelated app structure during polish.

## Implementation Guidance For Later Agents

- Start with app shell, command search, KPI cards, and active sessions table.
- Prefer existing app components and CSS patterns.
- Do not introduce runtime dependencies unless the selected direction cannot be
  implemented cleanly otherwise.
- Keep changes traceable to this spec and the approved decision report.
