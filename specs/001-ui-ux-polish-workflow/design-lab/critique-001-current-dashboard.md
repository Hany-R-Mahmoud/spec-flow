# Critique · Current Dashboard UI

**Artifact reviewed**: SpecFlow AI Dashboard (`http://localhost:8080/`)
**Date**: 2026-05-05
**Reviewer**: Open Design Critique skill (`.local/skills/open-design-critique/SKILL.md`)
**Method**: 5-dimension expert design review
**Output**: Markdown (not HTML artifact — see task requirements)

---

## Verdict

The dashboard is a **functional but undifferentiated SaaS prototype** — it communicates the right information but carries no visual personality or crafted detail. Four KPI cards and a sessions table do the job; nothing offends; nothing delights. It reads like a generated scaffold awaiting a design system.

---

## Dimension Scores

| Dimension | Score / 10 | Band |
|---|---|---|
| Visual hierarchy | 6 | Functional |
| Navigation clarity | 6 | Functional |
| Information density | 7 | Strong |
| SaaS workflow fit | 6 | Functional |
| Accessibility | 4 | Broken |

---

## Detailed Assessments

### 1. Visual Hierarchy · 6/10

**Evidence**: The page has three visual weight tiers — KPI cards (large numbers, medium label), page heading ("Workspace overview and active sessions"), and table content (small, dense). However, the KPI card section and the table share equal visual real estate, making it unclear whether "active sessions" or "4 sessions in progress" is the primary message. The "Dashboard" heading is not visually dominant; the stats come before it in reading order. The search bar sits between the sidebar and main content with no container or border, making it feel like an afterthought rather than a primary interaction point.

**Keep**: KPI number size (large, scannable).
**Fix**: Move the page title ("Workspace overview...") to a larger, more prominent position above the KPI cards.
**Quick win**: Add 8–12px bottom border to the header bar to visually separate it from the content area.

### 2. Navigation Clarity · 6/10

**Evidence**: Sidebar contains 6 links (Dashboard, New Breakdown, Projects, Reviews, Exports, Settings). The active item (Dashboard) is highlighted but the mechanism is subtle — likely a background color change of low contrast. No icons, no labels indicating section purpose beyond the text labels themselves. The "New Breakdown" CTA button is visually prominent in the sidebar but sits in a nav context rather than a content context, creating ambiguity about whether it is a nav action or a primary CTA.

**Keep**: Six-link limit is appropriate for a manageable workspace tool.
**Fix**: Add a distinct visual treatment for the active nav item (stronger contrast, left border accent, or icon state change).
**Quick win**: Move the "New Breakdown" primary CTA out of the sidebar nav into a dedicated toolbar or header zone to separate navigation from primary action.

### 3. Information Density · 7/10

**Evidence**: The four KPI cards efficiently communicate sessions-in-progress (4), readiness score (84/100), stories awaiting review (6), and export packages ready (3). The sessions table packs 6 columns (Name, Phase, Progress, Readiness, Status, Updated) into a dense row with no zebra striping or column grouping. The "Avg Readiness Score" card is labeled "84/100 developer readiness" — the unit and meaning are clear. The "4 sessions" card shows "sessions in progress" as the sub-label — scannable but undifferentiated from other cards without icons or semantic color.

**Keep**: KPI cards are well-proportioned; labels are explicit about units (84/100, not just 84).
**Fix**: Group the table columns into "identity" (Name), "progress" (Phase, Progress %), "health" (Readiness, Status), and "time" (Updated) to reduce cognitive load.
**Quick win**: Add zebra striping or subtle row separators to the sessions table to reduce visual fatigue on long lists.

### 4. SaaS Workflow Fit · 6/10

**Evidence**: The dashboard correctly surfaces the primary SaaS workflow loop for a spec/breakdown tool: see active work → assess health → take action (new breakdown, review, export). The sessions table gives a workflow-centric view (Phase, Progress, Readiness scores) rather than a document-centric view. However, there is no way to act on a row without navigating away — no inline action buttons, no status-change affordance, no quick-preview on row click. The "Exports" nav link implies Jira integration but no export status detail is visible from the dashboard. The ⌘K search is present but has no visible trigger affordance (no button, no highlighted shortcut display).

**Keep**: Workflow-centric table columns (Phase, Readiness, Status) correctly model the dev-review cycle.
**Fix**: Add an inline row action (e.g., "..." menu or "Open" button) to the sessions table so users can act without navigating away.
**Quick win**: Show the ⌘K shortcut as an explicit keyboard shortcut button adjacent to the search input, not just a placeholder.

### 5. Accessibility · 4/10

**Evidence**: This is the weakest dimension. The search input uses only a placeholder ("Search... (⌘K)") with no visible `<label>` element — fails WCAG 2.1 SC 1.3.1. Two buttons in the DOM have empty `innerText` (likely icon-only buttons with no `aria-label`) — fails WCAG 2.1 SC 4.1.2. The sidebar nav lacks an `aria-label` or `<nav>` landmark with a label. The sessions table has no `<caption>` — fails WCAG 2.1 SC 1.3.1. There is no skip-to-content link. Keyboard focus styles are not confirmed from the screenshot. Contrast ratios have not been measured.

