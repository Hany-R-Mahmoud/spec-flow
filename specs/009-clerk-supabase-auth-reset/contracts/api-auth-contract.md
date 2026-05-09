# API Auth Contract

## Runtime Boundary

All `/api/*` routes are protected except:

```text
GET /api/healthz
```

Protected routes require a valid Clerk session token.

## Request Header

```http
Authorization: Bearer <clerk-session-token>
```

## Error Responses

### 401 Unauthorized

Use when request lacks a valid authenticated Clerk session.

```json
{
  "message": "Unauthorized."
}
```

### 403 Forbidden

Use when request is authenticated but actor lacks required workspace role.

```json
{
  "message": "Forbidden."
}
```

### 500 Unexpected Server Error

Use generic response body. Internal details go to logs.

```json
{
  "message": "Unexpected server error."
}
```

## OpenAPI Requirements

`lib/api-spec/openapi.yaml` must define:

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

Every protected operation must include:

```yaml
security:
  - bearerAuth: []
responses:
  "401":
    $ref: "#/components/responses/Unauthorized"
  "403":
    $ref: "#/components/responses/Forbidden"
```

`GET /healthz` must remain public and should not require `bearerAuth`.

## Client Requirements

The generated client may keep a module-level token getter, but behavior must be
explicit:

- No token getter configured and protected route called: fail locally with an
  auth configuration error.
- Token getter configured but returns null: fail locally with token unavailable.
- Token exists: send `Authorization: Bearer <token>`.
- Explicit `Authorization` header supplied: respect caller header.

## Protected Route Groups

Protected read/write:

- `/projects`
- `/projects/{projectId}`
- `/sessions`
- `/sessions/{sessionId}`
- `/sessions/{sessionId}/artifacts`
- generation routes
- `/settings`
- `/export-packages`
- `/export-packages/{id}`
- `/integrations/config`

Admin/owner required:

- `PUT /settings`
- `PUT /integrations/config/{type}`
- future invite/member management routes

## Verification Matrix

| Request | Expected |
|---------|----------|
| `GET /api/healthz` without token | `200` |
| `GET /api/sessions` without token | `401` |
| `GET /api/sessions` with invalid token | `401` |
| `GET /api/sessions` with valid token | `200` scoped to workspace |
| `PUT /api/settings` as org member | `403` |
| `PUT /api/settings` as org admin | `200` |
| `PUT /api/integrations/config/jira` as org member | `403` |
| `GET /api/integrations/config` as member | `200`, no secret values |
