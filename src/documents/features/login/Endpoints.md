# Login — endpoints

## `POST /auth/login`

Authenticate with email and password under a tenant or portal host.

| | |
|---|---|
| **Host** | `{tenant}.BASE_DOMAIN` or `{portal}.{tenant}.BASE_DOMAIN` |
| **Auth** | None |
| **Guards** | `RequireTenantGuard` |

### Request body

| Field | Type | Required |
|-------|------|----------|
| `email` | string | Yes |
| `password` | string | Yes (8–72 chars) |

```json
{
  "email": "mod@acme.com",
  "password": "password123"
}
```

### Headers

| Header | Example | Required |
|--------|---------|----------|
| `Host` | `north.acme.localhost` | Yes (for subdomain routing) |

### Success — `200 OK`

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJ...",
    "user": { "id": "uuid", "email": "mod@acme.com" },
    "tenant": {
      "id": "uuid",
      "name": "Acme Corp",
      "domainSlug": "acme"
    },
    "portal": {
      "id": "uuid",
      "slug": "north",
      "host": "north.acme.localhost"
    },
    "role": "moderator"
  }
}
```

`portal` is `null` when logging in on the tenant root (admin).

### JWT payload

```json
{
  "sub": "user-uuid",
  "email": "mod@acme.com",
  "tenant_id": "tenant-uuid",
  "portal_id": "portal-uuid",
  "role": "moderator"
}
```

### Errors

| Status | Condition |
|--------|-----------|
| `400` | Validation failed |
| `401` | Invalid email or password |
| `401` | Not a member of this tenant |
| `403` | Role not allowed on this host |
| `403` | Member portal does not match host |
| `404` | Tenant not found for host |

### Examples

**Admin (tenant root):**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -H "Host: acme.localhost" \
  -d '{"email":"admin@acme.com","password":"password123"}'
```

**Moderator (portal):**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -H "Host: north.acme.localhost" \
  -d '{"email":"mod@acme.com","password":"password123"}'
```

Bruno: `src/AuthApp/Login.yml`
