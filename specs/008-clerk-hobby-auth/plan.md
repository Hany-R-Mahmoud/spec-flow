# Implementation Plan: Clerk Hobby Auth Migration

## Summary

Swap the app's custom Supabase auth shell for Clerk on the Hobby tier, keeping
the scope intentionally small: social login, organization membership, and API
identity enforcement. The migration should improve product readiness without
pulling in Clerk Enterprise features that the team is not ready to pay for.

## Architecture Decisions

1. Clerk becomes the primary auth provider for the React app.
2. App identity comes from Clerk session/user/org claims, not local storage.
3. Existing product routes stay in place; only auth gating changes.
4. Backend routes verify Clerk tokens and scope writes by user/org identity.
5. Workspace membership maps to Clerk Organizations with basic member/admin
   roles.
6. Enterprise-only Clerk features stay out of scope until a later spec.

## Sequence

1. Add Clerk dependencies, env wiring, and provider setup.
2. Replace custom login/session handling with Clerk auth surfaces.
3. Add organization switcher and workspace-aware account menu.
4. Verify auth on backend routes and attach user/org ownership to records.
5. Remove Supabase auth from the primary app path.
6. Keep loading, signed-out, and org-switching states clear.

## Validation

- App boots with Clerk provider enabled.
- Sign in and sign out work from the login route.
- Social sign-in works with at least one configured provider.
- Organization switcher changes active workspace context.
- Protected API routes reject unauthenticated requests.
- Persisted writes are scoped to the active Clerk user/org.

## Constitution Check

- Simplicity: PASS. Use Clerk prebuilt auth and org primitives.
- TypeScript and schema discipline: PASS. Reuse shared schema/types for org and
  owner fields.
- Accessible product quality: PASS. Keep auth states and menu controls usable
  with keyboard and screen readers.
- Security and trust boundaries: PASS. Verify Clerk identity at the API layer.
- Surgical workflow: PASS. Leave AI, export, and review features alone.
