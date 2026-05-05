# Dashboard Design Direction

**Surface**: default dashboard at `http://localhost:8080/`  
**Baseline inputs**: `baseline.md`, `baseline.png`  
**Goal**: turn generated dashboard into a clear, premium dev-workflow command
center without changing product scope.

## Dashboard Job

The dashboard should answer four questions within five seconds:

1. What spec/workflow work is active?
2. What needs review or intervention?
3. What is ready to export or hand off?
4. Where do I start the next breakdown?

## Current Baseline To Preserve

- Sidebar navigation: Dashboard, New Breakdown, Projects, Reviews, Exports,
  Settings.
- KPI card pattern for active sessions, readiness, review queue, exports.
- Active sessions table with phase, progress, readiness, status, last updated.
- Visible command/search affordance with keyboard shortcut.
- Clean desktop SaaS layout.

## Priority Fix Direction

### 1. Command/Search Affordance

Problem from baseline:

- Search uses placeholder-only "Search... (⌘K)" and weak container separation.

Direction:

- Treat as a command palette trigger with accessible label.
- Use border, subtle surface, and shortcut pill.
- Label purpose as "Search commands, specs, projects" where space allows.

Implementation note for later:

- Prefer a real button trigger if the palette is not an editable search input.
- Ensure `aria-label` or visible label exists.

### 2. Sidebar Hierarchy

Problem from baseline:

- Active state is subtle; nav hierarchy has little personality.

Direction:

- Use `accent.primarySoft` active background, `accent.primary` text/icon, and a
  slim left active indicator.
- Add icons from existing icon system if already present.
- Keep sidebar calm and utility-first.

Implementation note for later:

- Sidebar must be semantic `nav` with label.
- Focus ring must be visible on every nav link.

### 3. KPI Card System

Problem from baseline:

- Cards are clear but generic; numbers lack semantic meaning beyond text.

Direction:

- Add compact icon/marker per card.
- Add one-line status context under the value.
- Use semantic accents:
  - Active sessions: blue/action
  - Avg readiness: green if healthy, warning if below threshold
  - Awaiting dev review: amber
  - Jira exports ready: teal

Implementation note for later:

- Do not overdecorate cards.
- Keep card height stable.

### 4. Active Sessions Table

Problem from baseline:

- Dense rows and status values are useful but need stronger scan paths.

Direction:

- Improve column alignment and tabular numbers.
- Use status badges with text plus color.
- Add accessible table caption/name.
- Keep row density suitable for developer workflow.

Implementation note for later:

- Avoid zebra striping unless dividers/spacing are insufficient.
- Table headers need scope.

### 5. Workflow Next Action

Problem from baseline:

- Dashboard shows state but primary next action is not dominant enough.

Direction:

- Primary CTA: "New breakdown".
- Secondary actions: review queue, export packages.
- Avoid marketing copy; actions should be operational.

## Suggested Dashboard Layout

```text
Header: product name | workspace | command/search | user/actions
Sidebar: nav with active indicator
Main:
  Page header: "Dashboard" + concise status line + New breakdown CTA
  KPI grid: 4 cards with semantic accents
  Work section: Active sessions table
  Secondary section: Review/export queues if space allows later
```

## Accessibility Requirements

- Add skip-to-content link in app shell.
- Command/search needs visible or programmatic label.
- Icon-only controls need `aria-label`.
- Table needs caption or `aria-labelledby`.
- Status badges must not rely on color alone.
- Ensure visible focus state for nav, command trigger, buttons, and table row
  actions.

## Do Not Change Yet

- Do not redesign information architecture.
- Do not replace dashboard with landing page.
- Do not add new product modules.
- Do not change data model or API behavior.
- Do not add animation beyond small state transitions.
- Do not introduce new runtime dependencies for visual polish.

## First Micro-Change Candidate

Improve the command/search trigger and sidebar active state together as the
first implementation slice. They affect global navigation clarity, accessibility,
and perceived quality with limited code risk.
