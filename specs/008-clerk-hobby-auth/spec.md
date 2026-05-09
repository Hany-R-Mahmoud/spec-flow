# Feature Specification: Clerk Hobby Auth Migration

**Feature Branch**: `008-clerk-hobby-auth`  
**Created**: 2026-05-09  
**Status**: Draft  
**Phase**: Authentication foundation, post-`007-collaboration-review`  
**Depends On**: `004-persistence-mvp`

## Goal

Replace the custom Supabase auth shell with Clerk on the Hobby tier only, so
SpecFlow can support social sign-in, workspace organizations, and a cleaner
identity boundary without adopting paid-only enterprise auth features yet.

## User Scenarios

1. As a user, I can sign in with Clerk using a supported social provider or
   email-based Clerk flow.
2. As a workspace member, I can join the correct organization and switch
   between workspaces without losing app state.
3. As an admin, I can invite teammates into a workspace and see basic member
   roles.
4. As the product team, we can protect API routes with Clerk identity and keep
   persisted data scoped to a verified user/org context.

## Requirements

- **FR-001**: Replace the current custom Supabase auth flow with Clerk
  provider-based auth in the React app.
- **FR-002**: Support Clerk prebuilt sign-in and sign-up surfaces or a thin
  wrapper around them, rather than a bespoke auth system.
- **FR-003**: Support up to three social identity providers on the Clerk Hobby
  tier.
- **FR-004**: Use Clerk Organizations for workspace membership, invitations,
  and basic member/admin roles.
- **FR-005**: Bind persisted projects, sessions, settings, and future review
  records to Clerk user and organization identity.
- **FR-006**: Protect API routes with Clerk token verification and reject
  unauthenticated or mismatched-org writes.
- **FR-007**: Replace local auth-session storage with Clerk session state and
  user/org claims.
- **FR-008**: Update the app shell, login route, and account menu to reflect
  Clerk identity and organization switching.
- **FR-009**: Keep the migration limited to Hobby-tier features only.
- **FR-010**: Do not implement enterprise SSO, verified domains, MFA, passkeys,
  satellite domains, or billing in this spec.

## Must Finish

- Clerk provider wired into the Vite app.
- Social sign-in and Clerk auth flow working end to end.
- Organization-aware workspace access and invitations.
- API auth enforcement on backend routes.
- Persisted data scoped to Clerk user/org identity.
- Removal of the Supabase auth dependency from the primary app flow.

## May Defer

- Enterprise SSO through SAML or OIDC.
- Verified domains and automatic domain-based invitations.
- MFA, passkeys, SMS auth, satellite domains, and custom session lifetime.
- Billing, impersonation, and advanced dashboard roles.
- Deep profile customization or custom auth page design.

## Must Not Touch

- AI generation prompts and workflow logic.
- Export integrations.
- Review collaboration behavior beyond identity scoping.
- Broad shell redesign unrelated to auth.
- Any Clerk Enterprise-only feature.

## Failure Conditions

Executor must not report complete if:

- The app still depends on Supabase auth as the primary login path.
- Unauthenticated API requests can still mutate primary data.
- Clerk organization context is missing for workspace-scoped data.
- Enterprise SSO or verified domain behavior is presented as part of the
  Hobby-tier migration.
- Auth state still relies on manual local storage as the source of truth.

## Key Files

- `artifacts/specflow-ai/src/App.tsx`
- `artifacts/specflow-ai/src/components/providers/auth-provider.tsx`
- `artifacts/specflow-ai/src/lib/supabase-auth.ts`
- `artifacts/specflow-ai/src/pages/LoginPage.tsx`
- `artifacts/specflow-ai/src/components/layout/Topbar.tsx`
- `artifacts/api-server/src/routes/index.ts`
- `artifacts/api-server/src/routes/sessions.ts`
- `artifacts/api-server/src/routes/persistence.ts`
- `lib/db/src/schema/index.ts`
- `lib/api-spec/openapi.yaml`
- `lib/api-client-react/src/custom-fetch.ts`
- `lib/api-client-react/src/generated/api.ts`

## Success Criteria

- **SC-001**: Users can sign in with Clerk from the app shell.
- **SC-002**: Social sign-in works within the Hobby-tier limits.
- **SC-003**: Organization membership and workspace switching work.
- **SC-004**: API routes reject missing or invalid Clerk identity.
- **SC-005**: Persisted data is tied to Clerk user/org scope.
- **SC-006**: No Enterprise-only Clerk feature is required to use the app.

## Evidence Required

Executor must report:

1. Clerk packages and provider wiring added.
2. Auth UI and route behavior changed.
3. Backend auth verification and org scoping added.
4. Schema changes for user/org ownership.
5. Remaining Supabase references removed or isolated.
6. Unsupported Clerk features intentionally deferred.

## Executor Handoff

```text
Execute spec 008-clerk-hobby-auth. Read spec.md, plan.md, tasks.md, and the
constitution first. Read specs/004-persistence-mvp and specs/007-collaboration-
review outcomes first. Preserve unrelated changes. Implement Clerk migration on
the Hobby tier only. Use prebuilt auth and organization primitives where
possible. Do not add enterprise SSO, verified domains, MFA, passkeys, billing,
or satellite domains. Report changed files, verification, and any deferred
enterprise-only scope.
```
