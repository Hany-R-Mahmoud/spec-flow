# SpecFlow AI Design System

**Source**: UI UX Pro Max local skill  
**Product**: SpecFlow AI - spec-driven SaaS workflow tool  
**Created**: 2026-05-08  
**Direction**: Precision Ops (approved)

---

## 1. Visual Theme & Atmosphere

**Mood**: Calm, precise, premium dev-tool.

- **Feel**: Professional workflow tool for developers. Clean lines, scannable metrics, instant understanding.
- **References**: Linear, GitHub Projects, Datadog dashboard, Sentry Issues.
- **Posture**: Information density is the feature. No decorative elements. No marketing copy. Every pixel shows workflow state.

**Philosophy**: The dashboard should answer four questions within five seconds:
1. What spec/workflow work is active?
2. What needs review or intervention?
3. What is ready to export or hand off?
4. Where do I start the next breakdown?

**Avoid**:
- Marketing-heavy hero layouts
- Oversized decorative gradients
- Monochrome gray-only interface
- Nested cards and decorative card stacks
- Abstract illustrations in operational dashboard space
- Purple as default accent (reserved for future AI agent concepts)

---

## 2. Color Palette & Roles

Semantic tokens, not raw component hex:

| Token | Role | Hex Value |
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
| `accent.agent` | AI agent handoff (future) | `#7C3AED` |
| `status.success` | Ready/complete | `#15803D` |
| `status.warning` | Awaiting review | `#B45309` |
| `status.danger` | Blocked/error | `#B91C1C` |
| `focus.ring` | Keyboard focus | `#2563EB` |

**Usage Rules**:
- Blue (`accent.primary`) as main product/action accent
- Teal (`accent.sync`) for sync/integration state only
- Violet (`accent.agent`) sparingly for future AI agent/handoff concepts
- Green/yellow/red **only for status**, never as decoration
- Convey readiness/risk by **color + label + icon**, never color alone
- All foreground/background pairs must meet WCAG AA contrast

---

## 3. Typography Rules

**Font Stack**:
```
Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

**Scale**:

| Role | Size | Weight | Line Height | Use |
|---|---|---|---|---|
| Page title | 24px | 650 | 32px | Main screen title |
| Section title | 16px | 650 | 24px | Card/table headings |
| Body | 14px | 400 | 22px | Table cells, descriptions |
| Label | 12px | 600 | 16px | Metadata, badges |
| Metric | 28px | 700 | 34px | KPI numbers |
| Small meta | 12px | 400 | 16px | Last updated, helper text |

**Rules**:
- Use **tabular numbers** (`font-variant-numeric: tabular-nums`) for metrics, scores, percentages, timestamps
- Minimum body text: 14px desktop, 16px mobile forms
- No negative letter-spacing on display type
- Keep labels concrete: "84/100" not "84%"

---

## 4. Component Stylings

### App Shell

- **Header**: 56-64px height, white background, bottom border separates from content
- **Sidebar**: 240-280px width, white background, stronger separator from canvas
- **Command/Search**: Real button trigger with visible label or `aria-label`. Border container. Keyboard shortcut shown as metadata pill

### KPI Cards

- White card background, 8px radius, subtle border
- Each card needs: label, value, status context
- Semantic accents:
  - Active sessions: `accent.primary` (blue)
  - Readiness: `status.success` if healthy, `status.warning` if below threshold
  - Review queue: `status.warning` (amber)
  - Exports: `accent.sync` (teal)

### Tables

- Caption or accessible name required
- Column headers with correct `scope`
- Tabular figures for scores/progress
- Row hover: subtle `surface.subtle`
- Dense rows need dividers, not zebra striping by default
- Row height: 48-56px

### Badges & Status

- Text **plus** color, never color alone
- Stable vocabulary: `Draft`, `In review`, `Ready`, `Blocked`, `Export ready`, `Synced`
- Status colors map to semantic tokens only

### Buttons

- One **primary** action per screen/panel
- Icon-only buttons: require `aria-label` or visible tooltip
- Disabled: semantic `disabled` attribute + visual change
- Loading: progress indicator + prevent duplicate submit

---

## 5. Layout Principles

**Desktop Dashboard Rhythm**:

- App shell header: 56-64px
- Sidebar width: 240-280px
- Main content: fluid with 24-32px padding
- Card radius: 8px max
- Card padding: 16-20px for KPIs, 20-24px for larger panels
- Table row height: 48-56px
- Icon buttons: 40px visual, 44px hit target

**Base Spacing Scale**:
```
4, 8, 12, 16, 20, 24, 32, 40, 48
```

**Suggested Layout**:
```
Header: product name | workspace | command/search | user/actions
Sidebar: nav with active indicator
Main:
  Page header: "Dashboard" + status line + primary CTA
  KPI grid: 4 cards with semantic accents
  Work section: Active sessions table
```

**Responsive**:
- Desktop (1024px+): Full layout with sidebar
- Tablet (768px-1023px): Collapsible sidebar, full KPI grid
- Mobile (<768px): Sidebar drawer, KPI grid stacks 2→1 column
- Never allow horizontal scroll on tables

---

## 6. Depth & Elevation

- **Shadows**: Minimal. Use subtle `0 1px 2px rgba(0,0,0,0.05)` only on dropdowns/modals
- **Borders**: Primary separation tool. Default 1px, strong borders 1.5px
- **No decorative shadows** on dashboard cards
- **No layered card stacks**
- App-shell hierarchy achieved through border + whitespace, not shadow

---

## 7. Do's and Don'ts

**DO**:
- Use declared color tokens exclusively
- Use tabular numbers for all metrics
- Accessible labels on every interactive element
- Status: color + label + optional icon
- One primary CTA per screen
- Semantic HTML: `main`, `nav`, proper headings, table headers
- Skip-to-content link

**DON'T**:
- Invent colors outside the palette
- Decorative shadows on KPI cards
- Use gray-on-gray with weak active states
- Placeholder-only input labels
- Icon-only buttons without `aria-label`
- Marketing hero layouts on dashboard
- Decorative gradients or blobs
- Fake controls or flashy motion
- Use violet as default accent (reserved for future AI agent concepts)
- Replace dashboard with landing-page aesthetic

---

## 8. Responsive Behavior

**Breakpoints**:
```
640px, 768px, 1024px, 1280px
```

| Breakpoint | Layout |
|---|---|
| 1024px+ | Full layout with sidebar |
| 768px-1023px | Collapsible sidebar, full KPI grid |
| <768px | Sidebar drawer, KPI grid 2→1 column |

**Rules**:
- Never allow horizontal scroll on tables
- Prioritize: command/search, active workflow state, next action on smaller screens
- Touch targets: minimum 44px

---

## 9. Agent Prompt Guide

- Do NOT invent colors outside this palette
- Do NOT add box-shadows unless specified in Depth & Elevation
- Accent color appears maximum 3 times per viewport
- All interactive elements need `:focus-visible` outline
- Tabular numbers on all metrics, scores, timestamps
- KPI cards: always show unit (e.g., "84/100", not "84%")
- Status badges: text + color, never color alone
- Command palette: trigger requires visible label or `aria-label`
- Sidebar nav: semantic `nav` element with accessible label
- Tables: require `<caption>` or `aria-labelledby`
- Row actions: inline menu or button, not navigate-only
- No animations beyond small state transitions (150-250ms)
- Respect `prefers-reduced-motion`

---

**Document Status**: Approved design system  
**Next**: Implementation in `002-ui-polish-foundation`
