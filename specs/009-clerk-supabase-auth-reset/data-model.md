# Data Model: Clerk-Supabase Auth Reset

## Auth Context

Resolved per protected API request from Clerk.

```ts
type WorkspaceAuthContext = {
  actorUserId: string;
  workspaceId: string;
  workspaceType: "personal" | "organization";
  orgId: string | null;
  orgRole: string | null;
  canManageWorkspace: boolean;
};
```

### Rules

- `actorUserId` must always come from Clerk `userId`.
- Personal workspace:
  - `workspaceType = "personal"`
  - `workspaceId = "personal:" + actorUserId`
  - `orgId = null`
  - `canManageWorkspace = true`
- Organization workspace:
  - `workspaceType = "organization"`
  - `workspaceId = "org:" + orgId`
  - `orgId` must be non-null
  - `orgRole` must come from Clerk active organization claims/auth object
  - `canManageWorkspace` is true only for allowed admin/owner roles

## Workspace-Owned Tables

Current tables that must be workspace scoped:

- `projects`
- `sessions`
- `workflow_artifacts`
- `settings`
- `export_packages`
- `export_items`
- `integration_config`

### Required ownership fields

At minimum each table needs:

```text
workspace_id text not null
```

Recommended for clearer auditing:

```text
workspace_id text not null
workspace_type text not null
clerk_user_id text not null
clerk_org_id text null
```

### Constraints

- Remove `default("")` from every workspace ownership column.
- Add indexes for frequent access:
  - `projects(workspace_id)`
  - `sessions(workspace_id, id)`
  - `workflow_artifacts(workspace_id, session_id)`
  - `settings(workspace_id, id)`
  - `export_packages(workspace_id, id)`
  - `export_items(workspace_id, export_package_id)`
  - `integration_config(workspace_id, integration_type)`
- Add unique constraints where expected:
  - one settings row per workspace
  - one integration config row per workspace and integration type

## Integration Secrets

Current raw config shape mixes non-secret metadata and credentials:

```ts
type IntegrationConfig = {
  domain?: string;
  email?: string;
  apiToken?: string;
  owner?: string;
  repo?: string;
  token?: string;
};
```

Reset shape should separate safe metadata from secret material:

```ts
type IntegrationConfigPublic = {
  id: string;
  integrationType: "jira" | "github";
  enabled: boolean;
  configured: boolean;
  metadata: Record<string, string>;
};

type IntegrationSecretWrite = {
  integrationType: "jira" | "github";
  secret: string;
};
```

### Rules

- API responses never include `apiToken`, `token`, or encrypted secret values.
- Secret values require admin/owner authorization to write, rotate, or clear.
- If encryption is used, key must come from server-only env.
- If secret store is unavailable, secret write returns setup error; it does not
  store plaintext silently.

## Migration Notes

Executor must inspect current database state before writing migration. Options:

1. If data is only demo/local, migrate existing `workspace_id = user_<id>` rows
   to `workspace_id = personal:user_<id>` where safe.
2. If production-like data exists, add temporary compatibility read for old
   workspace IDs only during a bounded migration, then remove it before marking
   spec complete.
3. Never create new rows with empty workspace IDs.

## Out Of Scope

- Supabase Auth user tables.
- Supabase RLS policy authoring.
- Billing ownership.
- Enterprise SSO identities.
