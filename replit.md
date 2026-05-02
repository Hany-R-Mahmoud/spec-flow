# SpecFlow AI

A polished, production-style SaaS prototype for Product Managers. Converts rough product ideas into Jira-ready epics and user stories via an 8-phase guided AI workflow.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4 with custom design tokens (Product Ops Console aesthetic)
- shadcn/ui component library
- Wouter (routing)
- React Hook Form + Zod (form validation)
- React Context + useReducer (state management — no external store library)
- All AI behavior is deterministic mocks (no real API calls)

## Architecture

```
artifacts/specflow-ai/src/
├── App.tsx                          # Root app with routes + providers
├── index.css                        # Full design token system (light + dark)
├── lib/
│   ├── types.ts                     # All TypeScript types
│   ├── sample-data.ts               # Complete mock data (4 sessions, 4 epics, 12 stories)
│   ├── mock-ai.ts                   # Deterministic AI stubs
│   └── utils.ts
├── store/
│   └── session-store.tsx            # SessionContext with useReducer
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx             # Main layout wrapper
│   │   ├── Sidebar.tsx              # Nav sidebar
│   │   └── Topbar.tsx              # Top nav bar
│   ├── shared/
│   │   ├── StatusBadge.tsx          # ReviewStatusBadge + PhaseStatusBadge
│   │   ├── PriorityBadge.tsx        # P0/P1/P2/P3 badges
│   │   ├── WarningBadge.tsx         # Quality warning badges
│   │   ├── ReadinessScore.tsx       # SVG ring + badge variants
│   │   └── ScoreBar.tsx             # Horizontal score bar
│   ├── workspace/
│   │   ├── PhaseTracker.tsx         # 8-phase tab nav with status indicators
│   │   ├── GuidancePanel.tsx        # Right-side AI guidance panel
│   │   ├── ClarificationPanel.tsx   # Grouped Q&A with skip support
│   │   ├── PRDPanel.tsx             # Inline edit PRD sections
│   │   ├── EpicsPanel.tsx           # Collapsible epics with Jira copy
│   │   ├── StoriesPanel.tsx         # Full story cards with score breakdown
│   │   ├── QualityReviewPanel.tsx   # Score matrix + per-story actions
│   │   ├── DeveloperReviewPanel.tsx # Split-pane review submission
│   │   └── ExportPanel.tsx          # Markdown/CSV/JSON export with copy
│   └── ui/                          # shadcn/ui components
└── pages/
    ├── Dashboard.tsx                # Overview with stats, sessions, review queue
    ├── NewBreakdown.tsx             # Intake form (6 input types, output depth)
    ├── WorkflowWorkspace.tsx        # 8-phase workspace orchestrator
    ├── ReviewsPage.tsx              # Cross-project review queue table
    ├── ExportsPage.tsx              # Export history table
    └── SettingsPage.tsx             # Workspace + workflow preferences
```

## Workflow Phases

1. **Intake** — project name, input type, output depth, raw product input
2. **Clarification** — 22 grouped questions (required/optional, skip with risk)
3. **PRD** — 12 sections with inline editing and completion tracking
4. **Epics** — 4 epics with business objective, scope, PRD refs, risks
5. **Stories** — 12 detailed stories with full metadata (ACs, edge cases, analytics, design, QA, tech notes)
6. **Quality Review** — score matrix (7 dimensions), warnings, suggested actions
7. **Developer Review** — split-pane review form with status taxonomy
8. **Jira Export** — Markdown/CSV/JSON tabs with per-epic copy and download

## Readiness Score

7 dimensions, total 100 points:
- Clarity (20), Acceptance Criteria (20), Business Alignment (15), Technical Feasibility (15), Testability (10), Edge Cases & Error Handling (10), Dependencies/Design/L10n (10)

Labels: Ready for Jira (≥90), Minor review needed (≥75), Needs PM refinement (≥60), Not ready (<60)

## Mock Data

- 4 project sessions at different phases (Stories, Epics, Clarification, PRD)
- 4 epics (Team Invitation, RBAC, Member Admin, Lifecycle/Edge Cases)
- 12 fully-specified user stories (TAM-001 through TAM-012)
- 22 clarification questions across 8 groups
- 12 PRD sections
- 5 export packages

## Routes

- `/` — Dashboard
- `/new` — New Breakdown intake form
- `/workspace/:id` — 8-phase workflow workspace
- `/reviews` — Cross-project review queue
- `/exports` — Export history
- `/settings` — Workspace settings
