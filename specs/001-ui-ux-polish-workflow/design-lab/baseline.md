# Baseline Snapshot: UI/UX Polish Workflow

**Captured**: 2026-05-05
**URL**: `http://localhost:8080/`
**Route**: Dashboard (default landing)

---

## Visible Layout Sections

1. **Header bar** — App title "SpecFlow AI", workspace label
2. **Sidebar/Nav** — Left sidebar with nav links: Dashboard, New Breakdown, Projects, Reviews, Exports, Settings
3. **Main content area** — "Workspace overview and active sessions" with stats cards and an active sessions table
4. **Command palette trigger** — Search input: "Search... (⌘K)"

---

## Navigation / Sidebar / Header

- **Header**: Fixed top bar with app wordmark and workspace context ("Workspace PM")
- **Sidebar**: Left-anchored, vertical nav links with Dashboard highlighted (active state)
- **Search bar**: Inline below header/sidebar with ⌘K keyboard shortcut hint
- **Nav links**: Dashboard, New Breakdown, Projects, Reviews, Exports, Settings

---

## Primary User Workflow

The app is a **spec/breakdown management SaaS tool**. The dashboard shows:
- Active breakdown sessions in progress (4 sessions)
- Avg readiness score (84/100)
- Awaiting dev review (6 stories in queue)
- Jira exports ready (3 packages)
- A table of active sessions (name, phase, progress %, readiness score, status, last updated)

Users create breakdowns (New Breakdown), manage projects, review stories, and export to Jira.

---

## Visual Strengths

- Clean dashboard layout with clear KPI cards (sessions, readiness, queue, exports)
- Short, scannable table of active sessions with progress indicators
- ⌘K command palette affordance visible at top
- Sidebar nav is clear and scannable
- Responsive sidebar-to-content ratio (~1:4)
- Status indicators on table rows (progress bars, color-coded readiness scores)
- Consistent card-based layout for stats

---

## Visual Weaknesses

- No footer; no secondary nav or breadcrumbs
- Sidebar has minimal visual hierarchy between nav items
- No visible empty state for zero sessions (would need to verify)
- Monochrome/gray palette with no strong brand color personality
- Table rows are dense; no alternating row shading
- Search bar has no visible border or container separation
- Stats cards have no icons or visual markers beyond numbers
- Header/sidebar have no clear visual separation (same background tone)
- No global notification or action feedback system visible

---

## Accessibility Concerns Visible from Screen

- Search input has no visible label (placeholder only: "Search... (⌘K)")
- Nav sidebar items appear to be `<a>` tags but keyboard focus style unknown
- Buttons include two empty-label buttons ("") visible in DOM — likely icon buttons with no accessible text
- No ARIA roles visible on key sections; semantic `<main>` present but no `<nav>` label
- No skip-to-content link
- Table has no `<caption>` or scope attributes confirmed
- Contrast ratio of sidebar text on background not verified
- Focus ring visibility on interactive elements not verified in screenshot

---

## First 3 Candidate Polish Targets

1. **Search/command palette UX** — The ⌘K palette is a key feature but has no visible trigger affordance. Needs clear keyboard hint and accessible label on the search input.

2. **Sidebar visual hierarchy** — Active nav state is subtle. Add distinguishing color/icon for active route and hover states with clear focus rings for keyboard users.

3. **Stats card design system** — Four KPI cards are the first screen impression. Add iconography, color-coded semantic indicators, and breathing room to differentiate "good" (readiness 84) vs "needs attention" (6 awaiting review) vs "action ready" (3 exports).

---

## Confirmation

- **No application source code was changed** as part of this baseline snapshot.
- Only reads via Playwright (DOM inspection) and curl (HTTP status) were performed.
- Dev server was started transiently for screenshot capture and shut down.
- Design-lab output files are confined to `.local/design-lab/001-ui-ux-polish-workflow/`.

---

## Screenshot

`baseline.png` — 1440×900 viewport, full-page capture of the Dashboard route.