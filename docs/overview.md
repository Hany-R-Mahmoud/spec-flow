# Overview

## Purpose

SpecFlow AI turns rough product input into structured breakdowns, stories,
review output, and export-ready handoff.

## Users / Use Cases

- Product managers shaping vague ideas into usable delivery artifacts
- Design and engineering teams reviewing scope, warnings, and readiness before
  handoff
- Teams exporting approved work into downstream delivery tools

## Runtime Components

- `artifacts/specflow-ai/`: React + Vite app for landing, login, dashboard,
  workflow, review, export, and settings screens
- `artifacts/api-server/`: Express 5 API for auth-scoped behavior, persistence,
  generation, and exports
- `lib/api-spec/`: OpenAPI source used for code generation
- `lib/api-client-react/`: generated React client for API calls
- `lib/api-zod/`: generated Zod contracts and shared response types
- `lib/db/`: Drizzle schema, SQL audit/hardening scripts, and database helpers

## Boundaries And Integrations

- Clerk handles authentication
- Supabase Postgres backs persistence
- Vercel hosts the deployed app and runtime routing
- Jira and GitHub exports are present in the product flow, but the exact
  production configuration is `Unknown / verify`

## Unknowns

- `Unknown / verify`: whether the app and API always deploy together or can be
  split into separate production projects
- `Unknown / verify`: which environments have live Jira and GitHub export
  credentials configured
