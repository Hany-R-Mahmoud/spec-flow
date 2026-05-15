# Manus Project Brief: SpecFlow AI

Use this brief as the first context block before asking Manus to research,
critique, or generate artifacts for this project.

## Product

SpecFlow AI turns rough product input into structured delivery artifacts. The
core promise is moving from a messy idea, brief, or notes into review-ready
PRD sections, epics, stories, quality warnings, and export-ready handoff.

## Primary Users

- Product managers shaping vague ideas into usable delivery work
- Design and engineering teams reviewing scope, quality, and handoff readiness
- Delivery teams exporting approved work into downstream tools such as Jira or
  GitHub

## Current Flow

1. User starts a breakdown from rough notes or a brief.
2. The app captures project input: goals, users, labels, constraints, and
   context.
3. Generation creates clarification questions, PRD sections, epics, stories,
   and quality review output.
4. The team reviews and refines the generated artifacts.
5. Approved work becomes export-ready for downstream delivery tools.

## Repository Shape

- `artifacts/specflow-ai`: React + Vite product app and landing page
- `artifacts/api-server`: Express API for auth-scoped behavior, persistence,
  generation, settings, exports, and integrations
- `lib/api-spec`: OpenAPI source contract
- `lib/api-client-react`: generated React API client
- `lib/api-zod`: generated Zod schemas and shared response types
- `lib/db`: Drizzle schema, database helpers, and SQL hardening/audit scripts
- `docs`: durable project documentation
- `specs`: spec-kit feature plans, tasks, research, and handoff docs

## Technical Context

- Frontend: React, Vite, TypeScript, Wouter, TanStack Query, Tailwind CSS,
  Radix UI, Framer Motion
- Backend: Express 5, TypeScript, Pino, CORS, Cookie Parser
- Auth: Clerk
- Data: Supabase Postgres, Drizzle ORM, Zod
- Contracts: OpenAPI, generated React client, generated Zod types
- Tooling: pnpm workspace, TypeScript project references, Prettier, Graphify
- Deploy: Vercel

## High-Value Product Areas

- Workflow generation quality
- Product onboarding and first-run clarity
- Review and quality warning usefulness
- Export readiness for Jira/GitHub handoff
- Competitive positioning against product/spec/story tools
- Demo material that proves the product in realistic scenarios

## Current Known Risks

- Generated packages must stay in sync with `lib/api-spec/openapi.yaml`.
- Auth, workspace IDs, and persistence are tightly linked.
- Generation and persistence are high-risk areas because changes can affect the
  whole workflow.
- Jira/GitHub production configuration must be verified per environment.
- Manus should not make repo code edits directly unless explicitly asked.

## How Manus Should Help

Manus should act as an external analyst, product researcher, UX reviewer, and
artifact generator. Codex should remain the repo implementation agent.

Good Manus outputs:

- Evidence-backed competitor research
- UX teardown with prioritized issues
- Realistic workflow input/output fixtures
- Demo briefs, launch copy, decks, and stakeholder material
- Jira/GitHub integration behavior research
- Clear recommendations with assumptions and open questions

Bad Manus outputs:

- Unsourced claims
- Repo code changes without local context
- Vague advice without priorities
- Large feature proposals detached from current workflow
- Secrets, fake API credentials, or invented integrations

## Required Output Style

When responding, Manus should provide:

1. Executive summary.
2. Findings grouped by priority.
3. Evidence, links, screenshots, or examples where available.
4. Specific recommendations for SpecFlow AI.
5. Risks and unknowns labeled `Unknown / verify`.
6. A final implementation handoff that Codex can turn into specs or code.

