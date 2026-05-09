# Tasks: Clerk Hobby Auth Migration

## Preflight

- [ ] T001 Read constitution, spec, plan, and specs 004/007 outcomes.
- [ ] T002 Inspect current auth provider, login page, topbar, API client, and
      server routes.
- [ ] T003 Identify all Supabase auth entry points that must stop being primary.

## Clerk Setup

- [ ] T004 Add Clerk client dependencies to the Vite app.
- [ ] T005 Add Clerk environment/config wiring for the app shell.
- [ ] T006 Add Clerk provider at the app root.
- [ ] T007 Replace the custom login page with Clerk sign-in/sign-up flow.
- [ ] T008 Add sign-out and signed-in state handling through Clerk.
- [ ] T009 Add social sign-in for up to three providers.

## Workspace Identity

- [ ] T010 Add organization switcher or equivalent workspace selector.
- [ ] T011 Map the existing workspace shell to Clerk organization context.
- [ ] T012 Keep member/admin roles minimal and explicit.

## Backend Enforcement

- [ ] T013 Add Clerk token verification to API routes.
- [ ] T014 Reject unauthenticated requests on write paths.
- [ ] T015 Add user/org ownership fields where persisted records need scoping.
- [ ] T016 Scope session/project/settings reads and writes to the active org.

## Cleanup

- [ ] T017 Remove Supabase auth from the primary app flow.
- [ ] T018 Remove stale local-session auth persistence.
- [ ] T019 Keep only the minimal fallback/error handling needed.

## Verification

- [ ] T020 Verify Clerk sign-in and sign-out flow.
- [ ] T021 Verify organization switching changes workspace scope.
- [ ] T022 Verify protected API routes reject missing identity.
- [ ] T023 Report deferred Enterprise-only features and why they stay out.
