# Redesign Phase Feature Catalog

Inventory of the design surfaces explored with Open Design for SpecFlow AI.

## Core Theme System

- `Theme System` - full-app light/dark token system for the Agent Control Room direction.
- `POLISH-ADDENDUM` - final hierarchy fixes for light-mode contrast and dark-mode session card elevation.

## Explored Product Surfaces

- `Agent Dock` - compact collapsed rail with slide-out panel for live agent state, prompt chain, and handoff queue.
- `Command Palette / Action Hub` - `Cmd+K` modal for search, recent items, suggested actions, and keyboard-first commands.
- `Activity Timeline` - compact history view for sessions, agents, reviews, and exports.
- `Review Inbox` - inbox-style review triage surface with filter tabs and inline actions.
- `Empty State System` - reusable empty-state pattern for all major surfaces.
- `Project Switcher` - compact popover for current, pinned, and recent projects.
- `Density Control System` - comfortable and compact spacing modes without changing IA.
- `Notifications Center` - slide-out notification tray for reviews, agents, exports, and session events.
- `Session Inspector` - right-side session detail panel with summary, prompt chain, review status, and outputs.
- `Settings Center` - full-page preferences surface for theme, density, notifications, shortcuts, sessions, and exports.

## Current Status

- The theme system is polished and tracked in repo.
- The explored feature surfaces are defined enough to guide implementation.
- No app code has been changed yet in this phase.

## Handoff Rule

When a new Open Design exploration lands, copy its final `DESIGN.md`, preview HTML, and handover summary into this folder or a child folder before moving on.