**Keep**: Semantic `<main>` element is present — good structural foundation.
**Fix**: Add `aria-label` to the search input (e.g., `aria-label="Command palette search"`) and to all icon-only buttons.
**Quick win**: Add a visually hidden `<label>` or `aria-label` to the search input. This is a single attribute change with high impact.

---

## Top 5 Problems

### Problem 1 — Icon-only buttons have no accessible name
- **Evidence**: DOM inspection shows two `<button>` elements with empty `innerText`. No `aria-label` attribute observed.
- **Why it matters**: Screen reader users and keyboard-only users cannot identify what these buttons do. This is a critical accessibility failure.
- **Severity**: High
- **Fix direction**: Add `aria-label="[action description]"` to each icon button, or add visually hidden text inside the button.

### Problem 2 — Search input has no label
- **Evidence**: Search input uses only `placeholder="Search... (⌘K)"`. No `<label>` or `aria-label` attribute found.
- **Why it matters**: Placeholder text is not a label substitute (it disappears, has low contrast, and is not announced by screen readers as a field label). Fails WCAG 1.3.1.
- **Severity**: High
- **Fix direction**: Add a visible `<label>` element or `aria-label="Search workspace..."` attribute to the input element.

### Problem 3 — Active nav state is visually ambiguous
- **Evidence**: The active Dashboard nav item is highlighted with what appears to be a subtle background color change. No left border accent, no icon state change, no bold text.
- **Why it matters**: Users with low vision or cognitive load may not notice which page they are on, especially in a sidebar with six items and no icons.
- **Severity**: Medium
- **Fix direction**: Use a stronger active indicator — a 3px left accent border in the brand color, combined with a slight background shade change. Add icons to nav items for faster visual scanning.

### Problem 4 — Sessions table lacks structure and actionable affordance
- **Evidence**: 6-column dense table with no row grouping, no inline actions, no hover state confirmed, no zebra striping. Each row is read-only with no click-to-expand or quick-action affordance.
- **Why it matters**: In a workflow tool, rows represent active work items that need attention. Read-only rows force navigation away for every action, disrupting the workflow loop.
- **Severity**: Medium
- **Fix direction**: Add an inline "..." overflow menu or "Open" button on each row. Group columns into semantic clusters (identity / progress / health / time). Add zebra striping.

### Problem 5 — No brand color or visual personality
- **Evidence**: The entire UI uses a monochrome gray/white palette. No primary brand color appears on interactive elements, no icon set defines section personality, no visual motif ties the four KPI cards together beyond shared geometry.
- **Why it matters**: A SaaS workflow tool that feels generic erodes user confidence. The product's "professional spec management" positioning is not communicated visually.
- **Severity**: Medium
- **Fix direction**: Define a primary accent color and apply it consistently to: active nav indicator, primary CTA button, readiness score highlights, and link text. Pick a lightweight icon set (e.g., Lucide or Heroicons) and apply it to KPI card labels and nav items.

---

## Top 5 Strengths to Preserve

1. **KPI card sizing and label clarity** — The "84/100 developer readiness" label with its unit is exemplary; it communicates exactly what the number means. Do not reduce label verbosity.

2. **Sessions table column choices** — Phase, Progress %, Readiness, Status, Updated — these six columns correctly model a spec/breakdown workflow view. Adding icons, actions, or grouping is fine; removing them is not.

3. **Semantic HTML structure** — `<main>`, `<header>`, and sidebar `<nav>` landmarks are correctly used. This is a solid accessibility foundation to build on.

4. **Command palette presence** — The ⌘K affordance signals a modern, keyboard-driven workflow. Even if the UI is minimal, the concept is right and should survive any redesign.

5. **Balanced information density** — The dashboard does not feel empty or sparse. Four KPI cards + a sessions table is appropriate density for a dashboard that serves both overview and drill-down needs.

---

## Recommended First Micro-Change

**Add `aria-label` attributes to the search input and to both icon-only buttons.**

This is a single-attribute change per element (4 attributes total), takes under 15 minutes to implement, closes the two highest-severity WCAG failures, and carries zero visual risk. It is the most impactful accessibility fix per minute of effort available in the current codebase.

Implementation requires:
1. `aria-label="Search workspace" (or similar)` on the search `<input>`
2. `aria-label="[descriptive action name]"` on each of the two empty-`innerText` `<button>` elements
3. Verify with keyboard navigation and at least one screen reader (VoiceOver or NVDA)

---

## Do Not Change Yet

**This critique identifies problems; no application source code has been modified.**

The findings above are to be incorporated into the design-system direction and prototype exploration phases before any implementation. Specifically defer:
- Brand color definition (needs design-system phase)
- Nav icon set (needs design-system phase)
- Sessions table structural changes (needs prototype handoff)
- Any layout or visual hierarchy restructuring (needs approved design direction)

The first micro-change above is the only exception — it is low-risk, high-impact, and can proceed without a full design direction.